"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationController = void 0;
class AuthenticationController {
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Login user
     */
    async login(req, res) {
        const result = await this.authService.login(req.body);
        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
            tokenType: result.tokens.tokenType
        });
    }
    /**
     * Register new user
     */
    async register(req, res) {
        const result = await this.authService.register(req.body);
        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            message: 'Registration successful',
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
            tokenType: result.tokens.tokenType
        });
    }
    /**
     * Change password
     */
    async changePassword(req, res) {
        const userId = req.user.id;
        await this.authService.changePassword(userId, req.body);
        res.status(200).json({
            message: 'Password changed successfully'
        });
    }
    /**
     * Forgot password
     */
    async forgotPassword(req, res) {
        const result = await this.authService.forgotPassword(req.body);
        res.status(200).json(result);
    }
    /**
     * Reset password
     */
    async resetPassword(req, res) {
        const result = await this.authService.resetPassword(req.body);
        res.status(200).json(result);
    }
    /**
     * Verify email
     */
    async verifyEmail(req, res) {
        const { token, userId } = req.params;
        const verifyEmailDto = { token, userId };
        const result = await this.authService.verifyEmail(verifyEmailDto);
        res.status(200).json(result);
    }
    /**
     * Resend email verification
     */
    async resendEmailVerification(req, res) {
        const result = await this.authService.resendEmailVerification(req.body);
        res.status(200).json(result);
    }
    /**
     * Get current user profile
     */
    async getProfile(req, res) {
        const userId = req.user.id;
        const profile = await this.authService.getProfile(userId);
        res.status(200).json({
            user: profile
        });
    }
    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        const userId = req.user.id;
        const profile = await this.authService.updateProfile(userId, req.body);
        res.status(200).json({
            message: 'Profile updated successfully',
            user: profile
        });
    }
    /**
     * Set up two-factor authentication
     */
    async setupTwoFactor(req, res) {
        const userId = req.user.id;
        const result = await this.authService.setupTwoFactor(userId);
        res.status(200).json({
            message: 'Two-factor authentication setup initiated',
            ...result
        });
    }
    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor(req, res) {
        const userId = req.user.id;
        const result = await this.authService.enableTwoFactor(userId, req.body);
        res.status(200).json(result);
    }
    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(req, res) {
        const userId = req.user.id;
        const result = await this.authService.disableTwoFactor(userId, req.body);
        res.status(200).json(result);
    }
    /**
     * Refresh access token
     */
    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Required',
                status: 401,
                detail: 'Refresh token is required',
                instance: req.originalUrl,
            });
            return;
        }
        const tokens = await this.authService.refreshToken(refreshToken);
        // Update refresh token cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: tokens.accessToken,
            expiresIn: tokens.expiresIn,
            tokenType: tokens.tokenType
        });
    }
    /**
     * Logout user
     */
    async logout(req, res) {
        const logoutDto = req.body;
        const userId = req.user.id;
        await this.authService.logout(userId, logoutDto.logoutAll);
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        res.status(200).json({
            message: 'Logged out successfully'
        });
    }
    /**
     * Create a user (admin only)
     */
    async createUser(req, res) {
        const user = await this.authService.createUser(req.body);
        res.status(201).json({
            message: 'User created successfully',
            user
        });
    }
    /**
     * Health check for auth service
     */
    async healthCheck(req, res) {
        res.status(200).json({
            status: 'healthy',
            service: 'authentication',
            timestamp: new Date().toISOString()
        });
    }
}
exports.AuthenticationController = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map