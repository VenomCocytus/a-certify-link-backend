import { Request, Response } from 'express';
import {
    GenerateTokenDto,
    OtpValidateDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendWelcomeDto,
    SetInitialPasswordDto,
    RevokeTokensDto
} from '@dto/asaci.dto';
import {AsaciAuthenticationService} from "@services/asaci-authentication.service";

export class AsaciAuthenticationController {
    constructor(private readonly asaciAuthService: AsaciAuthenticationService) {}

    async generateToken(req: Request, res: Response): Promise<void> {
        const generateTokenDto: GenerateTokenDto = req.body;
        const result = await this.asaciAuthService.generateAccessToken(generateTokenDto);
        res.status(200).json(result);
    }

    async validateOtp(req: Request, res: Response): Promise<void> {
        const otpValidateDto: OtpValidateDto = req.body;
        const result = await this.asaciAuthService.validateOtp(otpValidateDto);
        res.status(200).json(result);
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        const otpValidateDto: OtpValidateDto = req.body;
        const result = await this.asaciAuthService.resendOtp(otpValidateDto);
        res.status(200).json(result);
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        const forgotPasswordDto: ForgotPasswordDto = req.body;
        const result = await this.asaciAuthService.requestPasswordReset(forgotPasswordDto);
        res.status(200).json(result);
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        const resetPasswordDto: ResetPasswordDto = req.body;
        const result = await this.asaciAuthService.resetPassword(resetPasswordDto);
        res.status(200).json(result);
    }

    async resendWelcomeEmail(req: Request, res: Response): Promise<void> {
        const resendWelcomeDto: ResendWelcomeDto = req.body;
        const result = await this.asaciAuthService.resendWelcomeEmail(resendWelcomeDto);
        res.status(200).json(result);
    }

    async setInitialPassword(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;
        const setInitialPasswordDto: SetInitialPasswordDto = req.body;
        const result = await this.asaciAuthService.setInitialPassword(userId, setInitialPasswordDto);
        res.status(200).json(result);
    }

    async getCurrentUser(req: Request, res: Response): Promise<void> {
        const result = await this.asaciAuthService.getCurrentUser();
        res.status(200).json(result);
    }

    async getUserTokens(req: Request, res: Response): Promise<void> {
        const result = await this.asaciAuthService.getUserTokens();
        res.status(200).json(result);
    }

    async revokeTokens(req: Request, res: Response): Promise<void> {
        const revokeTokensDto: RevokeTokensDto = req.body;
        const result = await this.asaciAuthService.revokeUserTokens(revokeTokensDto);
        res.status(200).json(result);
    }

    async deleteCurrentToken(req: Request, res: Response): Promise<void> {
        const result = await this.asaciAuthService.deleteCurrentToken();
        res.status(200).json(result);
    }

    async resendEmailVerification(req: Request, res: Response): Promise<void> {
        const result = await this.asaciAuthService.resendEmailVerification();
        res.status(200).json(result);
    }

    async verifyEmail(req: Request, res: Response): Promise<void> {
        const { id, hash } = req.params;
        const result = await this.asaciAuthService.verifyEmail(id, hash);
        res.status(200).json(result);
    }
}