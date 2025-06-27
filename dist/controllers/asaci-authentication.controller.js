"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciAuthenticationController = void 0;
class AsaciAuthenticationController {
    constructor(asaciAuthService) {
        this.asaciAuthService = asaciAuthService;
    }
    async generateToken(req, res) {
        const generateTokenDto = req.body;
        const result = await this.asaciAuthService.generateAccessToken(generateTokenDto);
        res.status(200).json(result);
    }
    async validateOtp(req, res) {
        const otpValidateDto = req.body;
        const result = await this.asaciAuthService.validateOtp(otpValidateDto);
        res.status(200).json(result);
    }
    async resendOtp(req, res) {
        const otpValidateDto = req.body;
        const result = await this.asaciAuthService.resendOtp(otpValidateDto);
        res.status(200).json(result);
    }
    async forgotPassword(req, res) {
        const forgotPasswordDto = req.body;
        const result = await this.asaciAuthService.requestPasswordReset(forgotPasswordDto);
        res.status(200).json(result);
    }
    async resetPassword(req, res) {
        const resetPasswordDto = req.body;
        const result = await this.asaciAuthService.resetPassword(resetPasswordDto);
        res.status(200).json(result);
    }
    async resendWelcomeEmail(req, res) {
        const resendWelcomeDto = req.body;
        const result = await this.asaciAuthService.resendWelcomeEmail(resendWelcomeDto);
        res.status(200).json(result);
    }
    async setInitialPassword(req, res) {
        const userId = req.params.userId;
        const setInitialPasswordDto = req.body;
        const result = await this.asaciAuthService.setInitialPassword(userId, setInitialPasswordDto);
        res.status(200).json(result);
    }
    async getCurrentUser(req, res) {
        const result = await this.asaciAuthService.getCurrentUser();
        res.status(200).json(result);
    }
    async getUserTokens(req, res) {
        const result = await this.asaciAuthService.getUserTokens();
        res.status(200).json(result);
    }
    async revokeTokens(req, res) {
        const revokeTokensDto = req.body;
        const result = await this.asaciAuthService.revokeUserTokens(revokeTokensDto);
        res.status(200).json(result);
    }
    async deleteCurrentToken(req, res) {
        const result = await this.asaciAuthService.deleteCurrentToken();
        res.status(200).json(result);
    }
    async resendEmailVerification(req, res) {
        const result = await this.asaciAuthService.resendEmailVerification();
        res.status(200).json(result);
    }
    async verifyEmail(req, res) {
        const { id, hash } = req.params;
        const result = await this.asaciAuthService.verifyEmail(id, hash);
        res.status(200).json(result);
    }
}
exports.AsaciAuthenticationController = AsaciAuthenticationController;
//# sourceMappingURL=asaci-authentication.controller.js.map