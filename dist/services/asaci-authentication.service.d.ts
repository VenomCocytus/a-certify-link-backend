import { GenerateTokenDto, OtpValidateDto, ForgotPasswordDto, ResetPasswordDto, ResendWelcomeDto, SetInitialPasswordDto, RevokeTokensDto } from '@dto/asaci.dto';
export declare class AsaciAuthenticationService {
    private httpClient;
    private accessToken;
    constructor(baseUrl: string);
    private setAuthToken;
    generateAccessToken(generateTokenDto: GenerateTokenDto): Promise<any>;
    validateOtp(otpValidateDto: OtpValidateDto): Promise<any>;
    resendOtp(otpValidateDto: OtpValidateDto): Promise<any>;
    requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<any>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any>;
    resendWelcomeEmail(resendWelcomeDto: ResendWelcomeDto): Promise<any>;
    setInitialPassword(userId: string, setInitialPasswordDto: SetInitialPasswordDto): Promise<any>;
    getCurrentUser(): Promise<any>;
    getUserTokens(): Promise<any>;
    revokeUserTokens(revokeTokensDto: RevokeTokensDto): Promise<any>;
    deleteCurrentToken(): Promise<any>;
    resendEmailVerification(): Promise<any>;
    verifyEmail(id: string, hash: string): Promise<any>;
    getBrowserSessions(): Promise<any>;
    getLastActivity(): Promise<any>;
    logoutBrowserSessions(password: string): Promise<any>;
    generatePrivateToken(): Promise<any>;
    getAccessToken(): string | null;
    isAuthenticated(): boolean;
}
//# sourceMappingURL=asaci-authentication.service.d.ts.map