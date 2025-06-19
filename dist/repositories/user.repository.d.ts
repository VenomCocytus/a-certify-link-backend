import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { UserModel } from '@/models';
export declare class UserRepository extends BaseRepository<UserModel> {
    constructor();
    /**
     * Find the user by email
     */
    findByEmail(email: string, transaction?: Transaction): Promise<UserModel | null>;
    /**
     * Find users by role
     */
    findByRole(role: string, transaction?: Transaction): Promise<UserModel[]>;
    /**
     * Find users by company code
     */
    findByCompanyCode(companyCode: string, transaction?: Transaction): Promise<UserModel[]>;
    /**
     * Find active users
     */
    findActiveUsers(transaction?: Transaction): Promise<UserModel[]>;
    /**
     * Update last login timestamp
     */
    updateLastLogin(id: string, transaction?: Transaction): Promise<UserModel | null>;
    /**
     * Increment failed login attempts
     */
    incrementFailedLoginAttempts(id: string, transaction?: Transaction): Promise<UserModel | null>;
    /**
     * Unlock a user account
     */
    unlockAccount(id: string, transaction?: Transaction): Promise<UserModel | null>;
    /**
     * Find locked users
     */
    findLockedUsers(transaction?: Transaction): Promise<UserModel[]>;
    /**
     * Get user statistics
     */
    getUserStatistics(): Promise<{
        total: number;
        active: number;
        locked: number;
        byRole: Record<string, number>;
        recentLogins: number;
    }>;
}
//# sourceMappingURL=user.repository.d.ts.map