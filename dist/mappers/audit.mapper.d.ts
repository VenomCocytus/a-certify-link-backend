import { CertificateAuditLogModel } from '@/models';
import { AuditLogData } from '@interfaces/common.interfaces';
import { UserModel } from '@/models';
import { CertificateModel } from '@/models';
export declare class AuditMapper {
    /**
     * Map audit log model to audit log data
     */
    static toAuditLogData(auditLog: CertificateAuditLogModel, user?: UserModel, certificate?: CertificateModel): AuditLogData & {
        id: string;
        user?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        certificate?: {
            id: string;
            referenceNumber: string;
            policyNumber: string;
        };
        ipAddress?: string;
        userAgent?: string;
    };
    /**
     * Create audit log data for certificate creation
     */
    static createCertificateCreationAudit(certificateId: string, userId: string, certificateData: Record<string, unknown>, metadata?: Record<string, unknown>): Partial<CertificateAuditLogModel>;
    /**
     * Create audit log data for status change
     */
    static createStatusChangeAudit(certificateId: string, userId: string, oldStatus: string, newStatus: string, metadata?: Record<string, unknown>): Partial<CertificateAuditLogModel>;
    /**
     * Create audit log data for certificate operation (cancel/suspend)
     */
    static createOperationAudit(certificateId: string, userId: string, operation: 'cancelled' | 'suspended', reason?: string, metadata?: Record<string, unknown>): Partial<CertificateAuditLogModel>;
    /**
     * Create audit log data for certificate download
     */
    static createDownloadAudit(certificateId: string, userId: string, downloadUrl: string, metadata?: Record<string, unknown>): Partial<CertificateAuditLogModel>;
    /**
     * Create audit log data for status check
     */
    static createStatusCheckAudit(certificateId: string, userId: string, statusInfo: Record<string, unknown>, metadata?: Record<string, unknown>): Partial<CertificateAuditLogModel>;
    /**
     * Map array of audit logs to data array
     */
    static toAuditLogDataArray(auditLogs: CertificateAuditLogModel[], includeRelations?: boolean): AuditLogData[];
    /**
     * Sanitize sensitive data from audit values
     */
    static sanitizeAuditValues(values: Record<string, unknown>): Record<string, unknown>;
}
//# sourceMappingURL=audit.mapper.d.ts.map