"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initIdempotencyKeyModel = void 0;
const sequelize_1 = require("sequelize");
const initIdempotencyKeyModel = (sequelize) => {
    return sequelize.define('IdempotencyKey', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Unique idempotency key provided by client',
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed'),
            allowNull: false,
            defaultValue: 'pending',
        },
        request_hash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Hash of the request body for verification',
        },
        request_path: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: false,
            comment: 'API endpoint path',
        },
        request_method: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            comment: 'HTTP method',
        },
        response_status: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'HTTP response status code',
        },
        response_body: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'Cached response body',
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            comment: 'User who made the request',
        },
        expires_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: 'Expiration timestamp for the idempotency key',
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
    }, {
        tableName: 'idempotency_keys',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['key'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['expires_at'],
            },
            {
                fields: ['user_id'],
            },
            {
                fields: ['request_path', 'request_method'],
            },
        ],
    });
};
exports.initIdempotencyKeyModel = initIdempotencyKeyModel;
//# sourceMappingURL=idempotencyKey.model.js.map