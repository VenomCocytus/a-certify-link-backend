import { Router } from 'express';
import { validateDto, validateQuery } from '@middlewares/validation.middleware';
import { AuthenticationController } from "@controllers/authentication.controller";
import { asyncHandlerMiddleware } from '@middlewares/async-handler.middleware';
import { authMiddleware, requireRoles } from '@middlewares/auth.middleware';
import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendVerificationDto,
    TwoFactorSetupDto,
    TwoFactorDisableDto,
    UpdateProfileDto,
    LogoutDto,
    CreateUserDto
} from '@dto/auth.dto';
import { authLimiter } from "@middlewares/rate-limiter.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: SecurePass123!
 *         rememberMe:
 *           type: boolean
 *           default: false
 *         twoFactorCode:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           example: '123456'
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: newuser@example.com
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Doe
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *           example: SecurePass123!
 *         confirmPassword:
 *           type: string
 *           example: SecurePass123!
 *         phoneNumber:
 *           type: string
 *           minLength: 10
 *           maxLength: 20
 *           example: '+1234567890'
 *         roleId:
 *           type: string
 *           format: uuid
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         fullName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *         isActive:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         twoFactorEnabled:
 *           type: boolean
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *         accessToken:
 *           type: string
 *         expiresIn:
 *           type: integer
 *         tokenType:
 *           type: string
 *           default: Bearer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         status:
 *           type: integer
 *         detail:
 *           type: string
 *         instance:
 *           type: string
 *         traceId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             validationErrors:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export function createAuthRoutes(authController: AuthenticationController): Router {
    const router = Router();

    // Public routes (no authentication required)

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags: [Authentication]
     *     summary: Login user
     *     description: Authenticate user with email and password
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *         headers:
     *           Set-Cookie:
     *             description: Refresh token cookie
     *             schema:
     *               type: string
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       423:
     *         description: Account locked
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       429:
     *         description: Too many requests
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/login',
        authLimiter,
        validateDto(LoginDto),
        asyncHandlerMiddleware(authController.login.bind(authController))
    );

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     tags: [Authentication]
     *     summary: Register new user
     *     description: Create a new user account
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterRequest'
     *     responses:
     *       201:
     *         description: Registration successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       409:
     *         description: User already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/register',
        validateDto(RegisterDto),
        asyncHandlerMiddleware(authController.register.bind(authController))
    );

    /**
     * @swagger
     * /auth/forgot-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Request password reset
     *     description: Send password reset email to user
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *     responses:
     *       200:
     *         description: Password reset email sent (if account exists)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: If an account with this email exists, a password reset link has been sent.
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     */
    router.post('/forgot-password',
        validateDto(ForgotPasswordDto),
        asyncHandlerMiddleware(authController.forgotPassword.bind(authController))
    );

    /**
     * @swagger
     * /auth/reset-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Reset password with token
     *     description: Reset user password using reset token
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - newPassword
     *               - confirmPassword
     *             properties:
     *               token:
     *                 type: string
     *                 description: Password reset token
     *               newPassword:
     *                 type: string
     *                 minLength: 8
     *                 maxLength: 100
     *                 example: NewSecurePass123!
     *               confirmPassword:
     *                 type: string
     *                 example: NewSecurePass123!
     *     responses:
     *       200:
     *         description: Password reset successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Password has been reset successfully
     *       400:
     *         description: Validation error or invalid token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     */
    router.post('/reset-password',
        validateDto(ResetPasswordDto),
        asyncHandlerMiddleware(authController.resetPassword.bind(authController))
    );

    /**
     * @swagger
     * /auth/verify-email/{userId}/{token}:
     *   get:
     *     tags: [Authentication]
     *     summary: Verify email address
     *     description: Verify user email address using verification token
     *     security: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User ID
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Email verification token
     *     responses:
     *       200:
     *         description: Email verified successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Email verified successfully
     *       400:
     *         description: Invalid verification link
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.get('/verify-email/:userId/:token',
        validateQuery,
        asyncHandlerMiddleware(authController.verifyEmail.bind(authController))
    );

    /**
     * @swagger
     * /auth/resend-verification:
     *   post:
     *     tags: [Authentication]
     *     summary: Resend email verification
     *     description: Resend email verification link
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *     responses:
     *       200:
     *         description: Verification email sent (if account exists)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: If an account with this email exists, a verification email has been sent.
     */
    router.post('/resend-verification',
        validateDto(ResendVerificationDto),
        asyncHandlerMiddleware(authController.resendEmailVerification.bind(authController))
    );

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     tags: [Authentication]
     *     summary: Refresh access token
     *     description: Get new access token using refresh token (from cookie or body)
     *     security: []
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 description: Refresh token (if not using cookies)
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 accessToken:
     *                   type: string
     *                 expiresIn:
     *                   type: integer
     *                 tokenType:
     *                   type: string
     *       401:
     *         description: Invalid refresh token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/refresh',
        asyncHandlerMiddleware(authController.refreshToken.bind(authController))
    );

    /**
     * @swagger
     * /auth/health:
     *   get:
     *     tags: [Health]
     *     summary: Authentication service health check
     *     description: Check if authentication service is healthy
     *     security: []
     *     responses:
     *       200:
     *         description: Service is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: healthy
     *                 service:
     *                   type: string
     *                   example: authentication
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     */
    router.get('/health',
        asyncHandlerMiddleware(authController.healthCheck.bind(authController))
    );

    // Protected routes (authentication required)

    /**
     * @swagger
     * /auth/profile:
     *   get:
     *     tags: [Authentication]
     *     summary: Get current user profile
     *     description: Get authenticated user's profile information
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
     *                 user:
     *                   $ref: '#/components/schemas/UserProfile'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.get('/profile',
        authMiddleware,
        asyncHandlerMiddleware(authController.getProfile.bind(authController))
    );

    /**
     * @swagger
     * /auth/profile:
     *   put:
     *     tags: [Authentication]
     *     summary: Update user profile
     *     description: Update authenticated user's profile information
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *               lastName:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *               phoneNumber:
     *                 type: string
     *                 minLength: 10
     *                 maxLength: 20
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 user:
     *                   $ref: '#/components/schemas/UserProfile'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.put('/profile',
        authMiddleware,
        validateDto(UpdateProfileDto),
        asyncHandlerMiddleware(authController.updateProfile.bind(authController))
    );

    /**
     * @swagger
     * /auth/change-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Change user password
     *     description: Change authenticated user's password
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
     *               - confirmPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *                 description: Current password
     *               newPassword:
     *                 type: string
     *                 minLength: 8
     *                 maxLength: 100
     *                 description: New password
     *               confirmPassword:
     *                 type: string
     *                 description: Confirm new password
     *     responses:
     *       200:
     *         description: Password changed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Password changed successfully
     *       400:
     *         description: Validation error or incorrect current password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/change-password',
        authMiddleware,
        validateDto(ChangePasswordDto),
        asyncHandlerMiddleware(authController.changePassword.bind(authController))
    );

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     tags: [Authentication]
     *     summary: Logout user
     *     description: Logout authenticated user and invalidate tokens
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               logoutAll:
     *                 type: boolean
     *                 description: Logout from all devices
     *                 default: false
     *     responses:
     *       200:
     *         description: Logged out successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Logged out successfully
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/logout',
        authMiddleware,
        validateDto(LogoutDto),
        asyncHandlerMiddleware(authController.logout.bind(authController))
    );

    // Two-Factor Authentication routes

    /**
     * @swagger
     * /auth/2fa/setup:
     *   post:
     *     tags: [Two-Factor Authentication]
     *     summary: Setup two-factor authentication
     *     description: Initialize two-factor authentication setup
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Two-factor authentication setup initiated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 secret:
     *                   type: string
     *                   description: Base32 encoded secret
     *                 qrCodeUrl:
     *                   type: string
     *                   description: QR code data URL
     *       400:
     *         description: Two-factor authentication already enabled
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/2fa/setup',
        authMiddleware,
        asyncHandlerMiddleware(authController.setupTwoFactor.bind(authController))
    );

    /**
     * @swagger
     * /auth/2fa/enable:
     *   post:
     *     tags: [Two-Factor Authentication]
     *     summary: Enable two-factor authentication
     *     description: Enable two-factor authentication by verifying setup code
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - code
     *             properties:
     *               code:
     *                 type: string
     *                 pattern: '^[0-9]{6}$'
     *                 description: 6-digit verification code
     *                 example: '123456'
     *     responses:
     *       200:
     *         description: Two-factor authentication enabled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Two-factor authentication enabled successfully
     *       400:
     *         description: Invalid verification code
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/2fa/enable',
        authMiddleware,
        validateDto(TwoFactorSetupDto),
        asyncHandlerMiddleware(authController.enableTwoFactor.bind(authController))
    );

    /**
     * @swagger
     * /auth/2fa/disable:
     *   post:
     *     tags: [Two-Factor Authentication]
     *     summary: Disable two-factor authentication
     *     description: Disable two-factor authentication
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - password
     *               - code
     *             properties:
     *               password:
     *                 type: string
     *                 description: Current password
     *               code:
     *                 type: string
     *                 pattern: '^[0-9]{6}$'
     *                 description: 6-digit verification code
     *                 example: '123456'
     *     responses:
     *       200:
     *         description: Two-factor authentication disabled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Two-factor authentication disabled successfully
     *       400:
     *         description: Invalid password or verification code
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/2fa/disable',
        authMiddleware,
        validateDto(TwoFactorDisableDto),
        asyncHandlerMiddleware(authController.disableTwoFactor.bind(authController))
    );

    // Admin routes (admin role required)

    /**
     * @swagger
     * /auth/admin/users:
     *   post:
     *     tags: [User Management]
     *     summary: Create new user (Admin only)
     *     description: Create a new user account (requires admin privileges)
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - firstName
     *               - lastName
     *               - roleId
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               firstName:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *               lastName:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *               phoneNumber:
     *                 type: string
     *                 minLength: 10
     *                 maxLength: 20
     *               roleId:
     *                 type: string
     *                 format: uuid
     *               isActive:
     *                 type: boolean
     *                 default: true
     *               sendWelcomeEmail:
     *                 type: boolean
     *                 default: false
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 user:
     *                   $ref: '#/components/schemas/UserProfile'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Insufficient privileges
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: User already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/admin/users',
        authMiddleware,
        requireRoles(['ADMIN', 'SUPER_ADMIN']),
        validateDto(CreateUserDto),
        asyncHandlerMiddleware(authController.createUser.bind(authController))
    );

    return router;
}