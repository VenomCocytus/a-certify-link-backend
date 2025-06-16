import {Op, Transaction} from 'sequelize';
import {BaseRepository} from './baseRepository';
import {IdempotencyRepositoryInterface} from '@interfaces/repositoryInterfaces';
import {IdempotencyKey, IdempotencyKeyModel} from '@/models';
import {logger} from '@utils/logger';

export class IdempotencyRepository extends BaseRepository<IdempotencyKeyModel> implements IdempotencyRepositoryInterface {
    constructor() {
        super(IdempotencyKey);
    }

    /**
     * Find an idempotency key by key value
     */
    async findByKey(key: string, transaction?: Transaction): Promise<IdempotencyKeyModel | null> {
        try {
            return await this.model.findOne({
                where: {key},
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding idempotency key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Create or update idempotency key
     */
    async createOrUpdate(
        data: {
            key: string;
            status: 'pending' | 'completed' | 'failed';
            requestHash: string;
            response?: unknown;
            expiresAt: Date;
        },
        transaction?: Transaction
    ): Promise<IdempotencyKeyModel> {
        try {
            const existing = await this.findByKey(data.key, transaction);

            if (existing) {
                // Update existing record
                const updated = await this.update(existing.id, {
                    status: data.status,
                    response_body: data.response || existing.response_body,
                }, transaction);

                if (!updated) {
                    throw new Error('Failed to update idempotency key');
                }

                return updated;
            } else {
                // Create a new record
                return this.create({
                    key: data.key,
                    status: data.status,
                    request_hash: data.requestHash,
                    request_path: '',
                    request_method: 'POST',
                    response_body: data.response || null,
                    expires_at: data.expiresAt,
                }, transaction);
            }
        } catch (error) {
            logger.error(`Error creating or updating idempotency key ${data.key}:`, error);
            throw error;
        }
    }

    /**
     * Delete expired idempotency keys
     */
    async deleteExpired(beforeDate: Date, transaction?: Transaction): Promise<number> {
        try {
            const deletedCount = await this.model.destroy({
                where: {
                    expires_at: { [Op.lt]: beforeDate },
                },
                transaction,
            });

            if (deletedCount > 0) {
                logger.info(`Deleted ${deletedCount} expired idempotency keys`);
            }

            return deletedCount;
        } catch (error) {
            logger.error('Error deleting expired idempotency keys:', error);
            throw error;
        }
    }

    /**
     * Find expired idempotency keys
     */
    async findExpired(beforeDate: Date, transaction?: Transaction): Promise<IdempotencyKeyModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    expires_at: {[Op.lt]: beforeDate},
                },
                order: [['expires_at', 'ASC']],
                transaction,
            });
        } catch (error) {
            logger.error('Error finding expired idempotency keys:', error);
            throw error;
        }
    }

    /**
     * Find idempotency keys by status
     */
    async findByStatus(
        status: 'pending' | 'completed' | 'failed',
        transaction?: Transaction
    ): Promise<IdempotencyKeyModel[]> {
        try {
            return await this.model.findAll({
                where: {status},
                order: [['created_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding idempotency keys by status ${status}:`, error);
            throw error;
        }
    }

    /**
     * Get idempotency statistics
     */
    async getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        expiredCount: number;
    }> {
        try {
            const total = await this.count();

            // Count by status
            const statusCounts = await this.model.findAll({
                attributes: [
                    'status',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
                ],
                group: ['status'],
                raw: true,
            }) as any[];

            const byStatus: Record<string, number> = {};
            statusCounts.forEach((row: any) => {
                byStatus[row.status] = parseInt(row.count, 10);
            });

            // Count expired keys
            const expiredCount = await this.count({
                expires_at: { [Op.lt]: new Date() },
            });

            return {
                total,
                byStatus,
                expiredCount,
            };
        } catch (error) {
            logger.error('Error getting idempotency statistics:', error);
            throw error;
        }
    }
}