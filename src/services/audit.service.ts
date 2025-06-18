// import { Transaction } from 'sequelize';
// import { AuditServiceInterface } from '@interfaces/serviceInterfaces';
// import { PaginatedResponse, PaginationParams, AuditLogData } from '@interfaces/common.interfaces';
// import { AuditRepository } from '@/repositories/audit.repository';
// import { AuditMapper } from '@/mappers/audit.mapper';
// import { logger } from '@utils/logger';
//
// export interface AuditLogEntry {
//     userId: string;
//     action: string;
//     resourceType: string;
//     resourceId: string;
//     oldValues?: Record<string, unknown>;
//     newValues?: Record<string, unknown>;
//     metadata?: Record<string, unknown>;
//     ipAddress?: string;
//     userAgent?: string;
//     sessionId?: string;
// }
//
// export interface AuditSearchCriteria {
//     userId?: string;
//     action?: string;
//     resourceType?: string;
//     resourceId?: string;
//     dateFrom?: Date;
//     dateTo?: Date;
//     ipAddress?: string;
//     sessionId?: string;
// }
//
// export interface AuditStatistics {
//     totalActions: number;
//     actionsByType: Record<string, number>;
//     userActivity: Array<{
//         userId: string;
//         userName: string;
//         actionCount: number;
//     }>;
//     recentActivity: Array<{
//         date: string;
//         actionCount: number;
//     }>;
//     topActions: Array<{
//         action: string;
//         count: number;
//         percentage: number;
//     }>;
//     securityEvents: Array<{
//         type: string;
//         count: number;
//         description: string;
//     }>;
// }
//
// export class AuditService implements AuditServiceInterface {
//     private auditRepository: AuditRepository;
//
//     constructor() {
//         this.auditRepository = new AuditRepository();
//     }
//
//     /**
//      * Log an action with comprehensive details
//      */
//     async logAction(
//         data: AuditLogEntry,
//         transaction?: Transaction
//     ): Promise<void> {
//         try {
//             const auditData = {
//                 userId: data.userId,
//                 action: data.action,
//                 resourceType: data.resourceType,
//                 resourceId: data.resourceId,
//                 oldValues: data.oldValues ? AuditMapper.sanitizeAuditValues(data.oldValues) : undefined,
//                 newValues: data.newValues ? AuditMapper.sanitizeAuditValues(data.newValues) : undefined,
//                 metadata: {
//                     ...data.metadata,
//                     old_status: data.oldValues?.status || null,
//                     new_status: data.newValues?.status || null,
//                     ip_address: data.ipAddress || null,
//                     user_agent: data.userAgent || null,
//                     session_id: data.sessionId || null,
//                     timestamp: new Date().toISOString(),
//                 }
//             };
//
//
//             await this.auditRepository.createAuditLog(auditData, transaction);
//
//             logger.debug('Audit log created', {
//                 userId: data.userId,
//                 action: data.action,
//                 resourceType: data.resourceType,
//                 resourceId: data.resourceId,
//             });
//         } catch (error) {
//             // Don't let audit logging failures break the main operation
//             logger.error('Failed to create audit log:', error);
//         }
//     }
//
//     /**
//      * Get audit logs with advanced filtering
//      */
//     async getAuditLogs(
//         criteria: AuditSearchCriteria,
//         pagination: PaginationParams
//     ): Promise<PaginatedResponse<AuditLogData>> {
//         const where: Record<string, any> = {};
//
//         if (criteria.userId) {
//             where.user_id = criteria.userId;
//         }
//
//         if (criteria.action) {
//             where.action = criteria.action;
//         }
//
//         if (criteria.resourceId) {
//             where.certificate_id = criteria.resourceId;
//         }
//
//         if (criteria.ipAddress) {
//             where.ip_address = criteria.ipAddress;
//         }
//
//         if (criteria.sessionId) {
//             where.session_id = criteria.sessionId;
//         }
//
//         if (criteria.dateFrom || criteria.dateTo) {
//             where.timestamp = {};
//             if (criteria.dateFrom) {
//                 where.timestamp.gte = criteria.dateFrom;
//             }
//             if (criteria.dateTo) {
//                 where.timestamp.lte = criteria.dateTo;
//             }
//         }
//
//         const result = await this.auditRepository.findAndCountAll({
//             where,
//             pagination,
//             include: ['user', 'certificate'],
//             order: [['timestamp', 'DESC']],
//         });
//
//         const mappedData = AuditMapper.toAuditLogDataArray(result.data, true);
//
//         return {
//             data: mappedData,
//             meta: result.meta,
//         };
//     }
//
//     /**
//      * Get resource history with detailed change tracking
//      */
//     async getResourceHistory(
//         resourceType: string,
//         resourceId: string,
//         pagination: PaginationParams
//     ): Promise<PaginatedResponse<AuditLogData>> {
//         const result = await this.auditRepository.findByResourceId(resourceId, {
//             pagination,
//             include: ['user'],
//             order: [['timestamp', 'DESC']],
//         });
//
//         const mappedData = AuditMapper.toAuditLogDataArray(result.data, true);
//
//         return {
//             data: mappedData,
//             meta: result.meta,
//         };
//     }
//
//     /**
//      * Get user activity with behavior analysis
//      */
//     async getUserActivity(
//         userId: string,
//         pagination: PaginationParams
//     ): Promise<PaginatedResponse<AuditLogData>> {
//         const result = await this.auditRepository.findByUserId(userId, {
//             pagination,
//             include: ['certificate'],
//             order: [['timestamp', 'DESC']],
//         });
//
//         const mappedData = AuditMapper.toAuditLogDataArray(result.data, true);
//
//         return {
//             data: mappedData,
//             meta: result.meta,
//         };
//     }
//
//     /**
//      * Get comprehensive audit statistics
//      */
//     async getAuditStatistics(
//         startDate?: Date,
//         endDate?: Date,
//         userId?: string
//     ): Promise<AuditStatistics> {
//         try {
//             const summary = await this.auditRepository.getAuditSummary(startDate, endDate, userId);
//
//             // Calculate additional statistics
//             const totalActions = summary.totalActions;
//             const actionsByType = summary.actionsByType;
//
//             // Calculate top actions with percentages
//             const topActions = Object.entries(actionsByType)
//                 .map(([action, count]) => ({
//                     action,
//                     count,
//                     percentage: totalActions > 0 ? Math.round((count / totalActions) * 100) : 0,
//                 }))
//                 .sort((a, b) => b.count - a.count)
//                 .slice(0, 10);
//
//             // Identify security events
//             const securityEvents = await this.identifySecurityEvents(startDate, endDate);
//
//             return {
//                 totalActions,
//                 actionsByType,
//                 userActivity: summary.userActivity,
//                 recentActivity: summary.recentActivity,
//                 topActions,
//                 securityEvents,
//             };
//         } catch (error) {
//             logger.error('Error getting audit statistics:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Export audit logs in various formats
//      */
//     async exportAuditLogs(
//         criteria: AuditSearchCriteria,
//         format: 'csv' | 'json' | 'xlsx' = 'csv',
//         limit: number = 10000
//     ): Promise<string | object[]> {
//         try {
//             const result = await this.getAuditLogs(criteria, {
//                 page: 1,
//                 limit,
//                 offset: 0
//             });
//
//             if (format === 'json') {
//                 return result.data;
//             }
//
//             if (format === 'csv') {
//                 return this.convertToCSV(result.data);
//             }
//
//             // For XLSX, you would need a library like 'xlsx'
//             throw new Error('XLSX format not implemented yet');
//         } catch (error) {
//             logger.error('Error exporting audit logs:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Detect suspicious activities
//      */
//     async detectSuspiciousActivity(
//         timeWindowMinutes: number = 60,
//         actionThreshold: number = 50
//     ): Promise<Array<{
//         userId: string;
//         userName?: string;
//         actionCount: number;
//         timeWindow: string;
//         actions: string[];
//         riskLevel: 'low' | 'medium' | 'high';
//         description: string;
//     }>> {
//         try {
//             const suspiciousActivity = await this.auditRepository.findSuspiciousActivity(
//                 timeWindowMinutes,
//                 actionThreshold
//             );
//
//             return suspiciousActivity.map(activity => {
//                 const uniqueActions = [...new Set(activity.actions)];
//                 let riskLevel: 'low' | 'medium' | 'high' = 'low';
//                 let description = '';
//
//                 // Analyze risk level based on activity patterns
//                 if (activity.actionCount > actionThreshold * 2) {
//                     riskLevel = 'high';
//                     description = 'Extremely high activity volume detected';
//                 } else if (uniqueActions.includes('login') && uniqueActions.length === 1) {
//                     riskLevel = 'high';
//                     description = 'Multiple failed login attempts detected';
//                 } else if (uniqueActions.includes('downloaded') && activity.actionCount > 20) {
//                     riskLevel = 'medium';
//                     description = 'Unusual download activity pattern';
//                 } else {
//                     riskLevel = 'low';
//                     description = 'Elevated activity volume';
//                 }
//
//                 return {
//                     ...activity,
//                     actions: uniqueActions,
//                     riskLevel,
//                     description,
//                 };
//             });
//         } catch (error) {
//             logger.error('Error detecting suspicious activity:', error);
//             return [];
//         }
//     }
//
//     /**
//      * Get audit compliance report
//      */
//     async getComplianceReport(
//         startDate: Date,
//         endDate: Date,
//         companyCode?: string
//     ): Promise<{
//         period: { startDate: string; endDate: string };
//         summary: {
//             totalActions: number;
//             uniqueUsers: number;
//             certificatesProcessed: number;
//             complianceScore: number;
//         };
//         activities: Record<string, number>;
//         violations: Array<{
//             type: string;
//             description: string;
//             count: number;
//             severity: 'low' | 'medium' | 'high';
//         }>;
//         recommendations: string[];
//     }> {
//         try {
//             const criteria: AuditSearchCriteria = {
//                 dateFrom: startDate,
//                 dateTo: endDate,
//             };
//
//             const auditData = await this.getAuditLogs(criteria, {
//                 page: 1,
//                 limit: 10000,
//                 offset: 0
//             });
//
//             // Filter by company if specified
//             const filteredData = companyCode
//                 ? auditData.data.filter(log =>
//                     log.metadata?.companyCode === companyCode ||
//                     log.newValues?.companyCode === companyCode
//                 )
//                 : auditData.data;
//
//             const uniqueUsers = new Set(filteredData.map(log => log.userId)).size;
//             const certificatesProcessed = new Set(
//                 filteredData
//                     .filter(log => log.resourceType === 'certificate')
//                     .map(log => log.resourceId)
//             ).size;
//
//             // Calculate compliance score (simplified)
//             const successfulActions = filteredData.filter(log =>
//                 !log.metadata?.error && log.action !== 'failed'
//             ).length;
//             const complianceScore = filteredData.length > 0
//                 ? Math.round((successfulActions / filteredData.length) * 100)
//                 : 100;
//
//             // Identify potential violations
//             const violations = this.identifyComplianceViolations(filteredData);
//
//             // Generate recommendations
//             const recommendations = this.generateComplianceRecommendations(
//                 violations,
//                 complianceScore,
//                 filteredData
//             );
//
//             const activities = filteredData.reduce((acc, log) => {
//                 acc[log.action] = (acc[log.action] || 0) + 1;
//                 return acc;
//             }, {} as Record<string, number>);
//
//             return {
//                 period: {
//                     startDate: startDate.toISOString(),
//                     endDate: endDate.toISOString(),
//                 },
//                 summary: {
//                     totalActions: filteredData.length,
//                     uniqueUsers,
//                     certificatesProcessed,
//                     complianceScore,
//                 },
//                 activities,
//                 violations,
//                 recommendations,
//             };
//         } catch (error) {
//             logger.error('Error generating compliance report:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Clean up old audit logs based on retention policy
//      */
//     async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
//         try {
//             const cutoffDate = new Date();
//             cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
//
//             const deletedCount = await this.auditRepository.cleanupOldLogs(retentionDays);
//
//             logger.info(`Audit log cleanup completed: ${deletedCount} logs removed`, {
//                 retentionDays,
//                 cutoffDate: cutoffDate.toISOString(),
//             });
//
//             return deletedCount;
//         } catch (error) {
//             logger.error('Error cleaning up audit logs:', error);
//             throw error;
//         }
//     }
//
//     // Private helper methods
//
//     /**
//      * Identify security events from audit patterns
//      */
//     private async identifySecurityEvents(
//         startDate?: Date,
//         endDate?: Date
//     ): Promise<Array<{
//         type: string;
//         count: number;
//         description: string;
//     }>> {
//         try {
//             const criteria: AuditSearchCriteria = {};
//             if (startDate) criteria.dateFrom = startDate;
//             if (endDate) criteria.dateTo = endDate;
//
//             const auditData = await this.getAuditLogs(criteria, {
//                 page: 1,
//                 limit: 10000,
//                 offset: 0
//             });
//
//             const securityEvents: Array<{ type: string; count: number; description: string }> = [];
//
//             // Failed login attempts
//             const failedLogins = auditData.data.filter(log =>
//                 log.action === 'login' && log.metadata?.error
//             ).length;
//             if (failedLogins > 0) {
//                 securityEvents.push({
//                     type: 'failed_logins',
//                     count: failedLogins,
//                     description: 'Failed login attempts detected',
//                 });
//             }
//
//             // Account lockouts
//             const accountLockouts = auditData.data.filter(log =>
//                 log.action === 'account_locked'
//             ).length;
//             if (accountLockouts > 0) {
//                 securityEvents.push({
//                     type: 'account_lockouts',
//                     count: accountLockouts,
//                     description: 'User accounts locked due to failed attempts',
//                 });
//             }
//
//             // Unusual access patterns (multiple IPs for the same user)
//             const userIpMap = new Map<string, Set<string>>();
//             auditData.data.forEach(log => {
//                 if (log.ipAddress) {
//                     if (!userIpMap.has(log.userId)) {
//                         userIpMap.set(log.userId, new Set());
//                     }
//                     userIpMap.get(log.userId)!.add(log.ipAddress);
//                 }
//             });
//
//             const multiIpUsers = Array.from(userIpMap.entries()).filter(
//                 ([userId, ips]) => ips.size > 3
//             ).length;
//
//             if (multiIpUsers > 0) {
//                 securityEvents.push({
//                     type: 'multiple_ip_access',
//                     count: multiIpUsers,
//                     description: 'Users accessing from multiple IP addresses',
//                 });
//             }
//
//             return securityEvents;
//         } catch (error) {
//             logger.error('Error identifying security events:', error);
//             return [];
//         }
//     }
//
//     /**
//      * Convert audit data to CSV format
//      */
//     private convertToCSV(data: AuditLogData[]): string {
//         const headers = [
//             'Date',
//             'User ID',
//             'User Email',
//             'Action',
//             'Resource Type',
//             'Resource ID',
//             'Old Status',
//             'New Status',
//             'IP Address',
//             'User Agent',
//             'Details'
//         ];
//
//         const csvRows = [headers.join(',')];
//
//         data.forEach(log => {
//             const row = [
//                 log.timestamp.toISOString(),
//                 log.userId,
//                 (log as any).user?.email || '',
//                 log.action,
//                 log.resourceType,
//                 log.resourceId,
//                 log.oldValues?.status || '',
//                 log.newValues?.status || '',
//                 (log as any).ipAddress || '',
//                 (log as any).userAgent || '',
//                 log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : '',
//             ];
//
//             csvRows.push(row.map(field => `"${field}"`).join(','));
//         });
//
//         return csvRows.join('\n');
//     }
//
//     /**
//      * Identify compliance violations
//      */
//     private identifyComplianceViolations(
//         auditData: AuditLogData[]
//     ): Array<{
//         type: string;
//         description: string;
//         count: number;
//         severity: 'low' | 'medium' | 'high';
//     }> {
//         const violations: Array<{
//             type: string;
//             description: string;
//             count: number;
//             severity: 'low' | 'medium' | 'high';
//         }> = [];
//
//         // Missing audit trails for certificate operations
//         const certificateActions = auditData.filter(log =>
//             log.resourceType === 'certificate'
//         );
//         const certificateIds = new Set(certificateActions.map(log => log.resourceId));
//
//         certificateIds.forEach(certId => {
//             const certActions = certificateActions.filter(log => log.resourceId === certId);
//             const hasCreation = certActions.some(log => log.action === 'created');
//
//             if (!hasCreation) {
//                 violations.push({
//                     type: 'missing_creation_audit',
//                     description: 'Certificate without creation audit trail',
//                     count: 1,
//                     severity: 'medium',
//                 });
//             }
//         });
//
//         // Excessive failed operations
//         const failedOperations = auditData.filter(log =>
//             log.metadata?.error || log.action.includes('failed')
//         ).length;
//
//         if (failedOperations > auditData.length * 0.1) { // More than 10% failures
//             violations.push({
//                 type: 'high_failure_rate',
//                 description: 'High rate of failed operations detected',
//                 count: failedOperations,
//                 severity: 'high',
//             });
//         }
//
//         // Unauthorized access attempts
//         const unauthorizedAttempts = auditData.filter(log => {
//             const error = log.metadata?.error;
//             return typeof error === 'string' &&
//                 (error.includes('unauthorized') || error.includes('forbidden'));
//         }).length;
//
//
//         if (unauthorizedAttempts > 0) {
//             violations.push({
//                 type: 'unauthorized_access',
//                 description: 'Unauthorized access attempts detected',
//                 count: unauthorizedAttempts,
//                 severity: 'high',
//             });
//         }
//
//         return violations;
//     }
//
//     /**
//      * Generate compliance recommendations
//      */
//     private generateComplianceRecommendations(
//         violations: Array<{ type: string; count: number; severity: string }>,
//         complianceScore: number,
//         auditData: AuditLogData[]
//     ): string[] {
//         const recommendations: string[] = [];
//
//         if (complianceScore < 90) {
//             recommendations.push('Improve system reliability to achieve higher compliance score');
//         }
//
//         if (violations.some(v => v.type === 'high_failure_rate')) {
//             recommendations.push('Investigate and resolve causes of high failure rates');
//         }
//
//         if (violations.some(v => v.type === 'unauthorized_access')) {
//             recommendations.push('Review and strengthen access control mechanisms');
//         }
//
//         if (violations.some(v => v.type === 'missing_creation_audit')) {
//             recommendations.push('Ensure all certificate operations are properly audited');
//         }
//
//         const uniqueUsers = new Set(auditData.map(log => log.userId)).size;
//         if (uniqueUsers < 2) {
//             recommendations.push('Consider implementing separation of duties for critical operations');
//         }
//
//         if (recommendations.length === 0) {
//             recommendations.push('Audit compliance appears satisfactory. Continue monitoring.');
//         }
//
//         return recommendations;
//     }
// }