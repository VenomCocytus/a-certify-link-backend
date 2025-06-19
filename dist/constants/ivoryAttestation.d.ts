export declare const IvoryAttestationConstants: {
    readonly ENDPOINTS: {
        readonly EDITION: "/edition/1.0/Apiediton";
        readonly VERIFICATION: "/Verification-statutdemande-edition/1.0/Api-Verification-statut-demande-edition";
        readonly UPDATE_STATUS: "/actualisation-dustatut-dattestation/1.0/apiactualisation-statut-attestation";
        readonly DOWNLOAD: "/recuperationAttestation/";
    };
    readonly VEHICLE_CATEGORIES: {
        readonly CATEGORY_1: "01";
        readonly CATEGORY_2: "02";
        readonly CATEGORY_3: "03";
        readonly CATEGORY_4: "04";
        readonly CATEGORY_5: "05";
        readonly CATEGORY_6: "06";
        readonly CATEGORY_7: "07";
        readonly CATEGORY_8: "08";
        readonly CATEGORY_9: "09";
        readonly CATEGORY_10: "10";
        readonly CATEGORY_12: "12";
    };
    readonly ENERGY_SOURCES: {
        readonly DIESEL: "SEDI";
        readonly ELECTRIC: "SEEL";
        readonly GASOLINE: "SEES";
        readonly HYBRID: "SEHY";
    };
    readonly VEHICLE_TYPES: {
        readonly AMBULANCE: "TV01";
        readonly BUS_LARGE: "TV02";
        readonly HEARSE: "TV03";
        readonly MINI_BUS: "TV04";
        readonly TAXI_COMMUNAL: "TV05";
        readonly TAXI_URBAN: "TV06";
        readonly DRIVING_SCHOOL: "TV07";
        readonly PUBLIC_SERVICE: "TV08";
        readonly TOURISM: "TV09";
        readonly PERSONAL: "TV10";
        readonly UTILITY: "TV11";
        readonly RENTAL: "TV12";
        readonly MOTORCYCLE: "TV13";
    };
    readonly VEHICLE_GENRES: {
        readonly TRUCK: "GV01";
        readonly VAN: "GV02";
        readonly MOTORCYCLE: "GV03";
        readonly CAR: "GV04";
        readonly CONSTRUCTION_EQUIPMENT: "GV05";
        readonly BUS: "GV06";
        readonly PANEL_VAN: "GV07";
        readonly TRAILER: "GV08";
        readonly SCOOTER: "GV09";
        readonly SEMI_TRAILER: "GV10";
        readonly AGRICULTURAL_TRACTOR: "GV11";
        readonly ROAD_TRACTOR: "GV12";
    };
    readonly VEHICLE_USAGE: {
        readonly PERSONAL_BUSINESS: "UV01";
        readonly OWN_TRANSPORT: "UV02";
        readonly PRIVATE_PASSENGER: "UV03";
        readonly PUBLIC_GOODS: "UV04";
        readonly PUBLIC_PASSENGER: "UV05";
        readonly DRIVING_SCHOOL: "UV06";
        readonly RENTAL: "UV07";
        readonly SPECIAL: "UV08";
        readonly CONSTRUCTION: "UV09";
        readonly MOTORCYCLE: "UV10";
    };
    readonly PROFESSIONS: {
        readonly COMMERCIAL_AGENT: "ST01";
        readonly COLLECTION_AGENT: "ST02";
        readonly FARMER: "ST03";
        readonly ARTISAN: "ST04";
        readonly SPOUSE: "ST05";
        readonly EMPLOYER: "ST06";
        readonly RELIGIOUS: "ST07";
        readonly RETIRED: "ST08";
        readonly EMPLOYEE: "ST09";
        readonly UNEMPLOYED: "ST10";
        readonly SALES_REP: "ST11";
        readonly OTHER: "ST12";
    };
    readonly INSURED_TYPES: {
        readonly PHYSICAL_PERSON: "TAPP";
        readonly LEGAL_ENTITY: "TAPM";
    };
    readonly SUBSCRIBER_TYPES: {
        readonly PHYSICAL_PERSON: "TSPP";
        readonly LEGAL_ENTITY: "TSPM";
    };
    readonly CERTIFICATE_COLORS: {
        readonly YELLOW: "JAUN";
        readonly BROWN: "BRUN";
        readonly GREEN: "VERT";
        readonly BLUE_MATCA: "BLMA";
        readonly BROWN_POOL_TPV: "MARR";
        readonly RED_POOL_TPV: "ROUG";
        readonly BLUE_POOL_TPV: "BTPV";
    };
    readonly OPERATION_CODES: {
        readonly CANCEL: "109";
        readonly SUSPEND: "120";
    };
    readonly STATUS_CODES: {
        readonly SUCCESS: 0;
        readonly PENDING: 121;
        readonly GENERATING: 122;
        readonly READY_FOR_TRANSFER: 123;
        readonly TRANSFERRED: 124;
        readonly RATE_LIMIT_EXCEEDED: -37;
        readonly UNAUTHORIZED: -36;
        readonly DUPLICATE_EXISTS: -35;
        readonly INVALID_CIRCULATION_ZONE: -34;
        readonly INVALID_SUBSCRIBER_TYPE: -33;
        readonly INVALID_INSURED_TYPE: -32;
        readonly INVALID_PROFESSION: -31;
        readonly INVALID_VEHICLE_TYPE: -30;
        readonly INVALID_VEHICLE_USAGE: -29;
        readonly INVALID_VEHICLE_GENRE: -28;
        readonly INVALID_ENERGY_SOURCE: -27;
        readonly INVALID_VEHICLE_CATEGORY: -26;
        readonly NO_INTERMEDIARY_RELATION: -25;
        readonly INVALID_INSURED_EMAIL: -24;
        readonly INVALID_SUBSCRIBER_EMAIL: -23;
        readonly INVALID_CERTIFICATE_COLOR: -22;
        readonly INVALID_SUBSCRIPTION_DATE: -21;
        readonly INVALID_EFFECT_DATE: -20;
        readonly INVALID_DATE_FORMAT: -19;
        readonly DATA_ERROR: -18;
        readonly SYSTEM_ERROR: -17;
        readonly SAVE_ERROR: -16;
        readonly EDITION_FAILED: -15;
        readonly AUTHORIZATION_ERROR: -14;
        readonly AUTHENTICATION_ERROR: -13;
        readonly INCORRECT_ACCESS_CODE: -12;
        readonly INVALID_FILE_FORMAT: -11;
        readonly INVALID_FILE_STRUCTURE: -10;
        readonly INVALID_FILE_DATA: -9;
        readonly INCORRECT_AUTHENTICATION: -8;
        readonly DATE_ERROR: -7;
        readonly CONTRACT_DURATION_ERROR: -6;
        readonly COMPANY_STOCK_ERROR: -5;
        readonly INTERMEDIARY_STOCK_ERROR: -4;
        readonly INVALID_INTERMEDIARY_CODE: -3;
        readonly INVALID_COMPANY_CODE: -2;
        readonly DUPLICATE_ERROR: -1;
    };
    readonly LIMITS: {
        readonly MAX_VEHICLES_PER_API_REQUEST: 500;
        readonly MAX_VEHICLES_PER_FILE: 100;
        readonly MAX_VEHICLES_PER_FORM: 1;
    };
};
//# sourceMappingURL=ivoryAttestation.d.ts.map