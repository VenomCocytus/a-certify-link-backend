import { Router } from 'express';
import { validateDto } from '@middlewares/validation.middleware';
import { AuthenticationController } from "@controllers/auth.controller";
import { asyncHandlerMiddleware } from '@middlewares/async-handler.middleware';
import { authMiddleware, requireRoles, requirePermissions } from '@middlewares/auth.middleware';
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

export function createAuthRoutes(authController: AuthenticationController): Router {
    const router = Router();

    // Public routes (no authentication required)

    /**
     * @route POST /auth/login
     * @desc Login user
     * @access Public
     */
    router.post('/login',
        validateDto(LoginDto),
        asyncHandlerMiddleware(authController.login.bind(authController))
    );

    /**
     * @route POST /auth/register
     * @desc Register new user
     * @access Public
     */
    router.post('/register',
        validateDto(RegisterDto),
        asyncHandlerMiddleware(authController.register.bind(authController))
    );

    /**
     * @route POST /auth/forgot-password
     * @desc Request password reset
     * @access Public
     */
    router.post('/forgot-password',
        validateDto(ForgotPasswordDto),
        asyncHandlerMiddleware(authController.forgotPassword.bind(authController))
    );

    /**
     * @route POST /auth/reset-password
     * @desc Reset password with token
     * @access Public
     */
    router.post('/reset-password',
        validateDto(ResetPasswordDto),
        asyncHandlerMiddleware(authController.resetPassword.bind(authController))
    );

    /**
     * @route GET /auth/verify-email/:userId/:token
     * @desc Verify email address
     * @access Public
     */
    router.get('/verify-email/:userId/:token',
        asyncHandlerMiddleware(authController.verifyEmail.bind(authController))
    );

    /**
     * @route POST /auth/resend-verification
     * @desc Resend email verification
     * @access Public
     */
    router.post('/resend-verification',
        validateDto(ResendVerificationDto),
        asyncHandlerMiddleware(authController.resendEmailVerification.bind(authController))
    );

    /**
     * @route POST /auth/refresh
     * @desc Refresh access token
     * @access Public (but requires refresh token)
     */
    router.post('/refresh',
        asyncHandlerMiddleware(authController.refreshToken.bind(authController))
    );

    /**
     * @route GET /auth/health
     * @desc Health check for auth service
     * @access Public
     */
    router.get('/health',
        asyncHandlerMiddleware(authController.healthCheck.bind(authController))
    );

    // Protected routes (authentication required)

    /**
     * @route GET /auth/profile
     * @desc Get current user profile
     * @access Private
     */
    router.get('/profile',
        authMiddleware,
        asyncHandlerMiddleware(authController.getProfile.bind(authController))
    );

    /**
     * @route PUT /auth/profile
     * @desc Update user profile
     * @access Private
     */
    router.put('/profile',
        authMiddleware,
        validateDto(UpdateProfileDto),
        asyncHandlerMiddleware(authController.updateProfile.bind(authController))
    );

    /**
     * @route POST /auth/change-password
     * @desc Change user password
     * @access Private
     */
    router.post('/change-password',
        authMiddleware,
        validateDto(ChangePasswordDto),
        asyncHandlerMiddleware(authController.changePassword.bind(authController))
    );

    /**
     * @route POST /auth/logout
     * @desc Logout user
     * @access Private
     */
    router.post('/logout',
        authMiddleware,
        validateDto(LogoutDto),
        asyncHandlerMiddleware(authController.logout.bind(authController))
    );

    // Two-Factor Authentication routes

    /**
     * @route POST /auth/2fa/setup
     * @desc Setup two-factor authentication
     * @access Private
     */
    router.post('/2fa/setup',
        authMiddleware,
        asyncHandlerMiddleware(authController.setupTwoFactor.bind(authController))
    );

    /**
     * @route POST /auth/2fa/enable
     * @desc Enable two-factor authentication
     * @access Private
     */
    router.post('/2fa/enable',
        authMiddleware,
        validateDto(TwoFactorSetupDto),
        asyncHandlerMiddleware(authController.enableTwoFactor.bind(authController))
    );

    /**
     * @route POST /auth/2fa/disable
     * @desc Disable two-factor authentication
     * @access Private
     */
    router.post('/2fa/disable',
        authMiddleware,
        validateDto(TwoFactorDisableDto),
        asyncHandlerMiddleware(authController.disableTwoFactor.bind(authController))
    );

    // Admin routes (admin role required)

    /**
     * @route POST /auth/admin/users
     * @desc Create new user (admin only)
     * @access Private (Admin)
     */
    router.post('/admin/users',
        authMiddleware,
        requireRoles(['ADMIN', 'SUPER_ADMIN']),
        validateDto(CreateUserDto),
        asyncHandlerMiddleware(authController.createUser.bind(authController))
    );

    return router;
}