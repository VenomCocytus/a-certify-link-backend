"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("@utils/logger");
const requestLoggerMiddleware = (req, res, next) => {
    // Generate unique request ID
    req.requestId = (0, uuid_1.v4)();
    req.startTime = Date.now();
    // Add request ID to response headers
    res.set('X-Request-ID', req.requestId);
    // Log request start
    logger_1.logger.info('Request started', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
    });
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body) {
        const responseTime = Date.now() - req.startTime;
        logger_1.logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            contentLength: JSON.stringify(body).length,
            userId: req.user?.id,
        });
        return originalJson.call(this, body);
    };
    // Override res.send to log response
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - req.startTime;
        logger_1.logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            contentLength: typeof body === 'string' ? body.length : JSON.stringify(body).length,
            userId: req.user?.id,
        });
        return originalSend.call(this, body);
    };
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
//# sourceMappingURL=requestLogger.middleware.js.map