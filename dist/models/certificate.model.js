"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCertificateModel = void 0;
const sequelize_1 = require("sequelize");
const initCertificateModel = (sequelize) => {
    return sequelize.define('Certificate', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        reference_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Internal reference number for tracking',
        },
        ivory_request_number: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Reference number from IvoryAttestation system',
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'suspended'),
            allowNull: false,
            defaultValue: 'pending',
        },
        certificate_number: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Certificate number from IvoryAttestation',
        },
        download_url: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'URL to download the certificate',
        },
        download_expires_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Expiration date for download URL',
        },
        policy_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'orass_policy',
                key: 'id',
            },
        },
        insured_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'orass_insured',
                key: 'id',
            },
        },
        policy_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: 'Denormalized for quick access',
        },
        registration_number: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: 'Vehicle registration number',
        },
        company_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        agent_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
        },
        created_by: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        error_message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Error message if certificate creation failed',
        },
        ivory_status_code: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Status code from IvoryAttestation API',
        },
        retry_count: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of retry attempts',
        },
        last_retry_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp of last retry attempt',
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'Additional metadata for the certificate request',
        },
        idempotency_key: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Idempotency key to prevent duplicate operations',
        },
        processed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when certificate was fully processed',
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        deleted_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    }, {
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
    });
};
exports.initCertificateModel = initCertificateModel;
//# sourceMappingURL=certificate.model.js.map