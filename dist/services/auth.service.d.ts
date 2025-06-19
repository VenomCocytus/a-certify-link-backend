import { UserModel } from '@/models';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RefreshTokenRequest, ResetPasswordRequest, TokenPayload, UnlockAccountRequest, VerifyTokenRequest } from "@dto/auth.dto";
export declare class AuthService {
    private userRepository;
    private auditService;
    constructor();
    /**
     * Authenticate a user with email and password
     */
    login(credentials: LoginRequest, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<AuthResponse>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(request: RefreshTokenRequest): Promise<AuthResponse>;
    /**
     * Logout user (optional: blacklist token)
     */
    logout(userId: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void>;
    /**
     * Verify JWT token
     */
    verifyToken(request: VerifyTokenRequest): TokenPayload;
    /**
     * Change user password
     */
    changePassword(userId: string, request: ChangePasswordRequest, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void>;
    /**
     * Reset password (admin function)
     */
    resetPassword(request: ResetPasswordRequest, adminUserId: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void>;
    /**
     * Unlock a user account
     */
    unlockAccount(request: UnlockAccountRequest, adminUserId: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<void>;
    /**
     * Get user by token
     */
    getUserByToken(request: VerifyTokenRequest): Promise<UserModel | null>;
    /**
     * Generate access and refresh tokens
     */
    private generateTokens;
    /**
     * Validate password strength
     */
    private validatePasswordStrength;
}
//# sourceMappingURL=auth.service.d.ts.map