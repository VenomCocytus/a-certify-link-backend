import { Transaction } from 'sequelize';
import { AuditServiceInterface } from '@interfaces/serviceInterfaces';
import { PaginatedResponse, PaginationParams, AuditLogData } from '@interfaces/common.interfaces';
export interface AuditLogEntry {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}
export interface AuditSearchCriteria {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    ipAddress?: string;
    sessionId?: string;
}
export interface AuditStatistics {
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
    topActions: Array<{
        action: string;
        count: number;
        percentage: number;
    }>;
    securityEvents: Array<{
        type: string;
        count: number;
        description: string;
    }>;
}
export declare class AuditService implements AuditServiceInterface {
    private auditRepository;
    constructor();
    /**
     * Log an action with comprehensive details
     */
    logAction(data: AuditLogEntry, transaction?: Transaction): Promise<void>;
    /**
     * Get audit logs with advanced filtering
     */
    getAuditLogs(criteria: AuditSearchCriteria, pagination: PaginationParams): Promise<PaginatedResponse<AuditLogData>>;
    /**
     * Get resource history with detailed change tracking
     */
    getResourceHistory(resourceType: string, resourceId: string, pagination: PaginationParams): Promise<PaginatedResponse<AuditLogData>>;
    /**
     * Get user activity with behavior analysis
     */
    getUserActivity(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<AuditLogData>>;
    /**
     * Get comprehensive audit statistics
     */
    getAuditStatistics(startDate?: Date, endDate?: Date, userId?: string): Promise<AuditStatistics>;
    /**
     * Export audit logs in various formats
     */
    exportAuditLogs(criteria: AuditSearchCriteria, format?: 'csv' | 'json' | 'xlsx', limit?: number): Promise<string | object[]>;
    /**
     * Detect suspicious activities
     */
    detectSuspiciousActivity(timeWindowMinutes?: number, actionThreshold?: number): Promise<Array<{
        userId: string;
        userName?: string;
        actionCount: number;
        timeWindow: string;
        actions: string[];
        riskLevel: 'low' | 'medium' | 'high';
        description: string;
    }>>;
    /**
     * Get audit compliance report
     */
    getComplianceReport(startDate: Date, endDate: Date, companyCode?: string): Promise<{
        period: {
            startDate: string;
            endDate: string;
        };
        summary: {
            totalActions: number;
            uniqueUsers: number;
            certificatesProcessed: number;
            complianceScore: number;
        };
        activities: Record<string, number>;
        violations: Array<{
            type: string;
            description: string;
            count: number;
            severity: 'low' | 'medium' | 'high';
        }>;
        recommendations: string[];
    }>;
    /**
     * Clean up old audit logs based on retention policy
     */
    cleanupOldLogs(retentionDays?: number): Promise<number>;
    /**
     * Identify security events from audit patterns
     */
    private identifySecurityEvents;
    /**
     * Convert audit data to CSV format
     */
    private convertToCSV;
    /**
     * Identify compliance violations
     */
    private identifyComplianceViolations;
    /**
     * Generate compliance recommendations
     */
    private generateComplianceRecommendations;
}
//# sourceMappingURL=audit.service.d.ts.map