import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/user.repository';
import { AuditService } from './audit.service';
import { UserModel } from '@/models';
import { Environment } from '@config/environment';
import { ValidationException } from '@exceptions/validation.exception';
import { NotFoundException } from '@exceptions/notFound.exception';
import { logger } from '@utils/logger';
import {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest, ResetPasswordRequest,
    TokenPayload, UnlockAccountRequest,
    VerifyTokenRequest
} from "@dto/auth.dto";

export class AuthService {
    private userRepository: UserRepository;
    private auditService: AuditService;

    constructor() {
        this.userRepository = new UserRepository();
        this.auditService = new AuditService();
    }

    //TODO: Obliger le user a changer son mot de passe lors de la première connexion
    //TODO: Sauvegarder les 05 derniers mots de passe, le nouveau doit etre différent des 05 derniers
    //TODO: Historiser les mots de passe
    //TODO: Historiser les addresses Ip
    //TODO: Historiser les derniers tentatives de connexion
    //TODO: Changer la date du dernier changement de mot de passe lors de la connexion
    //TODO: Bloquer le tentative de connexion echouees

    /**
     * Authenticate a user with email and password
     */
    async login(credentials: LoginRequest, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<AuthResponse> {
        const { email, password } = credentials;

        // Find the user by email
        const user = await this.userRepository.findByEmail(email.toLowerCase());
        if (!user) {
            // Log failed login attempt
            logger.warn('Login attempt with invalid email', {
                email,
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
            });
            throw new ValidationException('Invalid email or password');
        }

        // Check if an account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            const lockTimeRemaining = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
            logger.warn('Login attempt on locked account', {
                userId: user.id,
                email: user.email,
                lockTimeRemaining,
                ipAddress: context?.ipAddress,
            });
            throw new ValidationException(`Account is locked. Try again in ${lockTimeRemaining} minutes`);
        }

        // Check if an account is active
        if (!user.is_active) {
            logger.warn('Login attempt on disabled account', {
                userId: user.id,
                email: user.email,
                ipAddress: context?.ipAddress,
            });
            throw new ValidationException('Account is disabled');
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await this.userRepository.incrementFailedLoginAttempts(user.id);

            logger.warn('Login attempt with invalid password', {
                userId: user.id,
                email: user.email,
                failedAttempts: user.failed_login_attempts + 1,
                ipAddress: context?.ipAddress,
            });

            throw new ValidationException('Invalid email or password');
        }

        // Update last login and reset failed attempts
        await this.userRepository.updateLastLogin(user.id);

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Log successful login
        await this.auditService.logAction({
            userId: user.id,
            action: 'login',
            resourceType: 'user',
            resourceId: user.id,
            metadata: {
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
                sessionId: context?.sessionId,
                loginTime: new Date().toISOString(),
            },
        });

        logger.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code,
            ipAddress: context?.ipAddress,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                companyCode: user.company_code || undefined,
                agentCode: user.agent_code || undefined,
                permissions: user.permissions || [],
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 86400, // 24 hours in seconds
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
        const { refreshToken } = request;

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, Environment.JWT_SECRET) as TokenPayload;

        if (decoded.type !== 'refresh') {
            throw new ValidationException('Invalid refresh token type');
        }

        // Find user
        const user = await this.userRepository.findById(decoded.id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if the user is still active
        if (!user.is_active) {
            throw new ValidationException('Account is disabled');
        }

        // Check if an account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            throw new ValidationException('Account is locked');
        }

        // Generate new tokens
        const tokens = this.generateTokens(user);

        logger.info('Token refreshed successfully', {
            userId: user.id,
            email: user.email,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                companyCode: user.company_code || undefined,
                agentCode: user.agent_code || undefined,
                permissions: user.permissions || [],
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 86400,
        };
    }

    /**
     * Logout user (optional: blacklist token)
     */
    async logout(userId: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void> {
        // In a production environment with Redis, you would banlist the token here.
        // For now, we'll just log the logout event

        await this.auditService.logAction({
            userId,
            action: 'logout',
            resourceType: 'user',
            resourceId: userId,
            metadata: {
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
                sessionId: context?.sessionId,
                logoutTime: new Date().toISOString(),
            },
        });

        logger.info('User logged out', {
            userId,
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
        });
    }

    /**
     * Verify JWT token
     */
    verifyToken(request: VerifyTokenRequest): TokenPayload {
        const { token } = request;
        const decoded = jwt.verify(token, Environment.JWT_SECRET) as TokenPayload;

        if (decoded.type === 'refresh') {
            throw new ValidationException('Cannot use refresh token as access token');
        }

        return decoded;
    }

    /**
     * Change user password
     */
    async changePassword(
        userId: string,
        request: ChangePasswordRequest,
        context?: {
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
        }
    ): Promise<void> {
        const user = await this.userRepository.findById(userId);
        const { currentPassword, newPassword } = request;
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify the current password
        const isCurrentPasswordValid = await user.validatePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new ValidationException('Current password is incorrect');
        }

        // Validate new password strength
        this.validatePasswordStrength(newPassword);

        // Update password
        await this.userRepository.update(userId, {
            password: newPassword, // Will be hashed by model hook
            password_changed_at: new Date(),
        });

        // Log password change
        await this.auditService.logAction({
            userId,
            action: 'password_changed',
            resourceType: 'user',
            resourceId: userId,
            metadata: {
                changedAt: new Date().toISOString(),
            },
        });

        logger.info('Password changed successfully', {
            userId,
            email: user.email,
            ipAddress: context?.ipAddress
        });
    }

    /**
     * Reset password (admin function)
     */
    async resetPassword(request: ResetPasswordRequest,
                        adminUserId: string,
                        context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void> {
        const { userId, newPassword } = request;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate new password strength
        this.validatePasswordStrength(newPassword);

        // Update password
        await this.userRepository.update(userId, {
            password: newPassword,
            password_changed_at: new Date(),
            failed_login_attempts: 0, // Reset failed attempts
            locked_until: null, // Unlock account
        });

        // Log password reset
        await this.auditService.logAction({
            userId: adminUserId,
            action: 'password_reset',
            resourceType: 'user',
            resourceId: userId,
            metadata: {
                targetUserId: userId,
                targetUserEmail: user.email,
                resetAt: new Date().toISOString(),
            },
        });

        logger.info('Password reset by admin', {
            adminUserId,
            targetUserId: userId,
            targetUserEmail: user.email,
            ipAddress: context?.ipAddress,
        });
    }

    /**
     * Unlock a user account
     */
    async unlockAccount(request: UnlockAccountRequest,
                        adminUserId: string, context?: {
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
        }): Promise<void> {
        const { userId } = request;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.unlockAccount(userId);

        // Log account unlock
        await this.auditService.logAction({
            userId: adminUserId,
            action: 'account_unlocked',
            resourceType: 'user',
            resourceId: userId,
            metadata: {
                targetUserId: userId,
                targetUserEmail: user.email,
                unlockedAt: new Date().toISOString(),
            },
        });

        logger.info('Account unlocked by admin', {
            adminUserId,
            targetUserId: userId,
            targetUserEmail: user.email,
            ipAddress: context?.ipAddress,
        });
    }

    /**
     * Get user by token
     */
    async getUserByToken(request: VerifyTokenRequest): Promise<UserModel | null> {
        try {
            const decoded = this.verifyToken(request);
            const user = await this.userRepository.findById(decoded.id);

            if (!user || !user.is_active) {
                return null;
            }

            // Check if an account is locked
            if (user.locked_until && user.locked_until > new Date()) {
                return null;
            }

            return user;
        } catch (error: unknown) {
            // Type-safe error handling
            if (error instanceof Error) {
                logger.debug('Token verification failed:', error.message);
            } else {
                logger.debug('Token verification failed with unknown error type');
            }
            return null;
        }
    }

    // Private helper methods

    /**
     * Generate access and refresh tokens
     */
    private generateTokens(user: UserModel): {
        accessToken: string;
        refreshToken: string;
    } {
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code,
            agentCode: user.agent_code,
            permissions: user.permissions,
        };
        const expiresIn = parseInt(Environment.JWT_EXPIRES_IN, 10);

        const accessToken = jwt.sign(
            { ...tokenPayload, type: 'access' },
            Environment.JWT_SECRET,
            { expiresIn }
        );

        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            Environment.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    /**
     * Validate password strength
     */
    private validatePasswordStrength(password: string): void {
        if (password.length < 8) {
            throw new ValidationException('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            throw new ValidationException('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            throw new ValidationException('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            throw new ValidationException('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            throw new ValidationException('Password must contain at least one special character (@$!%*?&)');
        }
    }
}