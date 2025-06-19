import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { AuditRepositoryInterface, FindAndCountAllOptions } from '@interfaces/repositoryInterfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
import { CertificateAuditLogModel } from '@/models';
export declare class AuditRepository extends BaseRepository<CertificateAuditLogModel> implements AuditRepositoryInterface {
    constructor();
    /**
     * Find audit logs by resource ID
     */
    findByResourceId(resourceId: string, options?: FindAndCountAllOptions<CertificateAuditLogModel>): Promise<PaginatedResponse<CertificateAuditLogModel>>;
    /**
     * Find audit logs by user ID
     */
    findByUserId(userId: string, options?: FindAndCountAllOptions<CertificateAuditLogModel>): Promise<PaginatedResponse<CertificateAuditLogModel>>;
    /**
     * Find audit logs by action
     */
    findByAction(action: string, options?: FindAndCountAllOptions<CertificateAuditLogModel>): Promise<PaginatedResponse<CertificateAuditLogModel>>;
    /**
     * Find audit logs by date range
     */
    findByDateRange(startDate: Date, endDate: Date, options?: FindAndCountAllOptions<CertificateAuditLogModel>): Promise<PaginatedResponse<CertificateAuditLogModel>>;
    /**
     * Create audit log entry
     */
    createAuditLog(data: {
        userId: string;
        action: string;
        resourceType: string;
        resourceId: string;
        oldValues?: Record<string, unknown>;
        newValues?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }, transaction?: Transaction): Promise<CertificateAuditLogModel>;
    /**
     * Get audit summary statistics
     */
    getAuditSummary(startDate?: Date, endDate?: Date, userId?: string): Promise<{
        totalActions: number;
        actionsByType: Record<string, number>;
        userActivity: Array<{
            userId: string;
            userName: string;
            actionCount: number;
        }>;
        recentActivity: Array<{
            date: string;
            actionCount: number;
        }>;
    }>;
    /**
     * Clean up old audit logs
     */
    cleanupOldLogs(olderThanDays: number, transaction?: Transaction): Promise<number>;
    /**
     * Find suspicious activity
     */
    findSuspiciousActivity(timeWindowMinutes?: number, actionThreshold?: number): Promise<Array<{
        userId: string;
        actionCount: number;
        timeWindow: string;
        actions: string[];
    }>>;
}
//# sourceMappingURL=audit.repository.d.ts.map