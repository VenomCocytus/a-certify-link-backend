import {
    GenerateTokenDto,
    OtpValidateDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendWelcomeDto,
    SetInitialPasswordDto,
    RevokeTokensDto
} from '@dto/asaci.dto';
import {HttpClient} from "@utils/httpClient";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";

export class AsaciAuthenticationService {
    private httpClient: HttpClient;
    private accessToken: string | null = null;

    constructor(baseUrl: string) {
        this.httpClient = new HttpClient({
            baseURL: `${baseUrl}/api/v1`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private setAuthToken(token: string): void {
        this.accessToken = token;
        this.httpClient.setAuthToken(token);
    }

    async generateAccessToken(generateTokenDto: GenerateTokenDto): Promise<any> {
        const response = await this.httpClient
            .post(ASACI_ENDPOINTS.AUTH_TOKENS, generateTokenDto) as { token?: string };

        // Store the token for further requests
        if (response && response.token) {
            this.setAuthToken(response.token);
        }

        return response;
    }

    async validateOtp(otpValidateDto: OtpValidateDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_OTP_VALIDATE, otpValidateDto);
    }

    async resendOtp(otpValidateDto: OtpValidateDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_OTP_RESEND, otpValidateDto);
    }

    async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_FORGOT_PASSWORD, forgotPasswordDto);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_RESET_PASSWORD, resetPasswordDto);
    }

    async resendWelcomeEmail(resendWelcomeDto: ResendWelcomeDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_WELCOME_SEND, resendWelcomeDto);
    }

    async setInitialPassword(userId: string, setInitialPasswordDto: SetInitialPasswordDto): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.AUTH_WELCOME_SET_PASSWORD.replace('{userId}', userId);
        return this.httpClient.post(endpoint, setInitialPasswordDto);
    }

    async getCurrentUser(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.AUTH_USER);
    }

    async getUserTokens(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.AUTH_TOKENS);
    }

    async revokeUserTokens(revokeTokensDto: RevokeTokensDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_TOKENS_REVOKE, revokeTokensDto);
    }

    async deleteCurrentToken(): Promise<any> {
        const response = await this.httpClient.delete(ASACI_ENDPOINTS.AUTH_TOKENS);
        this.accessToken = null; // Clear stored token
        return response;
    }

    async resendEmailVerification(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.AUTH_EMAIL_VERIFICATION);
    }

    async verifyEmail(id: string, hash: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.AUTH_EMAIL_VERIFY.replace('{id}', id).replace('{hash}', hash);
        return this.httpClient.get(endpoint);
    }

    async getBrowserSessions(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.AUTH_BROWSER_SESSIONS);
    }

    async getLastActivity(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.AUTH_BROWSER_SESSIONS_LAST_ACTIVITY);
    }

    async logoutBrowserSessions(password: string): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_LOGOUT_BROWSER_SESSIONS, { password });
    }

    async generatePrivateToken(): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.AUTH_TOKENS_PRIVATE);
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    isAuthenticated(): boolean {
        return this.accessToken !== null;
    }
}