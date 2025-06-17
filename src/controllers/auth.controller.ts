import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '@services/authService';
import { UserRepository } from '@/repositories/userRepository';
import { ValidationException } from '@exceptions/validationException';
import { NotFoundException } from '@exceptions/notFoundException';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';
import {AuthenticatedRequest} from "@interfaces/middlewareInterfaces";

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
    }

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: User login
     *     description: Authenticate user and return JWT tokens
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: admin@digitalcertificates.com
     *               password:
     *                 type: string
     *                 example: Admin@123456
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                     refreshToken:
     *                       type: string
     *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                     expiresIn:
     *                       type: number
     *                       example: 86400
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         email:
     *                           type: string
     *                         firstName:
     *                           type: string
     *                         lastName:
     *                           type: string
     *                         role:
     *                           type: string
     *                         companyCode:
     *                           type: string
     *                         permissions:
     *                           type: array
     *                           items:
     *                             type: string
     *                 message:
     *                   type: string
     *                   example: Login successful
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       423:
     *         description: Account locked
     *       429:
     *         $ref: '#/components/responses/TooManyRequests'
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     description: Get a new access token using refresh token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *                     expiresIn:
     *                       type: number
     *                     user:
     *                       type: object
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
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
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new ValidationException('Invalid refresh token'));
            } else {
                next(error);
            }
        }
    };

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: User logout
     *     description: Invalidate user session and log logout event
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logout successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Logout successful
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
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

    /**
     * @swagger
     * /auth/profile:
     *   get:
     *     summary: Get current user profile
     *     description: Retrieve the authenticated user's profile information
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     email:
     *                       type: string
     *                     firstName:
     *                       type: string
     *                     lastName:
     *                       type: string
     *                     role:
     *                       type: string
     *                     companyCode:
     *                       type: string
     *                     agentCode:
     *                       type: string
     *                     permissions:
     *                       type: array
     *                       items:
     *                         type: string
     *                     isActive:
     *                       type: boolean
     *                     lastLoginAt:
     *                       type: string
     *                       format: date-time
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     */
    getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /auth/change-password:
     *   post:
     *     summary: Change user password
     *     description: Change the authenticated user's password
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - currentPassword
     *               - newPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *                 example: OldPassword@123
     *               newPassword:
     *                 type: string
     *                 example: NewPassword@456
     *                 description: Must be at least 8 characters with uppercase, lowercase, number, and special character
     *     responses:
     *       200:
     *         description: Password changed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Password changed successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     */
    changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /auth/verify-token:
     *   post:
     *     summary: Verify JWT token
     *     description: Verify if a JWT token is valid and return user information
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Token is valid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     valid:
     *                       type: boolean
     *                       example: true
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         email:
     *                           type: string
     *                         role:
     *                           type: string
     *       400:
     *         description: Token is invalid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 data:
     *                   type: object
     *                   properties:
     *                     valid:
     *                       type: boolean
     *                       example: false
     *                     error:
     *                       type: string
     *                       example: Token has expired
     */
    verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            res.status(400).json({
                success: false,
                data: {
                    valid: false,
                    error: error instanceof Error ? error.message : 'Token verification failed',
                },
            });
        }
    };

    /**
     * @swagger
     * /auth/reset-password:
     *   post:
     *     summary: Reset user password (Admin only)
     *     description: Reset another user's password (admin function)
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - newPassword
     *             properties:
     *               userId:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               newPassword:
     *                 type: string
     *                 example: NewPassword@123
     *     responses:
     *       200:
     *         description: Password reset successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     */
    resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /auth/unlock-account:
     *   post:
     *     summary: Unlock user account (Admin only)
     *     description: Unlock a locked user account
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       200:
     *         description: Account unlocked successfully
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     */
    unlockAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };
}