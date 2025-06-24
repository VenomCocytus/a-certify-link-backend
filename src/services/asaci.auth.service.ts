import { HttpClient } from '../utils/http-client';
import {
    GenerateTokenDto,
    OtpValidateDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendWelcomeDto,
    SetInitialPasswordDto,
    RevokeTokensDto
} from '../dto/asaci.dto';

export class AsaciAuthService {
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
        const response = await this.httpClient.post('auth/tokens', generateTokenDto);

        // Store the token for later requests
        if (response && response.token) {
            this.setAuthToken(response.token);
        }

        return response;
    }

    async validateOtp(otpValidateDto: OtpValidateDto): Promise<any> {
        return this.httpClient.post('auth/otp-validate', otpValidateDto);
    }

    async resendOtp(otpValidateDto: OtpValidateDto): Promise<any> {
        return this.httpClient.post('auth/otp-resend', otpValidateDto);
    }

    async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
        return this.httpClient.post('auth/forgot-password', forgotPasswordDto);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
        return this.httpClient.post('auth/reset-password', resetPasswordDto);
    }

    async resendWelcomeEmail(resendWelcomeDto: ResendWelcomeDto): Promise<any> {
        return this.httpClient.post('auth/welcome/send-welcome', resendWelcomeDto);
    }

    async setInitialPassword(userId: string, setInitialPasswordDto: SetInitialPasswordDto): Promise<any> {
        return this.httpClient.post(`auth/welcome/${userId}`, setInitialPasswordDto);
    }

    async getCurrentUser(): Promise<any> {
        return this.httpClient.get('auth/user');
    }

    async getUserTokens(): Promise<any> {
        return this.httpClient.get('auth/tokens');
    }

    async revokeUserTokens(revokeTokensDto: RevokeTokensDto): Promise<any> {
        return this.httpClient.post('auth/tokens/revoke', revokeTokensDto);
    }

    async deleteCurrentToken(): Promise<any> {
        const response = await this.httpClient.delete('auth/tokens');
        this.accessToken = null; // Clear stored token
        return response;
    }

    async resendEmailVerification(): Promise<any> {
        return this.httpClient.get('auth/email/send-verification');
    }

    async verifyEmail(id: string, hash: string): Promise<any> {
        return this.httpClient.get(`auth/email/verify/${id}/${hash}`);
    }

    async getBrowserSessions(): Promise<any> {
        return this.httpClient.get('auth/browser-sessions');
    }

    async getLastActivity(): Promise<any> {
        return this.httpClient.get('auth/browser-sessions/last-activity');
    }

    async logoutBrowserSessions(password: string): Promise<any> {
        return this.httpClient.post('auth/logout-browser-sessions', { password });
    }

    async generatePrivateToken(): Promise<any> {
        return this.httpClient.post('auth/tokens/private');
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    isAuthenticated(): boolean {
        return this.accessToken !== null;
    }
}