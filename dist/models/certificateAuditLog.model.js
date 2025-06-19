"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCertificateAuditLogModel = void 0;
const sequelize_1 = require("sequelize");
const initCertificateAuditLogModel = (sequelize) => {
    return sequelize.define('CertificateAuditLog', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        certificate_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'certificates',
                key: 'id',
            },
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        action: {
            type: sequelize_1.DataTypes.ENUM('created', 'updated', 'cancelled', 'suspended', 'downloaded', 'status_checked'),
            allowNull: false,
        },
        old_status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'Previous status before the action',
        },
        new_status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'New status after the action',
        },
        old_values: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'Previous values before the change',
        },
        new_values: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'New values after the change',
        },
        details: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'Additional details about the action',
        },
        ip_address: {
            type: sequelize_1.DataTypes.STRING(45),
            allowNull: true,
            comment: 'IP address of the user performing the action',
        },
        user_agent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'User agent of the client',
        },
        session_id: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'Session ID of the user',
        },
        timestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
    }, {
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
    });
};
exports.initCertificateAuditLogModel = initCertificateAuditLogModel;
//# sourceMappingURL=certificateAuditLog.model.js.map