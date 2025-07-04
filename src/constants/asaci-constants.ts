export const AsaciConstants = {
    // Certificate Colors
    CERTIFICATE_COLORS: {
        YELLOW: 'JAUN',
        BROWN: 'BRUN',
        GREEN: 'VERT',
        BLUE_MATCA: 'BLMA',
        BROWN_POOL_TPV: 'MARR',
        RED_POOL_TPV: 'ROUG',
        BLUE_POOL_TPV: 'BTPV',
    },

    // Operation Codes
    OPERATION_CODES: {
        CANCEL: '109',
        SUSPEND: '120',
    },

    // Status Codes
    STATUS_CODES: {
        SUCCESS: 0,
        PENDING: 121,
        GENERATING: 122,
        READY_FOR_TRANSFER: 123,
        TRANSFERRED: 124,

        // Error codes
        RATE_LIMIT_EXCEEDED: -37,
        UNAUTHORIZED: -36,
        DUPLICATE_EXISTS: -35,
        INVALID_CIRCULATION_ZONE: -34,
        INVALID_SUBSCRIBER_TYPE: -33,
        INVALID_INSURED_TYPE: -32,
        INVALID_PROFESSION: -31,
        INVALID_VEHICLE_TYPE: -30,
        INVALID_VEHICLE_USAGE: -29,
        INVALID_VEHICLE_GENRE: -28,
        INVALID_ENERGY_SOURCE: -27,
        INVALID_VEHICLE_CATEGORY: -26,
        NO_INTERMEDIARY_RELATION: -25,
        INVALID_INSURED_EMAIL: -24,
        INVALID_SUBSCRIBER_EMAIL: -23,
        INVALID_CERTIFICATE_COLOR: -22,
        INVALID_SUBSCRIPTION_DATE: -21,
        INVALID_EFFECT_DATE: -20,
        INVALID_DATE_FORMAT: -19,
        DATA_ERROR: -18,
        SYSTEM_ERROR: -17,
        SAVE_ERROR: -16,
        EDITION_FAILED: -15,
        AUTHORIZATION_ERROR: -14,
        AUTHENTICATION_ERROR: -13,
        INCORRECT_ACCESS_CODE: -12,
        INVALID_FILE_FORMAT: -11,
        INVALID_FILE_STRUCTURE: -10,
        INVALID_FILE_DATA: -9,
        INCORRECT_AUTHENTICATION: -8,
        DATE_ERROR: -7,
        CONTRACT_DURATION_ERROR: -6,
        COMPANY_STOCK_ERROR: -5,
        INTERMEDIARY_STOCK_ERROR: -4,
        INVALID_INTERMEDIARY_CODE: -3,
        INVALID_COMPANY_CODE: -2,
        DUPLICATE_ERROR: -1,
    },

    // Max limits
    LIMITS: {
        MAX_VEHICLES_PER_API_REQUEST: 500,
        MAX_VEHICLES_PER_FILE: 100,
        MAX_VEHICLES_PER_FORM: 1,
    },
} as const;