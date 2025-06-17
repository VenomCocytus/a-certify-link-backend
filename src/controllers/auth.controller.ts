import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '@services/auth.service';
import { UserRepository } from '@/repositories/user.repository';
import { ValidationException } from '@exceptions/validation.exception';
import { NotFoundException } from '@exceptions/notFound.exception';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";
import {validate} from "class-validator";
import {LoginRequest} from "@dto/auth.dto";
import {plainToInstance} from "class-transformer";

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
    }

    login = async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        // Find a user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new ValidationException('Invalid email or password');
        }

        // Check if the account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            const lockTimeRemaining = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
            throw new ValidationException(`Account is locked. Try again in ${lockTimeRemaining} minutes`);
        }

        // Check if the account is active
        if (!user.is_active) {
            throw new ValidationException('Account is disabled');
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await this.userRepository.incrementFailedLoginAttempts(user.id);
            throw new ValidationException('Invalid email or password');
        }

        // Update last login and reset failed attempts
        await this.userRepository.updateLastLogin(user.id);

        // Generate JWT token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code,
            agentCode: user.agent_code,
            permissions: user.permissions,
        };

        // Define time base on the user role
        const expiresIn = parseInt(Environment.JWT_EXPIRES_IN, 10);

        const token = jwt.sign(tokenPayload, Environment.JWT_SECRET,
            { expiresIn });

        // Generate refresh token
        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            Environment.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });

        res.json({
            success: true,
            data: {
                token,
                refreshToken,
                expiresIn: 86400, // 24 hours in seconds
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    companyCode: user.company_code,
                    agentCode: user.agent_code,
                    permissions: user.permissions,
                },
            },
            message: req.t('login_successful'),
        });
    };

    refreshToken = async (req: Request, res: Response): Promise<void> => {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationException('Refresh token is required');
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, Environment.JWT_SECRET) as any;

        if (decoded.type !== 'refresh') {
            throw new ValidationException('Invalid refresh token');
        }

        // Find user
        const user = await this.userRepository.findById(decoded.id);
        if (!user || !user.is_active) {
            throw new NotFoundException('User not found or inactive');
        }

        // Generate a new access token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code,
            agentCode: user.agent_code,
            permissions: user.permissions,
        };
        const expiresIn = parseInt(Environment.JWT_EXPIRES_IN, 10);

        const newToken = jwt.sign(tokenPayload, Environment.JWT_SECRET, { expiresIn });

        // Generate a new refresh token
        const newRefreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            Environment.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.info('Token refreshed successfully', {
            userId: user.id,
            email: user.email,
        });

        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: 86400,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    companyCode: user.company_code,
                    agentCode: user.agent_code,
                    permissions: user.permissions,
                },
            },
            message: req.t('token_refreshed'),
        });
    };

    logout = async (req: Request, res: Response): Promise<void> => {
        // In a production environment, you might want to banlist the token
        // or store active sessions in a database/cache

        logger.info('User logged out', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });

        res.json({
            success: true,
            message: req.t('logout_successful'),
        });
    };

    getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const user = req.user!;

        const userProfile = await this.userRepository.findById(user.id);
        if (!userProfile) {
            throw new NotFoundException('User profile not found');
        }

        res.json({
            success: true,
            data: {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.first_name,
                lastName: userProfile.last_name,
                role: userProfile.role,
                companyCode: userProfile.company_code,
                agentCode: userProfile.agent_code,
                permissions: userProfile.permissions,
                isActive: userProfile.is_active,
                lastLoginAt: userProfile.last_login_at,
                createdAt: userProfile.created_at,
            },
        });
    };

    changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const user = req.user!;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new ValidationException('Current password and new password are required');
        }

        await this.authService.changePassword(user.id, currentPassword, newPassword);

        logger.info('Password changed successfully', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
        });

        res.json({
            success: true,
            message: req.t ? req.t('password_changed') : 'Password changed successfully',
        });
    };

    verifyToken = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.body;

        if (!token) {
            throw new ValidationException('Token is required');
        }

        const user = await this.authService.getUserByToken(token);

        if (user) {
            res.json({
                success: true,
                data: {
                    valid: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role,
                        companyCode: user.company_code,
                        agentCode: user.agent_code,
                        permissions: user.permissions,
                    },
                },
            });
        } else {
            res.status(400).json({
                success: false,
                data: {
                    valid: false,
                    error: 'Invalid or expired token',
                },
            });
        }
    };

    resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const adminUser = req.user!;
        const { userId, newPassword } = req.body;

        if (adminUser.role !== 'admin') {
            throw new ValidationException('Only administrators can reset passwords');
        }

        if (!userId || !newPassword) {
            throw new ValidationException('User ID and new password are required');
        }

        await this.authService.resetPassword(userId, newPassword, adminUser.id);

        logger.info('Password reset by admin', {
            adminUserId: adminUser.id,
            targetUserId: userId,
            ip: req.ip,
        });

        res.json({
            success: true,
            message: req.t ? req.t('password_reset_successful') : 'Password reset successfully',
        });
    };

    unlockAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const adminUser = req.user!;
        const { userId } = req.body;

        if (adminUser.role !== 'admin') {
            throw new ValidationException('Only administrators can unlock accounts');
        }

        if (!userId) {
            throw new ValidationException('User ID is required');
        }

        await this.authService.unlockAccount(userId, adminUser.id);

        logger.info('Account unlocked by admin', {
            adminUserId: adminUser.id,
            targetUserId: userId,
            ip: req.ip,
        });

        res.json({
            success: true,
            message: req.t ? req.t('account_unlocked') : 'Account unlocked successfully',
        });
    };
}