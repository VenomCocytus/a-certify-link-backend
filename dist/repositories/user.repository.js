"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const sequelize_1 = require("sequelize");
const base_repository_1 = require("./base.repository");
const models_1 = require("@/models");
const logger_1 = require("@utils/logger");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.User);
    }
    /**
     * Find the user by email
     */
    async findByEmail(email, transaction) {
        try {
            return await this.model.findOne({
                where: { email: email.toLowerCase() },
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding user by email ${email}:`, error);
            throw error;
        }
    }
    /**
     * Find users by role
     */
    async findByRole(role, transaction) {
        try {
            return await this.model.findAll({
                where: { role },
                order: [['created_at', 'DESC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding users by role ${role}:`, error);
            throw error;
        }
    }
    /**
     * Find users by company code
     */
    async findByCompanyCode(companyCode, transaction) {
        try {
            return await this.model.findAll({
                where: { company_code: companyCode },
                order: [['created_at', 'DESC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding users by company code ${companyCode}:`, error);
            throw error;
        }
    }
    /**
     * Find active users
     */
    async findActiveUsers(transaction) {
        try {
            return await this.model.findAll({
                where: {
                    is_active: true,
                    [sequelize_1.Op.or]: [
                        { locked_until: null },
                        { locked_until: { [sequelize_1.Op.lt]: new Date() } },
                    ],
                },
                order: [['last_login_at', 'DESC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding active users:', error);
            throw error;
        }
    }
    /**
     * Update last login timestamp
     */
    async updateLastLogin(id, transaction) {
        try {
            return this.update(id, {
                last_login_at: new Date(),
                failed_login_attempts: 0, // Reset failed attempts on successful login
                locked_until: null, // Remove lock on successful login
            }, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error updating last login for user ${id}:`, error);
            throw error;
        }
    }
    /**
     * Increment failed login attempts
     */
    async incrementFailedLoginAttempts(id, transaction) {
        try {
            const user = await this.findById(id, transaction);
            if (!user) {
                return null;
            }
            const newFailedAttempts = user.failed_login_attempts + 1;
            const updateData = {
                failed_login_attempts: newFailedAttempts,
            };
            // Lock account after 5 failed attempts for 30 minutes
            if (newFailedAttempts >= 5) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 30);
                updateData.locked_until = lockUntil;
            }
            return this.update(id, updateData, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error incrementing failed login attempts for user ${id}:`, error);
            throw error;
        }
    }
    /**
     * Unlock a user account
     */
    async unlockAccount(id, transaction) {
        try {
            return this.update(id, {
                failed_login_attempts: 0,
                locked_until: null,
            }, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error unlocking account for user ${id}:`, error);
            throw error;
        }
    }
    /**
     * Find locked users
     */
    async findLockedUsers(transaction) {
        try {
            return await this.model.findAll({
                where: {
                    locked_until: { [sequelize_1.Op.gt]: new Date() },
                },
                order: [['locked_until', 'ASC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding locked users:', error);
            throw error;
        }
    }
    /**
     * Get user statistics
     */
    async getUserStatistics() {
        try {
            const total = await this.count();
            const active = await this.count({ is_active: true });
            const locked = await this.count({ locked_until: { [sequelize_1.Op.gt]: new Date() } });
            // Count by role
            const roleCounts = await this.model.findAll({
                attributes: [
                    'role',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count'],
                ],
                group: ['role'],
                raw: true,
            });
            const byRole = {};
            roleCounts.forEach((row) => {
                byRole[row.role] = parseInt(row.count, 10);
            });
            // Recent logins (last 24 hours)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const recentLogins = await this.count({
                last_login_at: { [sequelize_1.Op.gte]: oneDayAgo },
            });
            return {
                total,
                active,
                locked,
                byRole,
                recentLogins,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting user statistics:', error);
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map