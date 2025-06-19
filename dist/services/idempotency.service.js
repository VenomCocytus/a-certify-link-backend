"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const models_1 = require("@/models");
const logger_1 = require("@utils/logger");
const uuid_1 = require("uuid");
class IdempotencyService {
    /**
     * Process idempotent request
     */
    async processIdempotentRequest(key, requestHash, requestFn) {
        // Check if a request with this key already exists
        const existingKey = await models_1.IdempotencyKey.findOne({
            where: { key },
        });
        if (existingKey) {
            // Verify request hash matches
            if (existingKey.request_hash !== requestHash) {
                throw new Error('Idempotency key has been used with a different request');
            }
            // If completed, return a cached response
            if (existingKey.status === 'completed' && existingKey.response_body) {
                logger_1.logger.info('Returning cached response for idempotency key', { key });
                return existingKey.response_body;
            }
            // If still pending, reject
            if (existingKey.status === 'pending') {
                throw new Error('Request with this idempotency key is already being processed');
            }
            // If failed, allow retry
            if (existingKey.status === 'failed') {
                await this.updateIdempotencyStatus(key, 'pending');
            }
        }
        else {
            // Create a new idempotency key record
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry
            await models_1.IdempotencyKey.create({
                key,
                status: 'pending',
                request_hash: requestHash,
                request_path: '', // Would be set by middleware
                request_method: 'POST', // Would be set by middleware
                expires_at: expiresAt,
            });
        }
        try {
            // Execute the request function
            const result = await requestFn();
            // Cache the successful response
            await this.updateIdempotencyStatus(key, 'completed', result);
            return result;
        }
        catch (error) {
            // Mark as failed
            await this.updateIdempotencyStatus(key, 'failed');
            throw error;
        }
    }
    /**
     * Get idempotency status
     */
    async getIdempotencyStatus(key) {
        const idempotencyKey = await models_1.IdempotencyKey.findOne({
            where: { key },
        });
        if (!idempotencyKey) {
            return null;
        }
        return {
            status: idempotencyKey.status,
            response: idempotencyKey.response_body,
        };
    }
    /**
     * Clean up expired keys
     */
    async cleanupExpiredKeys() {
        try {
            const deletedCount = await models_1.IdempotencyKey.destroy({
                where: {
                    expires_at: {
                        lt: new Date(),
                    },
                },
            });
            if (deletedCount > 0) {
                logger_1.logger.info(`Cleaned up ${deletedCount} expired idempotency keys`);
            }
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup expired idempotency keys:', error);
            return 0;
        }
    }
    /**
     * Generate an idempotency key
     */
    generateIdempotencyKey() {
        return (0, uuid_1.v4)();
    }
    // Private helper methods
    async updateIdempotencyStatus(key, status, response) {
        try {
            await models_1.IdempotencyKey.update({
                status,
                response_body: response || null,
            }, {
                where: { key },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update idempotency status:', error);
        }
    }
}
exports.IdempotencyService = IdempotencyService;
//# sourceMappingURL=idempotency.service.js.map