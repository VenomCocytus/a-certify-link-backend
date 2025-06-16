export const Messages = {
    CERTIFICATE: {
        CREATED: 'certificate_created',
        UPDATED: 'certificate_updated',
        CANCELLED: 'certificate_cancelled',
        SUSPENDED: 'certificate_suspended',
        NOT_FOUND: 'certificate_not_found',
        INVALID_STATUS: 'certificate_invalid_status',
        DUPLICATE_FOUND: 'certificate_duplicate_found',
    },

    VALIDATION: {
        REQUIRED_FIELD: 'validation_required_field',
        INVALID_FORMAT: 'validation_invalid_format',
        INVALID_EMAIL: 'validation_invalid_email',
        INVALID_PHONE: 'validation_invalid_phone',
        INVALID_DATE: 'validation_invalid_date',
        INVALID_DATE_RANGE: 'validation_invalid_date_range',
    },

    AUTH: {
        UNAUTHORIZED: 'auth_unauthorized',
        TOKEN_EXPIRED: 'auth_token_expired',
        INVALID_TOKEN: 'auth_invalid_token',
        ACCESS_DENIED: 'auth_access_denied',
    },

    SYSTEM: {
        HEALTH_OK: 'system_health_ok',
        SERVICE_UNAVAILABLE: 'system_service_unavailable',
        MAINTENANCE_MODE: 'system_maintenance_mode',
    },

    EXTERNAL_API: {
        CONNECTION_ERROR: 'external_api_connection_error',
        TIMEOUT_ERROR: 'external_api_timeout_error',
        AUTHENTICATION_ERROR: 'external_api_authentication_error',
        DATA_NOT_FOUND: 'external_api_data_not_found',
    },
} as const;