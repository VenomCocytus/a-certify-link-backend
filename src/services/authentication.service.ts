import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { UserModel } from '@models/user.model';
import { RoleModel } from '@models/role.model';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';
import { ValidationException } from '@exceptions/validation.exception';
import { BaseException } from '@exceptions/base.exception';
import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyEmailDto,
    ResendVerificationDto,
    TwoFactorSetupDto,
    TwoFactorDisableDto,
    UpdateProfileDto,
    CreateUserDto
} from '@dto/auth.dto';
import {ErrorCodes} from "@/constants/error-codes";

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string;
    role: {
        id: string;
        name: string;
        permissions: string[];
    };
    isActive: boolean;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
}

export class AuthenticationService {
    /**
     * Authenticate a user with email and password
     */
    async login(loginDto: LoginDto): Promise<{ user: UserProfile; tokens: AuthTokens }> {
        const { email, password, twoFactorCode, rememberMe = false } = loginDto;

        // Find the user by email with role information
        const user = await UserModel.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        if (!user) {
            throw new ValidationException('Invalid email or password');
        }

        // Check if the account is active
        if (!user.isActive) {
            throw new BaseException(
                'Account is deactivated. Please contact support.',
                ErrorCodes.ACCOUNT_DEACTIVATED,
                403
            );
        }

        // Check if the account is locked
        if (user.isAccountLocked) {
            throw new BaseException(
                'Account is temporarily locked due to too many failed login attempts. Please try again later.',
                ErrorCodes.ACCOUNT_LOCKED,
                423
            );
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            await user.incrementLoginAttempts();
            throw new ValidationException('Invalid email or password');
        }

        // Check two-factor authentication if enabled
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new ValidationException('Two-factor authentication code is required');
            }

            const isValidTwoFactor = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token: twoFactorCode,
                window: 2
            });

            if (!isValidTwoFactor) {
                await user.incrementLoginAttempts();
                throw new ValidationException('Invalid two-factor authentication code');
            }
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate tokens
        const tokens = this.generateTokens(user.id, rememberMe);

        // Create user profile
        const userProfile = this.createUserProfile(user);

        logger.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            rememberMe
        });

        return { user: userProfile, tokens };
    }

    /**
     * Register a new user
     */
    async register(registerDto: RegisterDto): Promise<{ user: UserProfile; tokens: AuthTokens }> {
        const { email, firstName, lastName, password, confirmPassword, phoneNumber, roleId } = registerDto;

        // Validate password confirmation
        if (password !== confirmPassword) {
            throw new ValidationException('Password confirmation does not match');
        }

        // Check if a user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new ValidationException('User with this email already exists');
        }

        // Get a default role if not provided
        let userRole: RoleModel | null;
        if (roleId) {
            userRole = await RoleModel.findByPk(roleId);
            if (!userRole) {
                throw new ValidationException('Invalid role specified');
            }
        } else {
            userRole = await RoleModel.getDefaultRole();
            if (!userRole) {
                throw new BaseException(
                    'No default role found. Please contact system administrator.',
                    ErrorCodes.CONFIGURATION_ERROR,
                    500
                );
            }
        }

        // Create a new user
        const user = await UserModel.createUser({
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
        const userWithRole = await UserModel.findByPk(user.id, {
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        const userProfile = this.createUserProfile(userWithRole!);

        logger.info('User registered successfully', {
            userId: user.id,
            email: user.email
        });

        return { user: userProfile, tokens };
    }

    /**
     * Change user password
     */
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

        if (newPassword !== confirmPassword) {
            throw new ValidationException('Password confirmation does not match');
        }

        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new BaseException('User not found', ErrorCodes.USER_NOT_FOUND, 404);
        }

        // Verify the current password
        const isValidCurrentPassword = await user.validatePassword(currentPassword);
        if (!isValidCurrentPassword) {
            throw new ValidationException('Current password is incorrect');
        }

        // Check if the new password is different from recent passwords
        const canChangePassword = await user.canChangePassword(newPassword);
        if (!canChangePassword) {
            throw new ValidationException('Cannot reuse a recent password. Please choose a different password.');
        }

        // Update password
        await user.updatePassword(newPassword);

        logger.info('Password changed successfully', { userId });
    }

    /**
     * Initiate the password reset process
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;

        const user = await UserModel.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists for security reasons
            return { message: 'If an account with this email exists, a password reset link has been sent.' };
        }

        // Generate reset token
        const resetToken = await user.generatePasswordResetToken();

        // TODO: Send reset email
        // await emailService.sendPasswordResetEmail(user.email, resetToken);

        logger.info('Password reset requested', {
            userId: user.id,
            email: user.email
        });

        return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }

    /**
     * Reset password using token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword, confirmPassword } = resetPasswordDto;

        if (newPassword !== confirmPassword) {
            throw new ValidationException('Password confirmation does not match');
        }

        const user = await UserModel.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            throw new ValidationException('Invalid or expired reset token');
        }

        // Check if the new password is different from recent passwords
        const canChangePassword = await user.canChangePassword(newPassword);
        if (!canChangePassword) {
            throw new ValidationException('Cannot reuse a recent password. Please choose a different password.');
        }

        // Update password
        await user.updatePassword(newPassword);

        // Reset login attempts if the account was locked
        if (user.isAccountLocked) {
            await user.resetLoginAttempts();
        }

        logger.info('Password reset successfully', { userId: user.id });

        return { message: 'Password has been reset successfully' };
    }

    /**
     * Verify email address
     */
    async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
        const { token, userId } = verifyEmailDto;

        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new ValidationException('Invalid verification link');
        }

        if (user.isEmailVerified) {
            return { message: 'Email is already verified' };
        }

        // Verify token (simplified - in production, use encrypted tokens with expiration)
        const expectedToken = crypto.createHash('sha256').update(`${user.id}${user.email}`).digest('hex');
        if (token !== expectedToken) {
            throw new ValidationException('Invalid verification link');
        }

        // Update user as verified
        await user.update({
            isEmailVerified: true,
            emailVerifiedAt: new Date()
        });

        logger.info('Email verified successfully', { userId: user.id });

        return { message: 'Email verified successfully' };
    }

    /**
     * Resend email verification
     */
    async resendEmailVerification(resendDto: ResendVerificationDto): Promise<{ message: string }> {
        const { email } = resendDto;

        const user = await UserModel.findByEmail(email);
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
    async setupTwoFactor(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new BaseException('User not found', ErrorCodes.USER_NOT_FOUND, 404);
        }

        if (user.twoFactorEnabled) {
            throw new ValidationException('Two-factor authentication is already enabled');
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `${Environment.APP_NAME} (${user.email})`,
            issuer: Environment.APP_NAME,
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

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
    async enableTwoFactor(userId: string, twoFactorDto: TwoFactorSetupDto): Promise<{ message: string }> {
        const { code } = twoFactorDto;

        const user = await UserModel.findByPk(userId);
        if (!user || !user.twoFactorSecret) {
            throw new ValidationException('Two-factor setup not initialized');
        }

        // Verify the code
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!isValid) {
            throw new ValidationException('Invalid verification code');
        }

        // Enable two-factor authentication
        await user.update({ twoFactorEnabled: true });

        logger.info('Two-factor authentication enabled', { userId });

        return { message: 'Two-factor authentication enabled successfully' };
    }

    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(userId: string, disableDto: TwoFactorDisableDto): Promise<{ message: string }> {
        const { password, code } = disableDto;

        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new BaseException('User not found', ErrorCodes.USER_NOT_FOUND, 404);
        }

        if (!user.twoFactorEnabled) {
            throw new ValidationException('Two-factor authentication is not enabled');
        }

        // Verify password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new ValidationException('Invalid password');
        }

        // Verify two-factor code
        const isValidCode = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!isValidCode) {
            throw new ValidationException('Invalid verification code');
        }

        // Disable two-factor authentication
        await user.update({
            twoFactorEnabled: false,
            twoFactorSecret: null as unknown as string
        });

        logger.info('Two-factor authentication disabled', { userId });

        return { message: 'Two-factor authentication disabled successfully' };
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserProfile> {
        const user = await UserModel.findByPk(userId, {
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        if (!user) {
            throw new BaseException('User not found', ErrorCodes.USER_NOT_FOUND, 404);
        }

        await user.update(updateDto);

        logger.info('Profile updated successfully', { userId });

        return this.createUserProfile(user);
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<UserProfile> {
        const user = await UserModel.findByPk(userId, {
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        if (!user) {
            throw new BaseException('User not found', ErrorCodes.USER_NOT_FOUND, 404);
        }

        return this.createUserProfile(user);
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const decoded = jwt.verify(refreshToken, Environment.JWT_REFRESH_SECRET as string) as any;

        const user = await UserModel.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            throw new ValidationException('Invalid refresh token');
        }

        return this.generateTokens(user.id);
    }

    /**
     * Logout user (invalidate tokens)
     */
    async logout(userId: string, logoutAll = false): Promise<{ message: string }> {
        // In a production environment, you would maintain a token black list
        // or use Redis to track active sessions

        if (logoutAll) {
            // Invalidate all sessions for this user
            // This could be implemented by incrementing a user version number
            // or maintaining session tracking in Redis
        }

        logger.info('User logged out', { userId, logoutAll });

        return { message: 'Logged out successfully' };
    }

    /**
     * Create user (admin function)
     */
    async createUser(createUserDto: CreateUserDto): Promise<UserProfile> {
        const { email, firstName, lastName, phoneNumber, roleId, isActive = true } = createUserDto;

        // Check if a user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new ValidationException('User with this email already exists');
        }

        // Verify role exists
        const role = await RoleModel.findByPk(roleId);
        if (!role) {
            throw new ValidationException('Invalid role specified');
        }

        // Generate temporary password
        const temporaryPassword = crypto.randomBytes(12).toString('hex');

        // Create user
        const user = await UserModel.createUser({
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
        const userWithRole = await UserModel.findByPk(user.id, {
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        logger.info('User created by admin', {
            createdUserId: user.id,
            email: user.email
        });

        return this.createUserProfile(userWithRole!);
    }

    /**
     * Generate JWT tokens
     */
    private generateTokens(userId: string, rememberMe = false): AuthTokens {
        const accessTokenExpiry = rememberMe ? '7d' : '15m';
        const refreshTokenExpiry = rememberMe ? '90d' : '7d';

        const accessToken = jwt.sign(
            {
                userId,
                type: 'access',
                iat: Math.floor(Date.now() / 1000)
            },
            Environment.JWT_SECRET as string,
            { expiresIn: accessTokenExpiry }
        );

        const refreshToken = jwt.sign(
            {
                userId,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            },
            Environment.JWT_REFRESH_SECRET as string,
            { expiresIn: refreshTokenExpiry }
        );

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
    private createUserProfile(user: UserModel): UserProfile {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: {
                id: (user as any).role?.id || user.roleId,
                name: (user as any).role?.name || 'USER',
                permissions: (user as any).role?.permissions || []
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
    private async generateEmailVerificationToken(user: UserModel): Promise<void> {
        // Generate verification token (simplified)
        const token = crypto.createHash('sha256').update(`${user.id}${user.email}`).digest('hex');

        // TODO: Send verification email
        // await emailService.sendVerificationEmail(user.email, token, user.id);

        logger.info('Email verification token generated', { userId: user.id });
    }
}