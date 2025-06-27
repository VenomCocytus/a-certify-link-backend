import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "@interfaces/common.interfaces";
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermissions: (requiredPermissions: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireRoles: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuthMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map