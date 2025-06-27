import { BaseException } from './base.exception';
import { ErrorCodes } from '@/constants/error-codes';
import { ValidationError } from 'class-validator';

export class ValidationException extends BaseException {
    constructor(
        message: string,
        details?: Record<string, unknown>,
        instance?: string
    ) {
        super(message, ErrorCodes.VALIDATION_ERROR, 400, details, instance);
    }

    static fromJoiError(error: any, instance?: string): ValidationException {
        const details = error.details?.reduce((acc: Record<string, string>, detail: any) => {
            acc[detail.path.join('.')] = detail.message;
            return acc;
        }, {});

        return new ValidationException(
            'Validation failed',
            { validationErrors: details },
            instance
        );
    }
}