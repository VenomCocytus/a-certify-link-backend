"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUserModel = void 0;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const initUserModel = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        first_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'agent', 'company_admin', 'viewer'),
            allowNull: false,
            defaultValue: 'viewer',
        },
        company_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: 'Company code for company-specific users',
        },
        agent_code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: 'Agent code for agent users',
        },
        permissions: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of permission strings',
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        last_login_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        password_changed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        failed_login_attempts: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        locked_until: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
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
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
            {
                fields: ['role'],
            },
            {
                fields: ['company_code'],
            },
            {
                fields: ['agent_code'],
            },
            {
                fields: ['is_active'],
            },
        ],
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const saltRounds = 12;
                    user.password = await bcryptjs_1.default.hash(user.password, saltRounds);
                    user.password_changed_at = new Date();
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const saltRounds = 12;
                    user.password = await bcryptjs_1.default.hash(user.password, saltRounds);
                    user.password_changed_at = new Date();
                }
            },
        },
    });
    // // Instance methods
    // User.prototype.validatePassword = async function (password: string): Promise<boolean> {
    //     return bcrypt.compare(password, this.password);
    // };
    //
    // User.prototype.toJSON = function () {
    //     const values = { ...this.get() };
    //     delete values.password;
    //     return values;
    // };
    return User;
};
exports.initUserModel = initUserModel;
//# sourceMappingURL=user.model.js.map