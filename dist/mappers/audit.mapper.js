"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditMapper = void 0;
class AuditMapper {
    /**
     * Map audit log model to audit log data
     */
    static toAuditLogData(auditLog, user, certificate) {
        return {
            id: auditLog.id,
            userId: auditLog.user_id,
            action: auditLog.action,
            resourceType: 'certificate',
            resourceId: auditLog.certificate_id,
            oldValues: auditLog.old_values || undefined,
            newValues: auditLog.new_values || undefined,
            metadata: auditLog.details || undefined,
            timestamp: auditLog.timestamp,
            ...(auditLog.ip_address ? { ipAddress: auditLog.ip_address } : {}),
            ...(auditLog.user_agent ? { userAgent: auditLog.user_agent } : {}),
            user: user ? {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            } : undefined,
            certificate: certificate ? {
                id: certificate.id,
                referenceNumber: certificate.reference_number,
                policyNumber: certificate.policy_number,
            } : undefined,
        };
    }
    /**
     * Create audit log data for certificate creation
     */
    static createCertificateCreationAudit(certificateId, userId, certificateData, metadata) {
        return {
            certificate_id: certificateId,
            user_id: userId,
            action: 'created',
            old_status: null,
            new_status: 'pending',
            old_values: null,
            new_values: certificateData,
            details: {
                timestamp: new Date().toISOString(),
                ...metadata,
            },
        };
    }
    /**
     * Create audit log data for status change
     */
    static createStatusChangeAudit(certificateId, userId, oldStatus, newStatus, metadata) {
        return {
            certificate_id: certificateId,
            user_id: userId,
            action: 'updated',
            old_status: oldStatus,
            new_status: newStatus,
            old_values: { status: oldStatus },
            new_values: { status: newStatus },
            details: {
                timestamp: new Date().toISOString(),
                type: 'status_change',
                ...metadata,
            },
        };
    }
    /**
     * Create audit log data for certificate operation (cancel/suspend)
     */
    static createOperationAudit(certificateId, userId, operation, reason, metadata) {
        return {
            certificate_id: certificateId,
            user_id: userId,
            action: operation,
            old_status: null, // Will be filled by the service
            new_status: operation,
            old_values: null,
            new_values: { status: operation },
            details: {
                timestamp: new Date().toISOString(),
                reason,
                ...metadata,
            },
        };
    }
    /**
     * Create audit log data for certificate download
     */
    static createDownloadAudit(certificateId, userId, downloadUrl, metadata) {
        return {
            certificate_id: certificateId,
            user_id: userId,
            action: 'downloaded',
            old_status: null,
            new_status: null,
            old_values: null,
            new_values: { downloadUrl },
            details: {
                timestamp: new Date().toISOString(),
                downloadUrl,
                ...metadata,
            },
        };
    }
    /**
     * Create audit log data for status check
     */
    static createStatusCheckAudit(certificateId, userId, statusInfo, metadata) {
        return {
            certificate_id: certificateId,
            user_id: userId,
            action: 'status_checked',
            old_status: null,
            new_status: null,
            old_values: null,
            new_values: statusInfo,
            details: {
                timestamp: new Date().toISOString(),
                statusInfo,
                ...metadata,
            },
        };
    }
    /**
     * Map array of audit logs to data array
     */
    static toAuditLogDataArray(auditLogs, includeRelations = false) {
        return auditLogs.map(auditLog => {
            const user = includeRelations ? auditLog.user : undefined;
            const certificate = includeRelations ? auditLog.certificate : undefined;
            return this.toAuditLogData(auditLog, user, certificate);
        });
    }
    /**
     * Sanitize sensitive data from audit values
     */
    static sanitizeAuditValues(values) {
        const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
        const sanitized = { ...values };
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
}
exports.AuditMapper = AuditMapper;
//# sourceMappingURL=audit.mapper.js.map