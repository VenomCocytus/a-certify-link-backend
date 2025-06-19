"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const sequelize_1 = require("sequelize");
const base_repository_1 = require("./base.repository");
const models_1 = require("@/models");
const logger_1 = require("@utils/logger");
class AuditRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.CertificateAuditLog);
    }
    /**
     * Find audit logs by resource ID
     */
    async findByResourceId(resourceId, options) {
        try {
            const searchOptions = {
                where: { certificate_id: resourceId },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: models_1.User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: models_1.Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error(`Error finding audit logs by resource ID ${resourceId}:`, error);
            throw error;
        }
    }
    /**
     * Find audit logs by user ID
     */
    async findByUserId(userId, options) {
        try {
            const searchOptions = {
                where: { user_id: userId },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: models_1.Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error(`Error finding audit logs by user ID ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Find audit logs by action
     */
    async findByAction(action, options) {
        try {
            const searchOptions = {
                where: { action },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: models_1.User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: models_1.Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error(`Error finding audit logs by action ${action}:`, error);
            throw error;
        }
    }
    /**
     * Find audit logs by date range
     */
    async findByDateRange(startDate, endDate, options) {
        try {
            const searchOptions = {
                where: {
                    timestamp: {
                        [sequelize_1.Op.between]: [startDate, endDate],
                    },
                },
                pagination: options?.pagination || { page: 1, limit: 20, offset: 0 },
                order: options?.order || [['timestamp', 'DESC']],
                include: options?.include || [
                    { model: models_1.User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
                    { model: models_1.Certificate, as: 'certificate', attributes: ['id', 'reference_number', 'policy_number'] },
                ],
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error('Error finding audit logs by date range:', error);
            throw error;
        }
    }
    /**
     * Create audit log entry
     */
    async createAuditLog(data, transaction) {
        try {
            const auditData = {
                certificateId: data.resourceId,
                userId: data.userId,
                action: data.action,
                oldValues: data.oldValues || null,
                newValues: data.newValues || null,
                details: data.metadata || null,
                timestamp: new Date(),
            };
            return this.create(auditData, transaction);
        }
        catch (error) {
            logger_1.logger.error('Error creating audit log:', error);
            throw error;
        }
    }
    /**
     * Get audit summary statistics
     */
    async getAuditSummary(startDate, endDate, userId) {
        try {
            const whereClause = {};
            if (startDate || endDate) {
                whereClause.timestamp = {};
                if (startDate) {
                    whereClause.timestamp[sequelize_1.Op.gte] = startDate;
                }
                if (endDate) {
                    whereClause.timestamp[sequelize_1.Op.lte] = endDate;
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
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count'],
                ],
                where: whereClause,
                group: ['action'],
                raw: true,
            });
            const actionsByType = {};
            actionCounts.forEach((row) => {
                actionsByType[row.action] = parseInt(row.count, 10);
            });
            // User activity (top 10 active users)
            const userActivity = await this.model.findAll({
                attributes: [
                    'user_id',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('CertificateAuditLog.id')), 'actionCount'],
                ],
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email'],
                    },
                ],
                where: whereClause,
                group: ['user_id', 'user.id'],
                order: [[this.model.sequelize.fn('COUNT', this.model.sequelize.col('CertificateAuditLog.id')), 'DESC']],
                limit: 10,
            });
            const userActivityMapped = userActivity.map((row) => ({
                userId: row.user_id,
                userName: `${row.user.first_name} ${row.user.last_name}`,
                actionCount: parseInt(row.dataValues.actionCount, 10),
            }));
            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentActivityQuery = {
                ...whereClause,
                timestamp: { [sequelize_1.Op.gte]: sevenDaysAgo },
            };
            const recentActivity = await this.model.findAll({
                attributes: [
                    [this.model.sequelize.fn('DATE', this.model.sequelize.col('timestamp')), 'date'],
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'actionCount'],
                ],
                where: recentActivityQuery,
                group: [this.model.sequelize.fn('DATE', this.model.sequelize.col('timestamp'))],
                order: [[this.model.sequelize.fn('DATE', this.model.sequelize.col('timestamp')), 'ASC']],
                raw: true,
            });
            const recentActivityMapped = recentActivity.map((row) => ({
                date: row.date,
                actionCount: parseInt(row.actionCount, 10),
            }));
            return {
                totalActions,
                actionsByType,
                userActivity: userActivityMapped,
                recentActivity: recentActivityMapped,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting audit summary:', error);
            throw error;
        }
    }
    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(olderThanDays, transaction) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            const deletedCount = await this.model.destroy({
                where: {
                    timestamp: { [sequelize_1.Op.lt]: cutoffDate },
                },
                transaction,
            });
            logger_1.logger.info(`Cleaned up ${deletedCount} audit logs older than ${olderThanDays} days`);
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up old audit logs:', error);
            throw error;
        }
    }
    /**
     * Find suspicious activity
     */
    async findSuspiciousActivity(timeWindowMinutes = 60, actionThreshold = 50) {
        try {
            const timeWindow = new Date();
            timeWindow.setMinutes(timeWindow.getMinutes() - timeWindowMinutes);
            const suspiciousActivity = await this.model.findAll({
                attributes: [
                    'user_id',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'actionCount'],
                    [this.model.sequelize.fn('GROUP_CONCAT', this.model.sequelize.col('action')), 'actions'],
                ],
                where: {
                    timestamp: { [sequelize_1.Op.gte]: timeWindow },
                },
                group: ['user_id'],
                having: this.model.sequelize.where(this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), sequelize_1.Op.gte, actionThreshold),
                raw: true,
            });
            return suspiciousActivity.map((row) => ({
                userId: row.user_id,
                actionCount: parseInt(row.actionCount, 10),
                timeWindow: `${timeWindowMinutes} minutes`,
                actions: row.actions.split(','),
            }));
        }
        catch (error) {
            logger_1.logger.error('Error finding suspicious activity:', error);
            throw error;
        }
    }
}
exports.AuditRepository = AuditRepository;
//# sourceMappingURL=audit.repository.js.map