export enum ErrorCodes {
    // General errors
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',

    // Certificate specific errors
    CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND',
    CERTIFICATE_ALREADY_EXISTS = 'CERTIFICATE_ALREADY_EXISTS',
    CERTIFICATE_CREATION_FAILED = 'CERTIFICATE_CREATION_FAILED',
    CERTIFICATE_INVALID_STATUS = 'CERTIFICATE_INVALID_STATUS',
    CERTIFICATE_OPERATION_NOT_ALLOWED = 'CERTIFICATE_OPERATION_NOT_ALLOWED',

    // External API errors
    ORASS_CONNECTION_ERROR = 'ORASS_CONNECTION_ERROR',
    ORASS_AUTHENTICATION_ERROR = 'ORASS_AUTHENTICATION_ERROR',
    ORASS_DATA_NOT_FOUND = 'ORASS_DATA_NOT_FOUND',

    IVORY_ATTESTATION_CONNECTION_ERROR = 'IVORY_ATTESTATION_CONNECTION_ERROR',
    IVORY_ATTESTATION_AUTHENTICATION_ERROR = 'IVORY_ATTESTATION_AUTHENTICATION_ERROR',
    IVORY_ATTESTATION_CREATION_FAILED = 'IVORY_ATTESTATION_CREATION_FAILED',

    // Database errors
    DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
    DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',
    DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',

    // Business logic errors
    DUPLICATE_OPERATION = 'DUPLICATE_OPERATION',
    INVALID_OPERATION_STATE = 'INVALID_OPERATION_STATE',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export const ErrorMessages: Record<ErrorCodes, string> = {
    [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
    [ErrorCodes.VALIDATION_ERROR]: 'The provided data is invalid',
    [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
    [ErrorCodes.UNAUTHORIZED]: 'Authentication is required',
    [ErrorCodes.FORBIDDEN]: 'Access to this resource is forbidden',
    [ErrorCodes.CONFLICT]: 'The request conflicts with the current state',

    [ErrorCodes.CERTIFICATE_NOT_FOUND]: 'Certificate not found',
    [ErrorCodes.CERTIFICATE_ALREADY_EXISTS]: 'Certificate already exists',
    [ErrorCodes.CERTIFICATE_CREATION_FAILED]: 'Failed to create certificate',
    [ErrorCodes.CERTIFICATE_INVALID_STATUS]: 'Invalid certificate status',
    [ErrorCodes.CERTIFICATE_OPERATION_NOT_ALLOWED]: 'Operation not allowed for this certificate',

    [ErrorCodes.ORASS_CONNECTION_ERROR]: 'Failed to connect to Orass system',
    [ErrorCodes.ORASS_AUTHENTICATION_ERROR]: 'Orass authentication failed',
    [ErrorCodes.ORASS_DATA_NOT_FOUND]: 'Data not found in Orass system',

    [ErrorCodes.IVORY_ATTESTATION_CONNECTION_ERROR]: 'Failed to connect to IvoryAttestation system',
    [ErrorCodes.IVORY_ATTESTATION_AUTHENTICATION_ERROR]: 'IvoryAttestation authentication failed',
    [ErrorCodes.IVORY_ATTESTATION_CREATION_FAILED]: 'Failed to create attestation in IvoryAttestation',

    [ErrorCodes.DATABASE_CONNECTION_ERROR]: 'Database connection failed',
    [ErrorCodes.DATABASE_TRANSACTION_ERROR]: 'Database transaction failed',
    [ErrorCodes.DATABASE_CONSTRAINT_ERROR]: 'Database constraint violation',

    [ErrorCodes.DUPLICATE_OPERATION]: 'Duplicate operation detected',
    [ErrorCodes.INVALID_OPERATION_STATE]: 'Invalid state for this operation',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
};