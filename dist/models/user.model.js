"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
exports.initUserModel = initUserModel;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserModel extends sequelize_1.Model {
    // Virtual fields
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    get isAccountLocked() {
        return this.isBlocked && (!this.blockedUntil || this.blockedUntil > new Date());
    }
    // Instance methods
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
    async updatePassword(newPassword) {
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await this.update({
            password: hashedPassword,
            passwordChangedAt: new Date(),
            resetPasswordToken: null,
            resetPasswordExpiresAt: null,
        });
        // Create a password history entry
        const { PasswordHistoryModel } = require('./password-history.model');
        await PasswordHistoryModel.create({
            userId: this.id,
            passwordHash: hashedPassword,
            changedAt: new Date()
        });
    }
    async canChangePassword(newPassword) {
        const { PasswordHistoryModel } = require('./password-history.model');
        // Get last 5 passwords
        const recentPasswords = await PasswordHistoryModel.findAll({
            where: { userId: this.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        // Check if the new password matches any of the recent ones
        for (const passwordEntry of recentPasswords) {
            const isMatch = await bcryptjs_1.default.compare(newPassword, passwordEntry.passwordHash);
            if (isMatch) {
                return false;
            }
        }
        return true;
    }
    async incrementLoginAttempts() {
        const maxAttempts = 5;
        const lockoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
        const newAttempts = this.loginAttempts + 1;
        if (newAttempts >= maxAttempts) {
            await this.update({
                loginAttempts: newAttempts,
                isBlocked: true,
                blockedAt: new Date(),
                blockedUntil: new Date(Date.now() + lockoutDuration)
            });
        }
        else {
            await this.update({
                loginAttempts: newAttempts
            });
        }
    }
    async resetLoginAttempts() {
        await this.update({
            loginAttempts: 0,
            isBlocked: false,
            blockedAt: null,
            blockedUntil: null,
            lastLoginAt: new Date()
        });
    }
    async generatePasswordResetToken() {
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.update({
            resetPasswordToken: token,
            resetPasswordExpiresAt: expiresAt
        });
        return token;
    }
    // Static methods
    static async findByEmail(email) {
        return this.findOne({
            where: { email: email.toLowerCase() },
            include: ['role']
        });
    }
    static async createUser(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        const user = await this.create({
            ...userData,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            passwordChangedAt: new Date()
        });
        // Create an initial password history entry
        const { PasswordHistoryModel } = require('./password-history.model');
        await PasswordHistoryModel.create({
            userId: user.id,
            passwordHash: hashedPassword
        });
        return user;
    }
    static async cleanupExpiredBlocks() {
        await this.update({
            isBlocked: false,
            blockedAt: null,
            blockedUntil: null,
            loginAttempts: 0
        }, {
            where: {
                isBlocked: true,
                blockedUntil: {
                    [sequelize_1.Op.lt]: new Date()
                }
            }
        });
    }
}
exports.UserModel = UserModel;
// Model initialization function
function initUserModel(sequelize) {
    UserModel.init({
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
                len: [5, 255]
            },
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            field: 'first_name',
            allowNull: false,
            validate: {
                len: [1, 100],
                notEmpty: true
            }
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(100),
            field: 'last_name',
            allowNull: false,
            validate: {
                len: [1, 100],
                notEmpty: true
            }
        },
        phoneNumber: {
            type: sequelize_1.DataTypes.STRING(20),
            field: 'phone_number',
            allowNull: true,
            validate: {
                len: [10, 20]
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [8, 255]
            }
        },
        roleId: {
            type: sequelize_1.DataTypes.UUID,
            field: 'role_id',
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
            allowNull: false
        },
        isEmailVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            field: 'is_email_verified',
            defaultValue: false,
            allowNull: false
        },
        emailVerifiedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'email_verified_at',
            allowNull: true
        },
        lastLoginAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'last_login_at',
            allowNull: true
        },
        loginAttempts: {
            type: sequelize_1.DataTypes.INTEGER,
            field: 'login_attempts',
            defaultValue: 0,
            allowNull: false
        },
        isBlocked: {
            type: sequelize_1.DataTypes.BOOLEAN,
            field: 'is_blocked',
            defaultValue: false,
            allowNull: false
        },
        blockedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'blocked_at',
            allowNull: true
        },
        blockedUntil: {
            type: sequelize_1.DataTypes.DATE,
            field: 'blocked_until',
            allowNull: true
        },
        passwordChangedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'password_changed_at',
            allowNull: true
        },
        resetPasswordToken: {
            type: sequelize_1.DataTypes.STRING(255),
            field: 'reset_password_token',
            allowNull: true
        },
        resetPasswordExpiresAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'reset_password_expires_at',
            allowNull: true
        },
        twoFactorEnabled: {
            type: sequelize_1.DataTypes.BOOLEAN,
            field: 'two_factor_enabled',
            defaultValue: false,
            allowNull: false
        },
        twoFactorSecret: {
            type: sequelize_1.DataTypes.STRING(255),
            field: 'two_factor_secret',
            allowNull: true
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'updated_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['role_id']
            },
            {
                fields: ['is_active']
            },
            {
                fields: ['is_blocked']
            },
            {
                fields: ['reset_password_token']
            }
        ],
        hooks: {
            beforeValidate: (user) => {
                if (user.email) {
                    user.setDataValue('email', user.email.toLowerCase());
                }
            },
            beforeUpdate: (user) => {
                user.setDataValue('updatedAt', new Date());
            }
        }
    });
    return UserModel;
}
exports.default = UserModel;
//# sourceMappingURL=user.model.js.map