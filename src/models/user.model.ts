import {DataTypes, Model, Op, Optional} from 'sequelize';
import { PasswordHistory } from './password-history.model';
import { sequelize } from '@config/database';
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

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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
            resetPasswordExpiresAt: null as unknown as Date
        });

        // Create a password history entry
        const { PasswordHistory } = require('./password-history.model');
        await PasswordHistory.create({
            userId: this.id,
            passwordHash: hashedPassword,
            changedAt: new Date()
        });
    }

    public async canChangePassword(newPassword: string): Promise<boolean> {
        const { PasswordHistory } = require('./password-history.model');

        // Get last 5 passwords
        const recentPasswords = await PasswordHistory.findAll({
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
    public static async findByEmail(email: string): Promise<User | null> {
        return User.findOne({
            where: { email: email.toLowerCase() },
            include: ['role']
        });
    }

    public static async createUser(userData: UserCreationAttributes): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await User.create({
            ...userData,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            passwordChangedAt: new Date()
        });

        // Create an initial password history entry
        await PasswordHistory.create({
            userId: user.id,
            passwordHash: hashedPassword
        });

        return user;
    }

    public static async cleanupExpiredBlocks(): Promise<void> {
        await User.update(
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

User.init({
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
        allowNull: false,
        validate: {
            len: [1, 100],
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100],
            notEmpty: true
        }
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
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
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    blockedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    blockedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    twoFactorSecret: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['roleId']
        },
        {
            fields: ['isActive']
        },
        {
            fields: ['isBlocked']
        },
        {
            fields: ['resetPasswordToken']
        }
    ],
    hooks: {
        beforeValidate: (user: User) => {
            if (user.email) {
                user.email = user.email.toLowerCase();
            }
        },
        beforeUpdate: (user: User) => {
            user.setDataValue('updatedAt', new Date());
        }
    }
});

export default User;