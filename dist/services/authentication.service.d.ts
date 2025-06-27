import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto, TwoFactorSetupDto, TwoFactorDisableDto, UpdateProfileDto, CreateUserDto } from '@dto/auth.dto';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string;
    role: {
        id: string;
        name: string;
        permissions: string[];
    };
    isActive: boolean;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
}
export declare class AuthenticationService {
    /**
     * Authenticate a user with email and password
     */
    login(loginDto: LoginDto): Promise<{
        user: UserProfile;
        tokens: AuthTokens;
    }>;
    /**
     * Register a new user
     */
    register(registerDto: RegisterDto): Promise<{
        user: UserProfile;
        tokens: AuthTokens;
    }>;
    /**
     * Change user password
     */
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    /**
     * Initiate the password reset process
     */
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    /**
     * Reset password using token
     */
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    /**
     * Verify email address
     */
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    /**
     * Resend email verification
     */
    resendEmailVerification(resendDto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    /**
     * Set up two-factor authentication
     */
    setupTwoFactor(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    /**
     * Enable two-factor authentication
     */
    enableTwoFactor(userId: string, twoFactorDto: TwoFactorSetupDto): Promise<{
        message: string;
    }>;
    /**
     * Disable two-factor authentication
     */
    disableTwoFactor(userId: string, disableDto: TwoFactorDisableDto): Promise<{
        message: string;
    }>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserProfile>;
    /**
     * Get user profile
     */
    getProfile(userId: string): Promise<UserProfile>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    /**
     * Logout user (invalidate tokens)
     */
    logout(userId: string, logoutAll?: boolean): Promise<{
        message: string;
    }>;
    /**
     * Create user (admin function)
     */
    createUser(createUserDto: CreateUserDto): Promise<UserProfile>;
    /**
     * Generate JWT tokens
     */
    private generateTokens;
    /**
     * Create a user profile object
     */
    private createUserProfile;
    /**
     * Generate email verification token
     */
    private generateEmailVerificationToken;
}
//# sourceMappingURL=authentication.service.d.ts.map