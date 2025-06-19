import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
export interface CertificateModel extends Model<InferAttributes<CertificateModel>, InferCreationAttributes<CertificateModel>> {
    id: CreationOptional<string>;
    reference_number: string;
    ivory_request_number: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'suspended';
    certificate_number: string | null;
    download_url: string | null;
    download_expires_at: Date | null;
    policy_id: ForeignKey<string>;
    insured_id: ForeignKey<string>;
    policy_number: string;
    registration_number: string;
    company_code: string;
    agent_code: string | null;
    created_by: ForeignKey<string>;
    error_message: string | null;
    ivory_status_code: number | null;
    retry_count: number;
    last_retry_at: Date | null;
    metadata: Record<string, unknown> | null;
    idempotency_key: string | null;
    processed_at: Date | null;
    created_at: CreationOptional<Date>;
    updated_at: CreationOptional<Date>;
    deleted_at: CreationOptional<Date | null>;
}
export declare const initCertificateModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<CertificateModel>;
//# sourceMappingURL=certificate.model.d.ts.map