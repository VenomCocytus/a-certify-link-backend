"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const user_model_1 = require("@models/user.model");
const role_model_1 = require("@models/role.model");
const environment_1 = require("@config/environment");
const logger_1 = require("@utils/logger");
const validation_exception_1 = require("@exceptions/validation.exception");
const base_exception_1 = require("@exceptions/base.exception");
const error_codes_1 = require("@/constants/error-codes");
class AuthenticationService {
    /**
     * Authenticate a user with email and password
     */
    async login(loginDto) {
        const { email, password, twoFactorCode, rememberMe = false } = loginDto;
        // Find the user by email with role information
        const user = await user_model_1.UserModel.findOne({
            where: { email: email },
            include: [{
                    model: role_model_1.RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
        });
        if (!user) {
            throw new validation_exception_1.ValidationException('Invalid email or password');
        }
        // Check if the account is locked
        // if (user.isAccountLocked) {
        //     throw new BaseException(
        //         'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        //         ErrorCodes.ACCOUNT_LOCKED,
        //         423
        //     );
        // }
        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            await user.incrementLoginAttempts();
            throw new validation_exception_1.ValidationException('Invalid email or password');
        }
        // Check if the account is active
        if (!user.isActive) {
            throw new base_exception_1.BaseException('Account is deactivated. Please contact support.', error_codes_1.ErrorCodes.ACCOUNT_DEACTIVATED, 403);
        }
        // Check two-factor authentication if enabled
        // if (user.twoFactorEnabled) {
        //     if (!twoFactorCode) {
        //         throw new ValidationException('Two-factor authentication code is required');
        //     }
        //
        //     const isValidTwoFactor = speakeasy.totp.verify({
        //         secret: user.twoFactorSecret!,
        //         encoding: 'base32',
        //         token: twoFactorCode,
        //         window: 2
        //     });
        //
        //     if (!isValidTwoFactor) {
        //         await user.incrementLoginAttempts();
        //         throw new ValidationException('Invalid two-factor authentication code');
        //     }
        // }
        // Reset login attempts on successful login
        await user.resetLoginAttempts();
        // Generate tokens
        const tokens = this.generateTokens(user.id, rememberMe);
        // Create user profile
        const userProfile = this.createUserProfile(user);
        logger_1.logger.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            rememberMe
        });
        return { user: userProfile, tokens };
    }
    /**
     * Register a new user
     */
    async register(registerDto) {
        const { email, firstName, lastName, password, confirmPassword, phoneNumber, roleId } = registerDto;
        // Validate password confirmation
        if (password !== confirmPassword) {
            throw new validation_exception_1.ValidationException('Password confirmation does not match');
        }
        // Check if a user already exists
        const existingUser = await user_model_1.UserModel.findByEmail(email);
        if (existingUser) {
            throw new validation_exception_1.ValidationException('User with this email already exists');
        }
        // Get a default role if not provided
        let userRole;
        if (roleId) {
            userRole = await role_model_1.RoleModel.findByPk(roleId);
            if (!userRole) {
                throw new validation_exception_1.ValidationException('Invalid role specified');
            }
        }
        else {
            userRole = await role_model_1.RoleModel.getDefaultRole();
            if (!userRole) {
                throw new base_exception_1.BaseException('No default role found. Please contact system administrator.', error_codes_1.ErrorCodes.CONFIGURATION_ERROR, 500);
            }
        }
        // Create a new user
        const user = await user_model_1.UserModel.createUser({
            email,
            firstName,
            lastName,
            password,
            phoneNumber,
            roleId: userRole.id
        });
        // Generate email verification token
        await this.generateEmailVerificationToken(user);
        // Generate tokens
        const tokens = this.generateTokens(user.id);
        // Create a user profile (include role information)
        const userWithRole = await user_model_1.UserModel.findByPk(user.id, {
            include: [{
                    model: role_model_1.RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
        });
        const userProfile = this.createUserProfile(userWithRole);
        logger_1.logger.info('User registered successfully', {
            userId: user.id,
            email: user.email
        });
        return { user: userProfile, tokens };
    }
    /**
     * Change user password
     */
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
        if (newPassword !== confirmPassword) {
            throw new validation_exception_1.ValidationException('Password confirmation does not match');
        }
        const user = await user_model_1.UserModel.findByPk(userId);
        if (!user) {
            throw new base_exception_1.BaseException('User not found', error_codes_1.ErrorCodes.USER_NOT_FOUND, 404);
        }
        // Verify the current password
        const isValidCurrentPassword = await user.validatePassword(currentPassword);
        if (!isValidCurrentPassword) {
            throw new validation_exception_1.ValidationException('Current password is incorrect');
        }
        // Check if the new password is different from recent passwords
        const canChangePassword = await user.canChangePassword(newPassword);
        if (!canChangePassword) {
            throw new validation_exception_1.ValidationException('Cannot reuse a recent password. Please choose a different password.');
        }
        // Update password
        await user.updatePassword(newPassword);
        logger_1.logger.info('Password changed successfully', { userId });
    }
    /**
     * Initiate the password reset process
     */
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await user_model_1.UserModel.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists for security reasons
            return { message: 'If an account with this email exists, a password reset link has been sent.' };
        }
        // Generate reset token
        const resetToken = await user.generatePasswordResetToken();
        // TODO: Send reset email
        // await emailService.sendPasswordResetEmail(user.email, resetToken);
        logger_1.logger.info('Password reset requested', {
            userId: user.id,
            email: user.email
        });
        return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }
    /**
     * Reset password using token
     */
    async resetPassword(resetPasswordDto) {
        const { token, newPassword, confirmPassword } = resetPasswordDto;
        if (newPassword !== confirmPassword) {
            throw new validation_exception_1.ValidationException('Password confirmation does not match');
        }
        const user = await user_model_1.UserModel.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: { [require('sequelize').Op.gt]: new Date() }
            }
        });
        if (!user) {
            throw new validation_exception_1.ValidationException('Invalid or expired reset token');
        }
        // Check if the new password is different from recent passwords
        const canChangePassword = await user.canChangePassword(newPassword);
        if (!canChangePassword) {
            throw new validation_exception_1.ValidationException('Cannot reuse a recent password. Please choose a different password.');
        }
        // Update password
        await user.updatePassword(newPassword);
        // Reset login attempts if the account was locked
        if (user.isAccountLocked) {
            await user.resetLoginAttempts();
        }
        logger_1.logger.info('Password reset successfully', { userId: user.id });
        return { message: 'Password has been reset successfully' };
    }
    /**
     * Verify email address
     */
    async verifyEmail(verifyEmailDto) {
        const { token, userId } = verifyEmailDto;
        const user = await user_model_1.UserModel.findByPk(userId);
        if (!user) {
            throw new validation_exception_1.ValidationException('Invalid verification link');
        }
        if (user.isEmailVerified) {
            return { message: 'Email is already verified' };
        }
        // Verify token (simplified - in production, use encrypted tokens with expiration)
        const expectedToken = crypto_1.default.createHash('sha256').update(`${user.id}${user.email}`).digest('hex');
        if (token !== expectedToken) {
            throw new validation_exception_1.ValidationException('Invalid verification link');
        }
        // Update user as verified
        await user.update({
            isEmailVerified: true,
            emailVerifiedAt: new Date()
        });
        logger_1.logger.info('Email verified successfully', { userId: user.id });
        return { message: 'Email verified successfully' };
    }
    /**
     * Resend email verification
     */
    async resendEmailVerification(resendDto) {
        const { email } = resendDto;
        const user = await user_model_1.UserModel.findByEmail(email);
        if (!user) {
            return { message: 'If an account with this email exists, a verification email has been sent.' };
        }
        if (user.isEmailVerified) {
            return { message: 'Email is already verified' };
        }
        await this.generateEmailVerificationToken(user);
        return { message: 'If an account with this email exists, a verification email has been sent.' };
    }
    /**
     * Set up two-factor authentication
     */
    async setupTwoFactor(userId) {
        const user = await user_model_1.UserModel.findByPk(userId);
        if (!user) {
            throw new base_exception_1.BaseException('User not found', error_codes_1.ErrorCodes.USER_NOT_FOUND, 404);
        }
        if (user.twoFactorEnabled) {
            throw new validation_exception_1.ValidationException('Two-factor authentication is already enabled');
        }
        // Generate secret
        const secret = speakeasy_1.default.generateSecret({
            name: `${environment_1.Environment.APP_NAME} (${user.email})`,
            issuer: environment_1.Environment.APP_NAME,
            length: 32
        });
        // Generate QR code
        const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
        // Save secret temporarily (not enabled until verification)
        await user.update({ twoFactorSecret: secret.base32 });
        return {
            secret: secret.base32,
            qrCodeUrl
        };
    }
    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor(userId, twoFactorDto) {
        const { code } = twoFactorDto;
        const user = await user_model_1.UserModel.findByPk(userId);
        if (!user || !user.twoFactorSecret) {
            throw new validation_exception_1.ValidationException('Two-factor setup not initialized');
        }
        // Verify the code
        const isValid = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2
        });
        if (!isValid) {
            throw new validation_exception_1.ValidationException('Invalid verification code');
        }
        // Enable two-factor authentication
        await user.update({ twoFactorEnabled: true });
        logger_1.logger.info('Two-factor authentication enabled', { userId });
        return { message: 'Two-factor authentication enabled successfully' };
    }
    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(userId, disableDto) {
        const { password, code } = disableDto;
        const user = await user_model_1.UserModel.findByPk(userId);
        if (!user) {
            throw new base_exception_1.BaseException('User not found', error_codes_1.ErrorCodes.USER_NOT_FOUND, 404);
        }
        if (!user.twoFactorEnabled) {
            throw new validation_exception_1.ValidationException('Two-factor authentication is not enabled');
        }
        // Verify password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new validation_exception_1.ValidationException('Invalid password');
        }
        // Verify two-factor code
        const isValidCode = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2
        });
        if (!isValidCode) {
            throw new validation_exception_1.ValidationException('Invalid verification code');
        }
        // Disable two-factor authentication
        await user.update({
            twoFactorEnabled: false,
            twoFactorSecret: null
        });
        logger_1.logger.info('Two-factor authentication disabled', { userId });
        return { message: 'Two-factor authentication disabled successfully' };
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, updateDto) {
        const user = await user_model_1.UserModel.findByPk(userId, {
            include: [{
                    model: role_model_1.RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
        });
        if (!user) {
            throw new base_exception_1.BaseException('User not found', error_codes_1.ErrorCodes.USER_NOT_FOUND, 404);
        }
        await user.update(updateDto);
        logger_1.logger.info('Profile updated successfully', { userId });
        return this.createUserProfile(user);
    }
    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await user_model_1.UserModel.findByPk(userId, {
            include: [{
                    model: role_model_1.RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
        });
        if (!user) {
            throw new base_exception_1.BaseException('User not found', error_codes_1.ErrorCodes.USER_NOT_FOUND, 404);
        }
        return this.createUserProfile(user);
    }
    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, environment_1.Environment.JWT_REFRESH_SECRET);
        const user = await user_model_1.UserModel.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            throw new validation_exception_1.ValidationException('Invalid refresh token');
        }
        return this.generateTokens(user.id);
    }
    /**
     * Logout user (invalidate tokens)
     */
    async logout(userId, logoutAll = false) {
        // In a production environment, you would maintain a token black list
        // or use Redis to track active sessions
        if (logoutAll) {
            // Invalidate all sessions for this user
            // This could be implemented by incrementing a user version number
            // or maintaining session tracking in Redis
        }
        logger_1.logger.info('User logged out', { userId, logoutAll });
        return { message: 'Logged out successfully' };
    }
    /**
     * Create user (admin function)
     */
    async createUser(createUserDto) {
        const { email, firstName, lastName, phoneNumber, roleId, isActive = true } = createUserDto;
        // Check if a user already exists
        const existingUser = await user_model_1.UserModel.findByEmail(email);
        if (existingUser) {
            throw new validation_exception_1.ValidationException('User with this email already exists');
        }
        // Verify role exists
        const role = await role_model_1.RoleModel.findByPk(roleId);
        if (!role) {
            throw new validation_exception_1.ValidationException('Invalid role specified');
        }
        // Generate temporary password
        const temporaryPassword = crypto_1.default.randomBytes(12).toString('hex');
        // Create user
        const user = await user_model_1.UserModel.createUser({
            email,
            firstName,
            lastName,
            password: temporaryPassword,
            phoneNumber,
            roleId,
            isActive
        });
        // Generate email verification token
        await this.generateEmailVerificationToken(user);
        // TODO: Send welcome email with temporary password
        // await emailService.sendWelcomeEmail(user.email, temporaryPassword);
        // Get user with role information
        const userWithRole = await user_model_1.UserModel.findByPk(user.id, {
            include: [{
                    model: role_model_1.RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
        });
        logger_1.logger.info('User created by admin', {
            createdUserId: user.id,
            email: user.email
        });
        return this.createUserProfile(userWithRole);
    }
    /**
     * Generate JWT tokens
     */
    generateTokens(userId, rememberMe = false) {
        const accessTokenExpiry = rememberMe ? '7d' : '15m';
        const refreshTokenExpiry = rememberMe ? '90d' : '7d';
        const accessToken = jsonwebtoken_1.default.sign({
            userId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000)
        }, environment_1.Environment.JWT_SECRET, { expiresIn: accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({
            userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        }, environment_1.Environment.JWT_REFRESH_SECRET, { expiresIn: refreshTokenExpiry });
        return {
            accessToken,
            refreshToken,
            expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 15 * 60, // seconds
            tokenType: 'Bearer'
        };
    }
    /**
     * Create a user profile object
     */
    createUserProfile(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: {
                id: user.role?.id || user.roleId,
                name: user.role?.name || 'USER',
                permissions: user.role?.permissions || []
            },
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt
        };
    }
    /**
     * Generate email verification token
     */
    async generateEmailVerificationToken(user) {
        // Generate verification token (simplified)
        const token = crypto_1.default.createHash('sha256').update(`${user.id}${user.email}`).digest('hex');
        // TODO: Send verification email
        // await emailService.sendVerificationEmail(user.email, token, user.id);
        logger_1.logger.info('Email verification token generated', { userId: user.id });
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map