import { Request, Response } from 'express';
import { AuthenticatedRequest } from "@interfaces/middleware.interfaces";
export declare class AuthController {
    private authService;
    private userRepository;
    constructor();
    login: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
    getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    verifyToken: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    unlockAccount: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map