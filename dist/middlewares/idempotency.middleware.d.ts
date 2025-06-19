import { Request, Response, NextFunction } from 'express';
interface IdempotentRequest extends Request {
    idempotencyKey?: string;
    isIdempotentReplay?: boolean;
}
export declare const idempotencyMiddleware: (options?: {
    headerName?: string;
    ttlHours?: number;
}) => (req: IdempotentRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=idempotency.middleware.d.ts.map