export declare const Messages: {
    readonly CERTIFICATE: {
        readonly CREATED: "certificate_created";
        readonly UPDATED: "certificate_updated";
        readonly CANCELLED: "certificate_cancelled";
        readonly SUSPENDED: "certificate_suspended";
        readonly NOT_FOUND: "certificate_not_found";
        readonly INVALID_STATUS: "certificate_invalid_status";
        readonly DUPLICATE_FOUND: "certificate_duplicate_found";
    };
    readonly VALIDATION: {
        readonly REQUIRED_FIELD: "validation_required_field";
        readonly INVALID_FORMAT: "validation_invalid_format";
        readonly INVALID_EMAIL: "validation_invalid_email";
        readonly INVALID_PHONE: "validation_invalid_phone";
        readonly INVALID_DATE: "validation_invalid_date";
        readonly INVALID_DATE_RANGE: "validation_invalid_date_range";
    };
    readonly AUTH: {
        readonly UNAUTHORIZED: "auth_unauthorized";
        readonly TOKEN_EXPIRED: "auth_token_expired";
        readonly INVALID_TOKEN: "auth_invalid_token";
        readonly ACCESS_DENIED: "auth_access_denied";
    };
    readonly SYSTEM: {
        readonly HEALTH_OK: "system_health_ok";
        readonly SERVICE_UNAVAILABLE: "system_service_unavailable";
        readonly MAINTENANCE_MODE: "system_maintenance_mode";
    };
    readonly EXTERNAL_API: {
        readonly CONNECTION_ERROR: "external_api_connection_error";
        readonly TIMEOUT_ERROR: "external_api_timeout_error";
        readonly AUTHENTICATION_ERROR: "external_api_authentication_error";
        readonly DATA_NOT_FOUND: "external_api_data_not_found";
    };
};
//# sourceMappingURL=messages.d.ts.map