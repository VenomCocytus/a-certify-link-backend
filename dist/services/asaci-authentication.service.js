"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciAuthenticationService = void 0;
const httpClient_1 = require("@utils/httpClient");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
class AsaciAuthenticationService {
    constructor(baseUrl) {
        this.accessToken = null;
        this.httpClient = new httpClient_1.HttpClient({
            baseURL: `${baseUrl}/api/v1`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    setAuthToken(token) {
        this.accessToken = token;
        this.httpClient.setAuthToken(token);
    }
    async generateAccessToken(generateTokenDto) {
        const response = await this.httpClient
            .post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_TOKENS, generateTokenDto);
        // Store the token for further requests
        if (response && response.token) {
            this.setAuthToken(response.token);
        }
        return response;
    }
    async validateOtp(otpValidateDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_OTP_VALIDATE, otpValidateDto);
    }
    async resendOtp(otpValidateDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_OTP_RESEND, otpValidateDto);
    }
    async requestPasswordReset(forgotPasswordDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_FORGOT_PASSWORD, forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_RESET_PASSWORD, resetPasswordDto);
    }
    async resendWelcomeEmail(resendWelcomeDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_WELCOME_SEND, resendWelcomeDto);
    }
    async setInitialPassword(userId, setInitialPasswordDto) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_WELCOME_SET_PASSWORD.replace('{userId}', userId);
        return this.httpClient.post(endpoint, setInitialPasswordDto);
    }
    async getCurrentUser() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_USER);
    }
    async getUserTokens() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_TOKENS);
    }
    async revokeUserTokens(revokeTokensDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_TOKENS_REVOKE, revokeTokensDto);
    }
    async deleteCurrentToken() {
        const response = await this.httpClient.delete(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_TOKENS);
        this.accessToken = null; // Clear stored token
        return response;
    }
    async resendEmailVerification() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_EMAIL_VERIFICATION);
    }
    async verifyEmail(id, hash) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_EMAIL_VERIFY.replace('{id}', id).replace('{hash}', hash);
        return this.httpClient.get(endpoint);
    }
    async getBrowserSessions() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_BROWSER_SESSIONS);
    }
    async getLastActivity() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_BROWSER_SESSIONS_LAST_ACTIVITY);
    }
    async logoutBrowserSessions(password) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_LOGOUT_BROWSER_SESSIONS, { password });
    }
    async generatePrivateToken() {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.AUTH_TOKENS_PRIVATE);
    }
    getAccessToken() {
        return this.accessToken;
    }
    isAuthenticated() {
        return this.accessToken !== null;
    }
}
exports.AsaciAuthenticationService = AsaciAuthenticationService;
//# sourceMappingURL=asaci-authentication.service.js.map