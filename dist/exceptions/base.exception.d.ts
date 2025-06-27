import { ErrorCodes } from '@/constants/error-codes';
export declare class BaseException extends Error {
    readonly code: ErrorCodes;
    readonly statusCode: number;
    readonly details?: Record<string, unknown>;
    readonly instance?: string;
    constructor(message: string, code: ErrorCodes, statusCode: number, details?: Record<string, unknown>, instance?: string);
    /**
     * Convert exception to RFC 7807 Problem Details format
     */
    toProblemDetails(): {
        type: string;
        title: string;
        status: number;
        message?: string;
        instance?: string;
        [key: string]: unknown;
    };
}
//# sourceMappingURL=base.exception.d.ts.map