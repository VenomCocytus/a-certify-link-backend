"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("@/repositories/user.repository");
const audit_service_1 = require("./audit.service");
const environment_1 = require("@config/environment");
const validation_exception_1 = require("@exceptions/validation.exception");
const notFound_exception_1 = require("@exceptions/notFound.exception");
const logger_1 = require("@utils/logger");
class AuthService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
        this.auditService = new audit_service_1.AuditService();
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
    async login(credentials, context) {
        const { email, password } = credentials;
        // Find the user by email
        const user = await this.userRepository.findByEmail(email.toLowerCase());
        if (!user) {
            // Log failed login attempt
            logger_1.logger.warn('Login attempt with invalid email', {
                email,
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
            });
            throw new validation_exception_1.ValidationException('Invalid email or password');
        }
        // Check if an account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            const lockTimeRemaining = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
            logger_1.logger.warn('Login attempt on locked account', {
                userId: user.id,
                email: user.email,
                lockTimeRemaining,
                ipAddress: context?.ipAddress,
            });
            throw new validation_exception_1.ValidationException(`Account is locked. Try again in ${lockTimeRemaining} minutes`);
        }
        // Check if an account is active
        if (!user.is_active) {
            logger_1.logger.warn('Login attempt on disabled account', {
                userId: user.id,
                email: user.email,
                ipAddress: context?.ipAddress,
            });
            throw new validation_exception_1.ValidationException('Account is disabled');
        }
        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await this.userRepository.incrementFailedLoginAttempts(user.id);
            logger_1.logger.warn('Login attempt with invalid password', {
                userId: user.id,
                email: user.email,
                failedAttempts: user.failed_login_attempts + 1,
                ipAddress: context?.ipAddress,
            });
            throw new validation_exception_1.ValidationException('Invalid email or password');
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
        logger_1.logger.info('User logged in successfully', {
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
    async refreshToken(request) {
        const { refreshToken } = request;
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, environment_1.Environment.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            throw new validation_exception_1.ValidationException('Invalid refresh token type');
        }
        // Find user
        const user = await this.userRepository.findById(decoded.id);
        if (!user) {
            throw new notFound_exception_1.NotFoundException('User not found');
        }
        // Check if the user is still active
        if (!user.is_active) {
            throw new validation_exception_1.ValidationException('Account is disabled');
        }
        // Check if an account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            throw new validation_exception_1.ValidationException('Account is locked');
        }
        // Generate new tokens
        const tokens = this.generateTokens(user);
        logger_1.logger.info('Token refreshed successfully', {
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
    async logout(userId, context) {
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
        logger_1.logger.info('User logged out', {
            userId,
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
        });
    }
    /**
     * Verify JWT token
     */
    verifyToken(request) {
        const { token } = request;
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.Environment.JWT_SECRET);
        if (decoded.type === 'refresh') {
            throw new validation_exception_1.ValidationException('Cannot use refresh token as access token');
        }
        return decoded;
    }
    /**
     * Change user password
     */
    async changePassword(userId, request, context) {
        const user = await this.userRepository.findById(userId);
        const { currentPassword, newPassword } = request;
        if (!user) {
            throw new notFound_exception_1.NotFoundException('User not found');
        }
        // Verify the current password
        const isCurrentPasswordValid = await user.validatePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new validation_exception_1.ValidationException('Current password is incorrect');
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
        logger_1.logger.info('Password changed successfully', {
            userId,
            email: user.email,
            ipAddress: context?.ipAddress
        });
    }
    /**
     * Reset password (admin function)
     */
    async resetPassword(request, adminUserId, context) {
        const { userId, newPassword } = request;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new notFound_exception_1.NotFoundException('User not found');
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
        logger_1.logger.info('Password reset by admin', {
            adminUserId,
            targetUserId: userId,
            targetUserEmail: user.email,
            ipAddress: context?.ipAddress,
        });
    }
    /**
     * Unlock a user account
     */
    async unlockAccount(request, adminUserId, context) {
        const { userId } = request;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new notFound_exception_1.NotFoundException('User not found');
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
        logger_1.logger.info('Account unlocked by admin', {
            adminUserId,
            targetUserId: userId,
            targetUserEmail: user.email,
            ipAddress: context?.ipAddress,
        });
    }
    /**
     * Get user by token
     */
    async getUserByToken(request) {
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
        }
        catch (error) {
            // Type-safe error handling
            if (error instanceof Error) {
                logger_1.logger.debug('Token verification failed:', error.message);
            }
            else {
                logger_1.logger.debug('Token verification failed with unknown error type');
            }
            return null;
        }
    }
    // Private helper methods
    /**
     * Generate access and refresh tokens
     */
    generateTokens(user) {
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code,
            agentCode: user.agent_code,
            permissions: user.permissions,
        };
        const expiresIn = parseInt(environment_1.Environment.JWT_EXPIRES_IN, 10);
        const accessToken = jsonwebtoken_1.default.sign({ ...tokenPayload, type: 'access' }, environment_1.Environment.JWT_SECRET, { expiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, type: 'refresh' }, environment_1.Environment.JWT_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        if (password.length < 8) {
            throw new validation_exception_1.ValidationException('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])/.test(password)) {
            throw new validation_exception_1.ValidationException('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            throw new validation_exception_1.ValidationException('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(password)) {
            throw new validation_exception_1.ValidationException('Password must contain at least one number');
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            throw new validation_exception_1.ValidationException('Password must contain at least one special character (@$!%*?&)');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map