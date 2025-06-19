import { BaseException } from './base.exception';
import { ValidationError } from 'class-validator';
export declare class ValidationException extends BaseException {
    constructor(message: string, details?: Record<string, unknown>, instance?: string);
    static fromJoiError(error: any, instance?: string): ValidationException;
    static fromClassValidatorErrors(errors: ValidationError[], instance?: string): ValidationException;
}
//# sourceMappingURL=validation.exception.d.ts.map