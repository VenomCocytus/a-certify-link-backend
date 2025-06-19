import { Request, Response, NextFunction } from 'express';
interface RequestWithLogging extends Request {
    requestId: string;
    startTime: number;
}
export declare const requestLoggerMiddleware: (req: RequestWithLogging, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=requestLogger.middleware.d.ts.map