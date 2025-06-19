"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrassInsuredModel = void 0;
const sequelize_1 = require("sequelize");
const initOrassInsuredModel = (sequelize) => {
    return sequelize.define('OrassInsured', {
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
        first_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        profession: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('individual', 'corporate'),
            allowNull: false,
            defaultValue: 'individual',
        },
        date_of_birth: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
        },
        national_id: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
        },
        company_registration: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
        },
        company_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
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
        tableName: 'orass_insured',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['orass_id'],
            },
            {
                fields: ['company_code'],
            },
            {
                fields: ['type'],
            },
            {
                fields: ['email'],
            },
            {
                fields: ['national_id'],
            },
            {
                fields: ['company_registration'],
            },
        ],
    });
};
exports.initOrassInsuredModel = initOrassInsuredModel;
//# sourceMappingURL=orassInsured.model.js.map