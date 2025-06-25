import { DataTypes, Model, Op, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

// User attributes interface
export interface UserAttributes {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password: string;
    roleId: string;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    loginAttempts: number;
    isBlocked: boolean;
    blockedAt?: Date;
    blockedUntil?: Date;
    passwordChangedAt?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiresAt?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Optional attributes for creation
export interface UserCreationAttributes extends Optional<UserAttributes,
    'id' | 'phoneNumber' | 'isActive' | 'isEmailVerified' | 'emailVerifiedAt' |
    'lastLoginAt' | 'loginAttempts' | 'isBlocked' | 'blockedAt' | 'blockedUntil' |
    'passwordChangedAt' | 'resetPasswordToken' | 'resetPasswordExpiresAt' |
    'twoFactorEnabled' | 'twoFactorSecret' | 'createdAt' | 'updatedAt'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public firstName!: string;
    public lastName!: string;
    public phoneNumber?: string;
    public password!: string;
    public roleId!: string;
    public isActive!: boolean;
    public isEmailVerified!: boolean;
    public emailVerifiedAt?: Date;
    public lastLoginAt?: Date;
    public loginAttempts!: number;
    public isBlocked!: boolean;
    public blockedAt?: Date;
    public blockedUntil?: Date;
    public passwordChangedAt?: Date;
    public resetPasswordToken?: string;
    public resetPasswordExpiresAt?: Date;
    public twoFactorEnabled!: boolean;
    public twoFactorSecret?: string;
    public readonly createdAt!: Date;
    public updatedAt!: Date;

    // Virtual fields
    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public get isAccountLocked(): boolean {
        return this.isBlocked && (!this.blockedUntil || this.blockedUntil > new Date());
    }

    // Instance methods
    public async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    public async updatePassword(newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await this.update({
            password: hashedPassword,
            passwordChangedAt: new Date(),
            resetPasswordToken: null as unknown as string,
            resetPasswordExpiresAt: null as unknown as Date,
        });

        // Create a password history entry
        const { PasswordHistoryModel } = require('./password-history.model');
        await PasswordHistoryModel.create({
            userId: this.id,
            passwordHash: hashedPassword,
            changedAt: new Date()
        });
    }

    public async canChangePassword(newPassword: string): Promise<boolean> {
        const { PasswordHistoryModel } = require('./password-history.model');

        // Get last 5 passwords
        const recentPasswords = await PasswordHistoryModel.findAll({
            where: { userId: this.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Check if the new password matches any of the recent ones
        for (const passwordEntry of recentPasswords) {
            const isMatch = await bcrypt.compare(newPassword, passwordEntry.passwordHash);
            if (isMatch) {
                return false;
            }
        }

        return true;
    }

    public async incrementLoginAttempts(): Promise<void> {
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
        } else {
            await this.update({
                loginAttempts: newAttempts
            });
        }
    }

    public async resetLoginAttempts(): Promise<void> {
        await this.update({
            loginAttempts: 0,
            isBlocked: false,
            blockedAt: null as unknown as Date,
            blockedUntil: null as unknown as Date,
            lastLoginAt: new Date()
        });
    }

    public async generatePasswordResetToken(): Promise<string> {
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
    public static async findByEmail(email: string): Promise<UserModel | null> {
        return this.findOne({
            where: { email: email.toLowerCase() },
            include: ['role']
        });
    }

    public static async createUser(userData: UserCreationAttributes): Promise<UserModel> {
        const hashedPassword = await bcrypt.hash(userData.password, 12);

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

    public static async cleanupExpiredBlocks(): Promise<void> {
        await this.update(
            {
                isBlocked: false,
                blockedAt: null as unknown as Date,
                blockedUntil: null as unknown as Date,
                loginAttempts: 0
            },
            {
                where: {
                    isBlocked: true,
                    blockedUntil: {
                        [Op.lt]: new Date()
                    }
                }
            }
        );
    }
}

// Model initialization function
export function initUserModel(sequelize: Sequelize): typeof UserModel {
    UserModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                len: [5, 255]
            },
            set(value: string) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        firstName: {
            type: DataTypes.STRING(100),
            field: 'first_name',
            allowNull: false,
            validate: {
                len: [1, 100],
                notEmpty: true
            }
        },
        lastName: {
            type: DataTypes.STRING(100),
            field: 'last_name',
            allowNull: false,
            validate: {
                len: [1, 100],
                notEmpty: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING(20),
            field: 'phone_number',
            allowNull: true,
            validate: {
                len: [10, 20]
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [8, 255]
            }
        },
        roleId: {
            type: DataTypes.UUID,
            field: 'role_id',
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
            allowNull: false
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            field: 'is_email_verified',
            defaultValue: false,
            allowNull: false
        },
        emailVerifiedAt: {
            type: DataTypes.DATE,
            field: 'email_verified_at',
            allowNull: true
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            field: 'last_login_at',
            allowNull: true
        },
        loginAttempts: {
            type: DataTypes.INTEGER,
            field: 'login_attempts',
            defaultValue: 0,
            allowNull: false
        },
        isBlocked: {
            type: DataTypes.BOOLEAN,
            field: 'is_blocked',
            defaultValue: false,
            allowNull: false
        },
        blockedAt: {
            type: DataTypes.DATE,
            field: 'blocked_at',
            allowNull: true
        },
        blockedUntil: {
            type: DataTypes.DATE,
            field: 'blocked_until',
            allowNull: true
        },
        passwordChangedAt: {
            type: DataTypes.DATE,
            field: 'password_changed_at',
            allowNull: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            field: 'reset_password_token',
            allowNull: true
        },
        resetPasswordExpiresAt: {
            type: DataTypes.DATE,
            field: 'reset_password_expires_at',
            allowNull: true
        },
        twoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            field: 'two_factor_enabled',
            defaultValue: false,
            allowNull: false
        },
        twoFactorSecret: {
            type: DataTypes.STRING(255),
            field: 'two_factor_secret',
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
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
            beforeValidate: (user: UserModel) => {
                if (user.email) {
                    user.setDataValue('email', user.email.toLowerCase());
                }
            },
            beforeUpdate: (user: UserModel) => {
                user.setDataValue('updatedAt', new Date());
            }
        }
    });

    return UserModel;
}

export default UserModel;