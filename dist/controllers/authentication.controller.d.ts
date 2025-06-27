import { Request, Response } from 'express';
import { AuthenticationService } from '@services/authentication.service';
import { AuthenticatedRequest } from "@interfaces/common.interfaces";
export declare class AuthenticationController {
    private readonly authService;
    constructor(authService: AuthenticationService);
    /**
     * Login user
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * Register new user
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Change password
     */
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Forgot password
     */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * Reset password
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Verify email
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * Resend email verification
     */
    resendEmailVerification(req: Request, res: Response): Promise<void>;
    /**
     * Get current user profile
     */
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Update user profile
     */
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Set up two-factor authentication
     */
    setupTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Enable two-factor authentication
     */
    enableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Disable two-factor authentication
     */
    disableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Refresh access token
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Logout user
     */
    logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Create a user (admin only)
     */
    createUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Health check for auth service
     */
    healthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=authentication.controller.d.ts.map