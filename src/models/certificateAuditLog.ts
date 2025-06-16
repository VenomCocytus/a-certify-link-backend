import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from 'sequelize';

export interface CertificateAuditLogModel extends Model<
    InferAttributes<CertificateAuditLogModel>,
    InferCreationAttributes<CertificateAuditLogModel>
> {
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

export const initCertificateAuditLogModel = (sequelize: Sequelize) => {
    return sequelize.define<CertificateAuditLogModel>(
        'CertificateAuditLog',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            certificate_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'certificates',
                    key: 'id',
                },
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            action: {
                type: DataTypes.ENUM('created', 'updated', 'cancelled', 'suspended', 'downloaded', 'status_checked'),
                allowNull: false,
            },
            old_status: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Previous status before the action',
            },
            new_status: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'New status after the action',
            },
            old_values: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'Previous values before the change',
            },
            new_values: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'New values after the change',
            },
            details: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'Additional details about the action',
            },
            ip_address: {
                type: DataTypes.STRING(45),
                allowNull: true,
                comment: 'IP address of the user performing the action',
            },
            user_agent: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'User agent of the client',
            },
            session_id: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: 'Session ID of the user',
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'certificate_audit_logs',
            timestamps: false,
            underscored: true,
            indexes: [
                {
                    fields: ['certificate_id'],
                },
                {
                    fields: ['user_id'],
                },
                {
                    fields: ['action'],
                },
                {
                    fields: ['timestamp'],
                },
                {
                    fields: ['certificate_id', 'timestamp'],
                },
                {
                    fields: ['user_id', 'timestamp'],
                },
            ],
        }
    );
};