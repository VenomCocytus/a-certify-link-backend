import { Model, Optional, Sequelize } from 'sequelize';
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
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phoneNumber' | 'isActive' | 'isEmailVerified' | 'emailVerifiedAt' | 'lastLoginAt' | 'loginAttempts' | 'isBlocked' | 'blockedAt' | 'blockedUntil' | 'passwordChangedAt' | 'resetPasswordToken' | 'resetPasswordExpiresAt' | 'twoFactorEnabled' | 'twoFactorSecret' | 'createdAt' | 'updatedAt'> {
}
export declare class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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
    readonly createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
    get isAccountLocked(): boolean;
    validatePassword(password: string): Promise<boolean>;
    updatePassword(newPassword: string): Promise<void>;
    canChangePassword(newPassword: string): Promise<boolean>;
    incrementLoginAttempts(): Promise<void>;
    resetLoginAttempts(): Promise<void>;
    generatePasswordResetToken(): Promise<string>;
    static findByEmail(email: string): Promise<UserModel | null>;
    static createUser(userData: UserCreationAttributes): Promise<UserModel>;
    static cleanupExpiredBlocks(): Promise<void>;
}
export declare function initUserModel(sequelize: Sequelize): typeof UserModel;
export default UserModel;
//# sourceMappingURL=user.model.d.ts.map