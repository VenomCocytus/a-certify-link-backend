import { Request, Response, NextFunction } from 'express';
export declare const asyncHandlerMiddleware: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=async-handler.middleware.d.ts.map