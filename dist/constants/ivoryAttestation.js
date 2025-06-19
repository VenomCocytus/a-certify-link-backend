"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IvoryAttestationConstants = void 0;
// Based on the IvoryAttestation documentation
exports.IvoryAttestationConstants = {
    // API Endpoints
    ENDPOINTS: {
        EDITION: '/edition/1.0/Apiediton',
        VERIFICATION: '/Verification-statutdemande-edition/1.0/Api-Verification-statut-demande-edition',
        UPDATE_STATUS: '/actualisation-dustatut-dattestation/1.0/apiactualisation-statut-attestation',
        DOWNLOAD: '/recuperationAttestation/',
    },
    // Vehicle Categories
    VEHICLE_CATEGORIES: {
        CATEGORY_1: '01', // Personal vehicles
        CATEGORY_2: '02', // Commercial goods transport
        CATEGORY_3: '03', // Third-party goods transport
        CATEGORY_4: '04', // Taxi vehicles
        CATEGORY_5: '05', // 2-3 wheel vehicles
        CATEGORY_6: '06', // Garage vehicles
        CATEGORY_7: '07', // Driving school vehicles
        CATEGORY_8: '08', // Rental vehicles
        CATEGORY_9: '09', // Construction equipment
        CATEGORY_10: '10', // Special vehicles
        CATEGORY_12: '12', // Corporate personal vehicles
    },
    // Energy Sources
    ENERGY_SOURCES: {
        DIESEL: 'SEDI',
        ELECTRIC: 'SEEL',
        GASOLINE: 'SEES',
        HYBRID: 'SEHY',
    },
    // Vehicle Types
    VEHICLE_TYPES: {
        AMBULANCE: 'TV01',
        BUS_LARGE: 'TV02',
        HEARSE: 'TV03',
        MINI_BUS: 'TV04',
        TAXI_COMMUNAL: 'TV05',
        TAXI_URBAN: 'TV06',
        DRIVING_SCHOOL: 'TV07',
        PUBLIC_SERVICE: 'TV08',
        TOURISM: 'TV09',
        PERSONAL: 'TV10',
        UTILITY: 'TV11',
        RENTAL: 'TV12',
        MOTORCYCLE: 'TV13',
    },
    // Vehicle Genres
    VEHICLE_GENRES: {
        TRUCK: 'GV01',
        VAN: 'GV02',
        MOTORCYCLE: 'GV03',
        CAR: 'GV04',
        CONSTRUCTION_EQUIPMENT: 'GV05',
        BUS: 'GV06',
        PANEL_VAN: 'GV07',
        TRAILER: 'GV08',
        SCOOTER: 'GV09',
        SEMI_TRAILER: 'GV10',
        AGRICULTURAL_TRACTOR: 'GV11',
        ROAD_TRACTOR: 'GV12',
    },
    // Vehicle Usage
    VEHICLE_USAGE: {
        PERSONAL_BUSINESS: 'UV01',
        OWN_TRANSPORT: 'UV02',
        PRIVATE_PASSENGER: 'UV03',
        PUBLIC_GOODS: 'UV04',
        PUBLIC_PASSENGER: 'UV05',
        DRIVING_SCHOOL: 'UV06',
        RENTAL: 'UV07',
        SPECIAL: 'UV08',
        CONSTRUCTION: 'UV09',
        MOTORCYCLE: 'UV10',
    },
    // Professional Status
    PROFESSIONS: {
        COMMERCIAL_AGENT: 'ST01',
        COLLECTION_AGENT: 'ST02',
        FARMER: 'ST03',
        ARTISAN: 'ST04',
        SPOUSE: 'ST05',
        EMPLOYER: 'ST06',
        RELIGIOUS: 'ST07',
        RETIRED: 'ST08',
        EMPLOYEE: 'ST09',
        UNEMPLOYED: 'ST10',
        SALES_REP: 'ST11',
        OTHER: 'ST12',
    },
    // Insured Types
    INSURED_TYPES: {
        PHYSICAL_PERSON: 'TAPP',
        LEGAL_ENTITY: 'TAPM',
    },
    // Subscriber Types
    SUBSCRIBER_TYPES: {
        PHYSICAL_PERSON: 'TSPP',
        LEGAL_ENTITY: 'TSPM',
    },
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
};
//# sourceMappingURL=ivoryAttestation.js.map