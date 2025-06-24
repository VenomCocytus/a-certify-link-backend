import { BaseException } from './base.exception';
import { ErrorCodes } from '@/constants/error-codes';

export class NotFoundException extends BaseException {
    constructor(
        resource: string,
        identifier?: string | number,
        instance?: string
    ) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;

        super(
            message,
            ErrorCodes.NOT_FOUND,
            404,
            { resource, identifier },
            instance
        );
    }
}