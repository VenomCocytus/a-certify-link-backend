import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from 'sequelize';

export interface CertificateModel extends Model<
    InferAttributes<CertificateModel>,
    InferCreationAttributes<CertificateModel>
> {
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

export const initCertificateModel = (sequelize: Sequelize) => {
    return sequelize.define<CertificateModel>(
        'Certificate',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            reference_number: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: 'Internal reference number for tracking',
            },
            ivory_request_number: {
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: 'Reference number from IvoryAttestation system',
            },
            status: {
                type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'suspended'),
                allowNull: false,
                defaultValue: 'pending',
            },
            certificate_number: {
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: 'Certificate number from IvoryAttestation',
            },
            download_url: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'URL to download the certificate',
            },
            download_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Expiration date for download URL',
            },
            policy_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'orass_policy',
                    key: 'id',
                },
            },
            insured_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'orass_insured',
                    key: 'id',
                },
            },
            policy_number: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: 'Denormalized for quick access',
            },
            registration_number: {
                type: DataTypes.STRING(20),
                allowNull: false,
                comment: 'Vehicle registration number',
            },
            company_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            agent_code: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            error_message: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Error message if certificate creation failed',
            },
            ivory_status_code: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'Status code from IvoryAttestation API',
            },
            retry_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Number of retry attempts',
            },
            last_retry_at: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Timestamp of last retry attempt',
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'Additional metadata for the certificate request',
            },
            idempotency_key: {
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: 'Idempotency key to prevent duplicate operations',
            },
            processed_at: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Timestamp when certificate was fully processed',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'certificates',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['reference_number'],
                },
                {
                    fields: ['ivory_request_number'],
                },
                {
                    fields: ['certificate_number'],
                },
                {
                    fields: ['policy_id'],
                },
                {
                    fields: ['insured_id'],
                },
                {
                    fields: ['policy_number'],
                },
                {
                    fields: ['registration_number'],
                },
                {
                    fields: ['company_code'],
                },
                {
                    fields: ['agent_code'],
                },
                {
                    fields: ['status'],
                },
                {
                    fields: ['created_by'],
                },
                {
                    fields: ['idempotency_key'],
                },
                {
                    fields: ['created_at'],
                },
                {
                    // Composite index for duplicate checking
                    unique: true,
                    fields: ['policy_number', 'registration_number', 'company_code'],
                    where: {
                        status: ['pending', 'processing', 'completed'],
                    },
                    name: 'unique_active_certificate',
                },
            ],
        }
    );
};