import {BaseException} from './base.exception';
import {ErrorCodes, ErrorMessages} from "@/constants/errorCodes";

/**
 * Exception thrown when invalid data is encountered
 * Maps to HTTP 422 Unprocessable Entity
 */
export class InvalidDataError extends BaseException {
    constructor(
        message: string,
        code: ErrorCodes = ErrorCodes.INVALID_DATA,
        statusCode: number = 422,
        public readonly errors: Record<string, string[]> = {},
        public readonly context?: string
    ) {
        super(
            message,
            code,
            statusCode,
            errors,
        );

        this.name = ErrorMessages.INVALID_DATA;
    }
}