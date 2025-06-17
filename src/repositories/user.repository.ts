import {Op, Transaction} from 'sequelize';
import { BaseRepository } from './base.repository';
import { User, UserModel } from '@/models';
import { logger } from '@utils/logger';

export class UserRepository extends BaseRepository<UserModel> {
    constructor() {
        super(User);
    }

    /**
     * Find the user by email
     */
    async findByEmail(email: string, transaction?: Transaction): Promise<UserModel | null> {
        try {
            return await this.model.findOne({
                where: {email: email.toLowerCase()},
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding user by email ${email}:`, error);
            throw error;
        }
    }

    /**
     * Find users by role
     */
    async findByRole(role: string, transaction?: Transaction): Promise<UserModel[]> {
        try {
            return await this.model.findAll({
                where: {role},
                order: [['created_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding users by role ${role}:`, error);
            throw error;
        }
    }

    /**
     * Find users by company code
     */
    async findByCompanyCode(companyCode: string, transaction?: Transaction): Promise<UserModel[]> {
        try {
            return await this.model.findAll({
                where: {company_code: companyCode},
                order: [['created_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding users by company code ${companyCode}:`, error);
            throw error;
        }
    }

    /**
     * Find active users
     */
    async findActiveUsers(transaction?: Transaction): Promise<UserModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    is_active: true,
                    [Op.or]: [
                        {locked_until: null},
                        {locked_until: {[Op.lt]: new Date()}},
                    ],
                },
                order: [['last_login_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error('Error finding active users:', error);
            throw error;
        }
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(id: string, transaction?: Transaction): Promise<UserModel | null> {
        try {
            return this.update(id, {
                last_login_at: new Date(),
                failed_login_attempts: 0, // Reset failed attempts on successful login
                locked_until: null, // Remove lock on successful login
            }, transaction);
        } catch (error) {
            logger.error(`Error updating last login for user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Increment failed login attempts
     */
    async incrementFailedLoginAttempts(id: string, transaction?: Transaction): Promise<UserModel | null> {
        try {
            const user = await this.findById(id, transaction);
            if (!user) {
                return null;
            }

            const newFailedAttempts = user.failed_login_attempts + 1;
            const updateData: Partial<UserModel> = {
                failed_login_attempts: newFailedAttempts,
            };

            // Lock account after 5 failed attempts for 30 minutes
            if (newFailedAttempts >= 5) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 30);
                updateData.locked_until = lockUntil;
            }

            return this.update(id, updateData, transaction);
        } catch (error) {
            logger.error(`Error incrementing failed login attempts for user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Unlock a user account
     */
    async unlockAccount(id: string, transaction?: Transaction): Promise<UserModel | null> {
        try {
            return this.update(id, {
                failed_login_attempts: 0,
                locked_until: null,
            }, transaction);
        } catch (error) {
            logger.error(`Error unlocking account for user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Find locked users
     */
    async findLockedUsers(transaction?: Transaction): Promise<UserModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    locked_until: {[Op.gt]: new Date()},
                },
                order: [['locked_until', 'ASC']],
                transaction,
            });
        } catch (error) {
            logger.error('Error finding locked users:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getUserStatistics(): Promise<{
        total: number;
        active: number;
        locked: number;
        byRole: Record<string, number>;
        recentLogins: number;
    }> {
        try {
            const total = await this.count();
            const active = await this.count({ is_active: true });
            const locked = await this.count({ locked_until: { [Op.gt]: new Date() } });

            // Count by role
            const roleCounts = await this.model.findAll({
                attributes: [
                    'role',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
                ],
                group: ['role'],
                raw: true,
            }) as any[];

            const byRole: Record<string, number> = {};
            roleCounts.forEach((row: any) => {
                byRole[row.role] = parseInt(row.count, 10);
            });

            // Recent logins (last 24 hours)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const recentLogins = await this.count({
                last_login_at: { [Op.gte]: oneDayAgo },
            });

            return {
                total,
                active,
                locked,
                byRole,
                recentLogins,
            };
        } catch (error) {
            logger.error('Error getting user statistics:', error);
            throw error;
        }
    }
}