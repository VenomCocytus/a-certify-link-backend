import { IdempotencyServiceInterface } from '../interfaces/serviceInterfaces';
import { IdempotencyKey } from '@/models';
import { logger } from '@utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class IdempotencyService implements IdempotencyServiceInterface {
    /**
     * Process idempotent request
     */
    async processIdempotentRequest<T>(
        key: string,
        requestHash: string,
        requestFn: () => Promise<T>
    ): Promise<T> {
        // Check if a request with this key already exists
        const existingKey = await IdempotencyKey.findOne({
            where: { key },
        });

        if (existingKey) {
            // Verify request hash matches
            if (existingKey.request_hash !== requestHash) {
                throw new Error('Idempotency key has been used with a different request');
            }

            // If completed, return a cached response
            if (existingKey.status === 'completed' && existingKey.response_body) {
                logger.info('Returning cached response for idempotency key', { key });
                return existingKey.response_body as T;
            }

            // If still pending, reject
            if (existingKey.status === 'pending') {
                throw new Error('Request with this idempotency key is already being processed');
            }

            // If failed, allow retry
            if (existingKey.status === 'failed') {
                await this.updateIdempotencyStatus(key, 'pending');
            }
        } else {
            // Create a new idempotency key record
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

            await IdempotencyKey.create({
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
        } catch (error) {
            // Mark as failed
            await this.updateIdempotencyStatus(key, 'failed');
            throw error;
        }
    }

    /**
     * Get idempotency status
     */
    async getIdempotencyStatus(key: string): Promise<{ status: string; response?: unknown } | null> {
        const idempotencyKey = await IdempotencyKey.findOne({
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
    async cleanupExpiredKeys(): Promise<number> {
        try {
            const deletedCount = await IdempotencyKey.destroy({
                where: {
                    expires_at: {
                        lt: new Date(),
                    },
                },
            });

            if (deletedCount > 0) {
                logger.info(`Cleaned up ${deletedCount} expired idempotency keys`);
            }

            return deletedCount;
        } catch (error) {
            logger.error('Failed to cleanup expired idempotency keys:', error);
            return 0;
        }
    }

    /**
     * Generate an idempotency key
     */
    generateIdempotencyKey(): string {
        return uuidv4();
    }

    // Private helper methods

    private async updateIdempotencyStatus(
        key: string,
        status: 'pending' | 'completed' | 'failed',
        response?: unknown
    ): Promise<void> {
        try {
            await IdempotencyKey.update(
                {
                    status,
                    response_body: response || null,
                },
                {
                    where: { key },
                }
            );
        } catch (error) {
            logger.error('Failed to update idempotency status:', error);
        }
    }
}