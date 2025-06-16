import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';
import { UserRepository } from '@/repositories/userRepository';
import { ValidationException } from '@exceptions/validationException';
import { NotFoundException } from '@exceptions/notFoundException';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
    }

    /**
     * User login
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
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

            const token = jwt.sign(tokenPayload, Environment.JWT_SECRET, {
                expiresIn: Environment.JWT_EXPIRES_IN,
            });

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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Refresh access token
     */
    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
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

            const newToken = jwt.sign(tokenPayload, Environment.JWT_SECRET, {
                expiresIn: Environment.JWT_EXPIRES_IN,
            });

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
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new ValidationException('Invalid refresh token'));
            } else {
                next(error);
            }
        }
    };

    /**
     * User logout
     */
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };
}