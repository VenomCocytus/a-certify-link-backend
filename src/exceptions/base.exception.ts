import { ErrorCodes } from '@/constants/error-codes';

export class BaseException extends Error {
    public readonly code: ErrorCodes;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;
    public readonly instance?: string;

    constructor(
        message: string,
        code: ErrorCodes,
        statusCode: number,
        details?: Record<string, unknown>,
        instance?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.instance = instance;

        // Maintains a proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

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
    } {
        return {
            type: `https://example.com/errors/${this.code}`,
            title: this.name.replace(/([A-Z])/g, ' $1').trim(),
            status: this.statusCode,
            message: this.message,
            instance: this.instance,
            code: this.code,
            ...(this.details && { details: this.details }),
        };
    }
}