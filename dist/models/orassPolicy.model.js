"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrassPolicyModel = void 0;
const sequelize_1 = require("sequelize");
const initOrassPolicyModel = (sequelize) => {
    return sequelize.define('OrassPolicy', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        orass_id: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Unique identifier from Orass system',
        },
        policy_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        insured_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'orass_insured',
                key: 'id',
            },
        },
        vehicle_registration: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        vehicle_make: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        vehicle_model: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        vehicle_year: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1900,
                max: new Date().getFullYear() + 1,
            },
        },
        vehicle_type: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
        },
        vehicle_usage: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
        },
        vehicle_chassis_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
        },
        vehicle_motor_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
        },
        subscription_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        effective_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        expiration_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        premium_amount: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        currency: {
            type: sequelize_1.DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'XOF',
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'expired', 'cancelled', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
        },
        agent_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
        },
        company_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        guarantees: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'JSON object containing policy guarantees',
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
        tableName: 'orass_policy',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['orass_id'],
            },
            {
                unique: true,
                fields: ['policy_number'],
            },
            {
                fields: ['insured_id'],
            },
            {
                fields: ['vehicle_registration'],
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
                fields: ['effective_date'],
            },
            {
                fields: ['expiration_date'],
            },
        ],
    });
};
exports.initOrassPolicyModel = initOrassPolicyModel;
//# sourceMappingURL=orassPolicy.model.js.map