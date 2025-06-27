import { BaseException } from './base.exception';
export declare class ValidationException extends BaseException {
    constructor(message: string, details?: Record<string, unknown>, instance?: string);
    static fromJoiError(error: any, instance?: string): ValidationException;
}
//# sourceMappingURL=validation.exception.d.ts.map