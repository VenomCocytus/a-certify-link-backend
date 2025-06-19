"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = void 0;
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("@/models");
const logger_1 = require("@utils/logger");
const idempotencyMiddleware = (options = {}) => {
    const headerName = options.headerName || 'Idempotency-Key';
    const ttlHours = options.ttlHours || 24;
    return async (req, res, next) => {
        try {
            const idempotencyKey = req.headers[headerName.toLowerCase()];
            if (!idempotencyKey) {
                // Idempotency key is optional for GET requests
                if (req.method === 'GET') {
                    next();
                    return;
                }
                res.status(400).json({
                    type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
                    title: 'Missing Idempotency Key',
                    status: 400,
                    detail: `${headerName} header is required for ${req.method} requests`,
                    instance: req.originalUrl,
                });
                return;
            }
            // Generate request hash
            const requestBody = JSON.stringify(req.body) || '';
            const requestHash = crypto_1.default
                .createHash('sha256')
                .update(`${req.method}${req.originalUrl}${requestBody}`)
                .digest('hex');
            // Check if idempotency key exists
            const existingKey = await models_1.IdempotencyKey.findOne({
                where: { key: idempotencyKey },
            });
            if (existingKey) {
                // Verify request hash matches
                if (existingKey.request_hash !== requestHash) {
                    res.status(422).json({
                        type: 'https://tools.ietf.org/html/rfc4918#section-11.2',
                        title: 'Idempotency Key Mismatch',
                        status: 422,
                        detail: 'The provided idempotency key has been used with a different request',
                        instance: req.originalUrl,
                    });
                    return;
                }
                // Check if request is completed
                if (existingKey.status === 'completed') {
                    logger_1.logger.info('Returning cached response for idempotency key', {
                        idempotencyKey,
                        status: existingKey.response_status,
                    });
                    req.isIdempotentReplay = true;
                    res.status(existingKey.response_status || 200).json(existingKey.response_body);
                    return;
                }
                // Check if request is still pending
                if (existingKey.status === 'pending') {
                    res.status(409).json({
                        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
                        title: 'Request In Progress',
                        status: 409,
                        detail: 'A request with this idempotency key is already being processed',
                        instance: req.originalUrl,
                    });
                    return;
                }
            }
            else {
                // Create new idempotency key record
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + ttlHours);
                await models_1.IdempotencyKey.create({
                    key: idempotencyKey,
                    status: 'pending',
                    request_hash: requestHash,
                    request_path: req.originalUrl,
                    request_method: req.method,
                    user_id: req.user?.id || null,
                    expires_at: expiresAt,
                });
            }
            // Store idempotency key in request for later use
            req.idempotencyKey = idempotencyKey;
            // Override response methods to cache the response
            const originalJson = res.json;
            const originalSend = res.send;
            res.json = function (body) {
                cacheResponse(idempotencyKey, res.statusCode, body);
                return originalJson.call(this, body);
            };
            res.send = function (body) {
                cacheResponse(idempotencyKey, res.statusCode, body);
                return originalSend.call(this, body);
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Idempotency middleware error:', error);
            next(error);
        }
    };
};
exports.idempotencyMiddleware = idempotencyMiddleware;
async function cacheResponse(idempotencyKey, statusCode, responseBody) {
    try {
        await models_1.IdempotencyKey.update({
            status: 'completed',
            response_status: statusCode,
            response_body: responseBody,
        }, {
            where: { key: idempotencyKey },
        });
        logger_1.logger.debug('Cached response for idempotency key', {
            idempotencyKey,
            statusCode,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to cache idempotent response:', error);
    }
}
//# sourceMappingURL=idempotency.middleware.js.map