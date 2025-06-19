import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
export interface CertificateAuditLogModel extends Model<InferAttributes<CertificateAuditLogModel>, InferCreationAttributes<CertificateAuditLogModel>> {
    id: CreationOptional<string>;
    certificate_id: ForeignKey<string>;
    user_id: ForeignKey<string>;
    action: 'created' | 'updated' | 'cancelled' | 'suspended' | 'downloaded' | 'status_checked';
    old_status: string | null;
    new_status: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    details: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    session_id: string | null;
    timestamp: CreationOptional<Date>;
}
export declare const initCertificateAuditLogModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<CertificateAuditLogModel>;
//# sourceMappingURL=certificateAuditLog.model.d.ts.map