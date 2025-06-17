import { Transaction, Op } from 'sequelize';
import { BaseRepository } from './base.repository';
import { AuditRepositoryInterface, FindAndCountAllOptions } from '@interfaces/repositoryInterfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
import { CertificateAuditLog, CertificateAuditLogModel, User, Certificate } from '@/models';
import { logger } from '@utils/logger';

export class AuditRepository extends BaseRepository<CertificateAuditLogModel> implements AuditRepositoryInterface {
    constructor() {
        super(CertificateAuditLog);
    }

    /**
     * Find audit logs by resource ID
     */
    async findByResourceId(
        resourceId: string,
        options?: FindAndCountAllOptions<CertificateAuditLogModel>
    ): Promise<PaginatedResponse<CertificateAuditLogModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateAuditLogModel> = {
                where: { certificate_id: resourceId },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error(`Error finding audit logs by resource ID ${resourceId}:`, error);
            throw error;
        }
    }

    /**
     * Find audit logs by user ID
     */
    async findByUserId(
        userId: string,
        options?: FindAndCountAllOptions<CertificateAuditLogModel>
    ): Promise<PaginatedResponse<CertificateAuditLogModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateAuditLogModel> = {
                where: { user_id: userId },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error(`Error finding audit logs by user ID ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Find audit logs by action
     */
    async findByAction(
        action: string,
        options?: FindAndCountAllOptions<CertificateAuditLogModel>
    ): Promise<PaginatedResponse<CertificateAuditLogModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateAuditLogModel> = {
                where: { action },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error(`Error finding audit logs by action ${action}:`, error);
            throw error;
        }
    }

    /**
     * Find audit logs by date range
     */
    async findByDateRange(
        startDate: Date,
        endDate: Date,
        options?: FindAndCountAllOptions<CertificateAuditLogModel>
    ): Promise<PaginatedResponse<CertificateAuditLogModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateAuditLogModel> = {
                where: {
                    timestamp: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error('Error finding audit logs by date range:', error);
            throw error;
        }
    }

    /**
     * Create audit log entry
     */
    async createAuditLog(
        data: {
            userId: string;
            action: string;
            resourceType: string;
            resourceId: string;
            oldValues?: Record<string, unknown>;
            newValues?: Record<string, unknown>;
            metadata?: Record<string, unknown>;
        },
        transaction?: Transaction
    ): Promise<CertificateAuditLogModel> {
        try {
            const auditData = {
                certificateId: data.resourceId,
                userId: data.userId,
                action: data.action as any,
                oldValues: data.oldValues || null,
                newValues: data.newValues || null,
                details: data.metadata || null,
                timestamp: new Date(),
            };

            return this.create(auditData, transaction);
        } catch (error) {
            logger.error('Error creating audit log:', error);
            throw error;
        }
    }

    /**
     * Get audit summary statistics
     */
    async getAuditSummary(
        startDate?: Date,
        endDate?: Date,
        userId?: string
    ): Promise<{
        totalActions: number;
        actionsByType: Record<string, number>;
        userActivity: Array<{ userId: string; userName: string; actionCount: number }>;
        recentActivity: Array<{ date: string; actionCount: number }>;
    }> {
        try {
            const whereClause: any = {};

            if (startDate || endDate) {
                whereClause.timestamp = {};
                if (startDate) {
                    whereClause.timestamp[Op.gte] = startDate;
                }
                if (endDate) {
                    whereClause.timestamp[Op.lte] = endDate;
                }
            }

            if (userId) {
                whereClause.user_id = userId;
            }

            // Total actions
            const totalActions = await this.count(whereClause);

            // Actions by type
            const actionCounts = await this.model.findAll({
                attributes: [
                    'action',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
                ],
                where: whereClause,
                group: ['action'],
                raw: true,
            }) as any[];

            const actionsByType: Record<string, number> = {};
            actionCounts.forEach((row: any) => {
                actionsByType[row.action] = parseInt(row.count, 10);
            });

            // User activity (top 10 active users)
            const userActivity = await this.model.findAll({
                attributes: [
                    'user_id',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('CertificateAuditLog.id')), 'actionCount'],
                ],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email'],
                    },
                ],
                where: whereClause,
                group: ['user_id', 'user.id'],
                order: [[this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('CertificateAuditLog.id')), 'DESC']],
                limit: 10,
            }) as any[];

            const userActivityMapped = userActivity.map((row: any) => ({
                userId: row.user_id,
                userName: `${row.user.first_name} ${row.user.last_name}`,
                actionCount: parseInt(row.dataValues.actionCount, 10),
            }));

            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentActivityQuery = {
                ...whereClause,
                timestamp: { [Op.gte]: sevenDaysAgo },
            };

            const recentActivity = await this.model.findAll({
                attributes: [
                    [this.model.sequelize!.fn('DATE', this.model.sequelize!.col('timestamp')), 'date'],
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'actionCount'],
                ],
                where: recentActivityQuery,
                group: [this.model.sequelize!.fn('DATE', this.model.sequelize!.col('timestamp'))],
                order: [[this.model.sequelize!.fn('DATE', this.model.sequelize!.col('timestamp')), 'ASC']],
                raw: true,
            }) as any[];

            const recentActivityMapped = recentActivity.map((row: any) => ({
                date: row.date,
                actionCount: parseInt(row.actionCount, 10),
            }));

            return {
                totalActions,
                actionsByType,
                userActivity: userActivityMapped,
                recentActivity: recentActivityMapped,
            };
        } catch (error) {
            logger.error('Error getting audit summary:', error);
            throw error;
        }
    }

    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(olderThanDays: number, transaction?: Transaction): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const deletedCount = await this.model.destroy({
                where: {
                    timestamp: { [Op.lt]: cutoffDate },
                },
                transaction,
            });

            logger.info(`Cleaned up ${deletedCount} audit logs older than ${olderThanDays} days`);
            return deletedCount;
        } catch (error) {
            logger.error('Error cleaning up old audit logs:', error);
            throw error;
        }
    }

    /**
     * Find suspicious activity
     */
    async findSuspiciousActivity(
        timeWindowMinutes: number = 60,
        actionThreshold: number = 50
    ): Promise<Array<{
        userId: string;
        actionCount: number;
        timeWindow: string;
        actions: string[];
    }>> {
        try {
            const timeWindow = new Date();
            timeWindow.setMinutes(timeWindow.getMinutes() - timeWindowMinutes);

            const suspiciousActivity = await this.model.findAll({
                attributes: [
                    'user_id',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'actionCount'],
                    [this.model.sequelize!.fn('GROUP_CONCAT', this.model.sequelize!.col('action')), 'actions'],
                ],
                where: {
                    timestamp: { [Op.gte]: timeWindow },
                },
                group: ['user_id'],
                having: this.model.sequelize!.where(
                    this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')),
                    Op.gte,
                    actionThreshold
                ),
                raw: true,
            }) as any[];

            return suspiciousActivity.map((row: any) => ({
                userId: row.user_id,
                actionCount: parseInt(row.actionCount, 10),
                timeWindow: `${timeWindowMinutes} minutes`,
                actions: row.actions.split(','),
            }));
        } catch (error) {
            logger.error('Error finding suspicious activity:', error);
            throw error;
        }
    }
}