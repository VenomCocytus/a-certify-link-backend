import { Request, Response } from 'express';
import { AsaciAuthenticationService } from "@services/asaci-authentication.service";
export declare class AsaciAuthenticationController {
    private readonly asaciAuthService;
    constructor(asaciAuthService: AsaciAuthenticationService);
    generateToken(req: Request, res: Response): Promise<void>;
    validateOtp(req: Request, res: Response): Promise<void>;
    resendOtp(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    resendWelcomeEmail(req: Request, res: Response): Promise<void>;
    setInitialPassword(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
    getUserTokens(req: Request, res: Response): Promise<void>;
    revokeTokens(req: Request, res: Response): Promise<void>;
    deleteCurrentToken(req: Request, res: Response): Promise<void>;
    resendEmailVerification(req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=asaci-authentication.controller.d.ts.map