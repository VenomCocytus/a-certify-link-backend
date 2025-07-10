import {AuthTokens, UserProfile} from "@interfaces/common.interfaces";
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";
import {OrassService} from "@services/orass.service";
import {AsaciProductionService} from "@services/asaci-production.service";
import {
    CertificateColor,
    CertificateType,
    ChannelType, SubscriberType,
    VehicleCategory, VehicleEnergy, VehicleGenre,
    VehicleType,
    VehicleUsage
} from "@interfaces/common.enum";
import oracledb from "oracledb";

/**
 * Factory function to create mock user data
 */
export const createMockUser = (overrides: Partial<any> = {}) =>
    createMockSequelizeModel({
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        phoneNumber: '+1234567890',
        roleId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        isAccountLocked: false,
        // Authentication-specific methods
        validatePassword: jest.fn().mockResolvedValue(true),
        incrementLoginAttempts: jest.fn().mockResolvedValue(undefined),
        resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
        generatePasswordResetToken: jest.fn().mockResolvedValue('reset-token'),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        canChangePassword: jest.fn().mockResolvedValue(true),
        ...overrides
    });



/**
 * Factory function to create mock role data
 */
export const createMockRole = (overrides: Partial<any> = {}) =>
    createMockSequelizeModel({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'USER',
        permissions: ['read', 'write'],
        ...overrides
    });

/**
 * Factory function to create mock auth tokens
 */
export const createMockTokens = (overrides: Partial<AuthTokens> = {}): AuthTokens => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
    tokenType: 'Bearer',
    ...overrides
});

/**
 * Factory function to create a mock user profile
 */
export const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    role: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'USER',
        permissions: ['read', 'write']
    },
    isActive: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    ...overrides
});

/**
 * Mock Express Request factory
 */
export const createMockRequest = (overrides: Partial<any> = {}) => ({
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    originalUrl: '/auth/test',
    method: 'GET',
    url: '/auth/test',
    ...overrides
});

/**
 * Mock Express Response factory
 */
export const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn().mockReturnValue(undefined);
    return res;
};

/**
 * Mock Authenticated Request factory
 */
export const createMockAuthenticatedRequest = (overrides: Partial<any> = {}) => ({
    ...createMockRequest(),
    user: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: false
    },
    ...overrides
} as AuthenticatedRequest);

/**
 * Test data constants
 */
export const TEST_DATA = {
    VALID_EMAIL: 'test@example.com',
    VALID_PASSWORD: 'Password123!',
    INVALID_EMAIL: 'invalid-email',
    INVALID_PASSWORD: '123',
    VALID_UUID: '123e4567-e89b-12d3-a456-426614174001',
    INVALID_UUID: 'invalid-uuid',
    VALID_PHONE: '+1234567890',
    INVALID_PHONE: '123',
    TWO_FACTOR_CODE: '123456',
    INVALID_TWO_FACTOR_CODE: '000000',
    VALID_FIRST_NAME: 'John',
    VALID_LAST_NAME: 'Doe',
    VALID_ROLE_ID: '123e4567-e89b-12d3-a456-426614174000'
};

/**
 * Environment setup helper
 */
export const setupTestEnvironment = () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.APP_NAME = 'Test App';
    process.env.NODE_ENV = 'test';
};

/**
 * Clean up environment helper
 */
export const cleanupTestEnvironment = () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.APP_NAME;
    delete process.env.NODE_ENV;
};

/**
 * Mock crypto hash function
 */
export const createMockCryptoHash = (returnValue: string = 'mock-hash') => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue(returnValue),
    copy: jest.fn().mockReturnThis(),
    _transform: jest.fn(),
    _flush: jest.fn(),
    allowHalfOpen: false,
    readable: true,
    writable: true,
    destroyed: false,
    // Add other required Hash properties as needed
    pipe: jest.fn(),
    unpipe: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    listenerCount: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    eventNames: jest.fn()
} as any); // Use 'as any' to bypass remaining type requirements

export const createValidForgotPasswordDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    ...overrides
});

export const createValidResetPasswordDto = (overrides: Partial<any> = {}) => ({
    token: 'valid-reset-token',
    newPassword: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    ...overrides
});

export const createValidVerifyEmailDto = (overrides: Partial<any> = {}) => ({
    token: 'valid-verify-token',
    userId: TEST_DATA.VALID_UUID,
    ...overrides
});

export const createValidTwoFactorDto = (overrides: Partial<any> = {}) => ({
    code: TEST_DATA.TWO_FACTOR_CODE,
    ...overrides
});

export const createValidTwoFactorDisableDto = (overrides: Partial<any> = {}) => ({
    password: TEST_DATA.VALID_PASSWORD,
    code: TEST_DATA.TWO_FACTOR_CODE,
    ...overrides
});

export const createValidUpdateProfileDto = (overrides: Partial<any> = {}) => ({
    firstName: 'UpdatedFirst',
    lastName: 'UpdatedLast',
    phoneNumber: '+1987654321',
    ...overrides
});

export const createValidCreateUserDto = (overrides: Partial<any> = {}) => ({
    email: 'newuser@example.com',
    firstName: 'New',
    lastName: 'User',
    phoneNumber: TEST_DATA.VALID_PHONE,
    roleId: TEST_DATA.VALID_ROLE_ID,
    isActive: true,
    ...overrides
});

/**
 * Mock database connection helper
 */
export const createMockDatabaseConnection = () => ({
    authenticate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation((callback) => callback())
});

/**
 * Mock external service response
 */
export const createMockExternalServiceResponse = (data: any, status: number = 200) => ({
    status,
    data,
    headers: {},
    statusText: status === 200 ? 'OK' : 'Error'
});

/**
 * Validation error factory
 */
export const createValidationError = (field: string, message: string) => {
    const error = new Error(message);
    error.name = 'ValidationException';
    (error as any).field = field;
    return error;
};

/**
 * Base exception factory
 */
export const createBaseException = (message: string, statusCode: number = 500) => {
    const error = new Error(message);
    error.name = 'BaseException';
    (error as any).statusCode = statusCode;
    return error;
};

/**
 * Mock HTTP client
 */
export const createMockHttpClient = () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn()
});

/**
 * Test data generation helpers
 */
export const generateRandomString = (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const generateRandomEmail = (domain: string = 'example.com'): string => {
    return `${generateRandomString(8)}@${domain}`;
};

export const generateRandomUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Test assertion helpers
 */
export const expectHttpStatus = (response: any, expectedStatus: number) => {
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
};

export const expectJsonResponse = (response: any, expectedData: any) => {
    expect(response.json).toHaveBeenCalledWith(expectedData);
};

export const expectCookieSet = (response: any, name: string, value: string, options?: any) => {
    if (options) {
        expect(response.cookie).toHaveBeenCalledWith(name, value, options);
    } else {
        expect(response.cookie).toHaveBeenCalledWith(name, value, expect.any(Object));
    }
};

export const expectCookieCleared = (response: any, name: string) => {
    expect(response.clearCookie).toHaveBeenCalledWith(name);
};

/**
 * Mock middleware helpers
 */
export const createMockMiddleware = () => jest.fn((req, res, next) => next());

export const createMockAuthMiddleware = (user?: any) =>
    jest.fn((req, res, next) => {
        if (user) {
            req.user = user;
        }
        next();
    });

export const createMockValidationMiddleware = (shouldFail: boolean = false) =>
    jest.fn((req, res, next) => {
        if (shouldFail) {
            const error = createValidationError('email', 'Invalid email format');
            next(error);
        } else {
            next();
        }
    });

/**
 * Test file helpers
 */
export const createMockFile = (name: string = 'test.txt', content: string = 'test content') => ({
    originalname: name,
    mimetype: 'text/plain',
    size: content.length,
    buffer: Buffer.from(content),
    fieldname: 'file',
    encoding: '7bit'
});

/**
 * Performance testing helpers
 */
export const measureExecutionTime = async (fn: () => Promise<any>): Promise<{ result: any; duration: number }> => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
};

export const expectExecutionTime = async (fn: () => Promise<any>, maxTime: number) => {
    const { duration } = await measureExecutionTime(fn);
    expect(duration).toBeLessThan(maxTime);
};

// CertifyLink specific test factories
export const createMockAsaciRequest = (overrides: Partial<any> = {}): any => ({
    id: TEST_DATA.VALID_UUID,
    userId: TEST_DATA.VALID_UUID,
    officeCode: 'OFF001',
    organizationCode: 'ORG001',
    certificateType: 'cima',
    emailNotification: 'test@example.com',
    generatedBy: 'test-generator',
    channel: 'api',
    status: 'COMPLETED',
    asaciReference: 'CERT-12345',
    certificateUrl: 'https://example.com/cert.pdf',
    downloadCount: 3,
    asaciResponsePayload: {
        data: {
            reference: 'CERT-12345',
            download_link: 'https://example.com/cert.pdf'
        }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    // Add missing properties from AsaciRequestModel
    retryCount: 0,
    maxRetries: 3,
    isCompleted: true,
    isFailed: false,
    orassData: null,
    asaciRequestPayload: null,
    errorDetails: null,
    completedAt: new Date(),
    failedAt: null,
    // Mock methods
    setOrassData: jest.fn().mockResolvedValue(undefined),
    setAsaciRequest: jest.fn().mockResolvedValue(undefined),
    setAsaciResponse: jest.fn().mockResolvedValue(undefined),
    markAsCompleted: jest.fn().mockResolvedValue(undefined),
    markAsFailed: jest.fn().mockResolvedValue(undefined),
    incrementDownloadCount: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    toJSON: jest.fn().mockReturnValue({}),
    ...overrides
});

export const createMockOrassPolicy = (overrides: Partial<any> = {}) => ({
    policyNumber: 'POL123456',
    organizationCode: 'ORG001',
    officeCode: 'OFF001',
    certificateType: 'cima' as CertificateType,
    emailNotification: 'test@example.com',
    generatedBy: 'test-generator',
    channel: 'api' as ChannelType,
    certificateColor: 'cima-jaune' as CertificateColor,
    subscriberName: 'John Doe',
    subscriberPhone: '+1234567890',
    subscriberEmail: 'subscriber@example.com',
    subscriberPoBox: 'PO Box 123',
    insuredName: 'Jane Doe',
    insuredPhone: '+1234567891',
    insuredEmail: 'insured@example.com',
    insuredPoBox: 'PO Box 456',
    vehicleRegistrationNumber: 'ABC123',
    vehicleChassisNumber: 'VIN123456789',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Camry',
    vehicleType: 'TV01' as VehicleType,
    vehicleCategory: '01' as VehicleCategory,
    vehicleUsage: 'UV01' as VehicleUsage,
    vehicleGenre: 'GV01' as VehicleGenre,
    vehicleEnergy: 'SEDI' as VehicleEnergy,
    vehicleSeats: 5,
    vehicleFiscalPower: 8,
    vehicleUsefulLoad: 500,
    fleetReduction: 0,
    subscriberType: 'ST01' as SubscriberType,
    premiumRC: 150000,
    policyEffectiveDate: new Date('2023-01-01'),
    policyExpiryDate: new Date('2023-12-31'),
    rNum: 1,
    opATD: 'OP123',
    ...overrides
});

export const createMockOrassQueryResult = (overrides: Partial<any> = {}) => ({
    policies: [createMockOrassPolicy()],
    totalCount: 1,
    hasMore: false,
    ...overrides
});

export const createMockAsaciResponse = (overrides: Partial<any> = {}) => ({
    status: 201,
    data: {
        reference: 'CERT-12345',
        id: TEST_DATA.VALID_UUID,
        download_link: 'https://example.com/cert.pdf',
        certificates: [
            {
                download_link: 'https://example.com/cert-detailed.pdf'
            }
        ]
    },
    ...overrides
});

export const createMockAsaciProductionResponse = (overrides: Partial<any> = {}) => ({
    id: TEST_DATA.VALID_UUID,
    reference: 'CERT-12345',
    status: 'COMPLETED',
    download_link: 'https://example.com/cert.pdf',
    user: {
        username: 'test-generator'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
});

export const createMockStatistics = (overrides: Partial<any> = {}) => ({
    totalRequests: 150,
    completedRequests: 120,
    failedRequests: 20,
    pendingRequests: 10,
    totalDownloads: 95,
    averageProcessingTime: 45,
    requestsByType: {
        cima: 80,
        pooltpv: 40,
        matca: 20,
        pooltpvbleu: 10
    },
    requestsByStatus: {
        COMPLETED: 120,
        FAILED: 20,
        PENDING: 10
    },
    ...overrides
});

export const createValidSearchOrassPoliciesDto = (overrides: Partial<any> = {}) => ({
    policyNumber: 'POL123456',
    applicantCode: 'APP123',
    endorsementNumber: 'END789',
    organizationCode: 'ORG001',
    officeCode: 'OFF001',
    limit: 100,
    offset: 0,
    ...overrides
});

export const createValidCreateEditionFromOrassDataRequest = (overrides: Partial<any> = {}) => ({
    policyNumber: 'POL123456',
    organizationCode: 'ORG001',
    officeCode: 'OFF001',
    certificateType: 'cima' as CertificateType,
    emailNotification: 'test@example.com',
    generatedBy: 'test-generator',
    channel: 'api' as ChannelType,
    certificateColor: 'cima-jaune' as CertificateColor,
    subscriberName: 'John Doe',
    subscriberPhone: '+1234567890',
    subscriberEmail: 'subscriber@example.com',
    subscriberPoBox: 'PO Box 123',
    insuredName: 'Jane Doe',
    insuredPhone: '+1234567891',
    insuredEmail: 'insured@example.com',
    insuredPoBox: 'PO Box 456',
    vehicleRegistrationNumber: 'ABC123',
    vehicleChassisNumber: 'VIN123456789',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Camry',
    vehicleType: 'TV01' as VehicleType,
    vehicleCategory: '01' as VehicleCategory,
    vehicleUsage: 'UV01' as VehicleUsage,
    vehicleGenre: 'GV01' as VehicleGenre,
    vehicleEnergy: 'SEDI' as VehicleEnergy,
    vehicleSeats: 5,
    vehicleFiscalPower: 8,
    vehicleUsefulLoad: 500,
    fleetReduction: 0,
    subscriberType: 'ST01' as SubscriberType,
    premiumRC: 150000,
    policyEffectiveDate: '2023-01-01',
    policyExpiryDate: '2023-12-31',
    rNum: 1,
    opATD: 'OP123',
    isValidDateRange: true,
    toAsaciProductionRequest: jest.fn().mockReturnValue({
        office_code: 'OFF001',
        organization_code: 'ORG001',
        certificate_type: 'cima',
        email_notification: 'test@example.com',
        generated_by: 'test-generator',
        channel: 'api',
        productions: [
            {
                COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
                PRIME_RC: 150000,
                ENERGIE_DU_VEHICULE: 'GASOLINE',
                NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789',
                MODELE_DU_VEHICULE: 'Camry',
                GENRE_DU_VEHICULE: 'AUTOMOBILE',
                CATEGORIE_DU_VEHICULE: 'PASSENGER',
                USAGE_DU_VEHICULE: 'PERSONAL',
                MARQUE_DU_VEHICULE: 'Toyota',
                TYPE_DU_VEHICULE: 'SEDAN',
                NOMBRE_DE_PLACE_DU_VEHICULE: 5,
                TYPE_DE_SOUSCRIPTEUR: 'INDIVIDUAL',
                NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: '+1234567890',
                BOITE_POSTALE_DU_SOUSCRIPTEUR: 'PO Box 123',
                ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
                NOM_DU_SOUSCRIPTEUR: 'John Doe',
                TELEPHONE_MOBILE_DE_L_ASSURE: '+1234567891',
                BOITE_POSTALE_DE_L_ASSURE: 'PO Box 456',
                ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
                NOM_DE_L_ASSURE: 'Jane Doe',
                IMMATRICULATION_DU_VEHICULE: 'ABC123',
                NUMERO_DE_POLICE: 'POL123456',
                DATE_D_EFFET_DU_CONTRAT: '2023-01-01',
                DATE_D_ECHEANCE_DU_CONTRAT: '2023-12-31',
                OP_ATD: 'OP123',
                PUISSANCE_FISCALE: 8,
                CHARGE_UTILE: 500,
                REDUCTION_FLOTTE: 0
            }
        ]
    }),
    ...overrides
});

export const createMockBatchDownloadResult = (overrides: Partial<any> = {}) => ({
    success: true,
    summary: {
        total: 3,
        successful: 2,
        failed: 1
    },
    results: [
        {
            certificateReference: 'CERT-001',
            downloadLink: 'https://example.com/cert-001.pdf',
            success: true
        },
        {
            certificateReference: 'CERT-002',
            downloadLink: 'https://example.com/cert-002.pdf',
            success: true
        }
    ],
    errors: [
        {
            certificateReference: 'CERT-003',
            error: 'Certificate not found',
            success: false
        }
    ],
    message: 'Batch operation completed. 2 successful, 1 failed.',
    ...overrides
});

export const createMockDownloadResult = (overrides: Partial<any> = {}) => ({
    success: true,
    certificateUrl: 'https://example.com/cert.pdf',
    downloadCount: 6,
    message: 'Certificate download initiated',
    ...overrides
});

export const createMockDownloadLinkResult = (overrides: Partial<any> = {}) => ({
    success: true,
    source: 'database',
    certificateReference: 'CERT-12345',
    downloadLink: 'https://example.com/cert.pdf',
    downloadCount: 5,
    asaciRequestId: TEST_DATA.VALID_UUID,
    message: 'Certificate download link retrieved from database',
    ...overrides
});

export const createMockOrassStatistics = (overrides: Partial<any> = {}) => ({
    totalPolicies: 15000,
    lastUpdated: new Date().toISOString(),
    ...overrides
});

export const createMockAsaciEditionRequest = (overrides: Partial<any> = {}) => ({
    success: true,
    asaciRequestId: TEST_DATA.VALID_UUID,
    productionData: {
        office_code: 'OFF001',
        organization_code: 'ORG001',
        certificate_type: 'cima'
    },
    asaciResult: createMockAsaciResponse(),
    message: 'Certificate production created successfully',
    ...overrides
});

export const createMockAsaciProductionRequest = (overrides: Partial<any> = {}) => ({
    office_code: 'OFF001',
    organization_code: 'ORG001',
    certificate_type: 'cima',
    email_notification: 'test@example.com',
    generated_by: 'test-generator',
    channel: 'api',
    productions: [
        {
            COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
            PRIME_RC: 150000,
            ENERGIE_DU_VEHICULE: 'GASOLINE',
            NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789',
            MODELE_DU_VEHICULE: 'Camry',
            GENRE_DU_VEHICULE: 'AUTOMOBILE',
            CATEGORIE_DU_VEHICULE: 'PASSENGER',
            USAGE_DU_VEHICULE: 'PERSONAL',
            MARQUE_DU_VEHICULE: 'Toyota',
            TYPE_DU_VEHICULE: 'SEDAN',
            NOMBRE_DE_PLACE_DU_VEHICULE: 5,
            TYPE_DE_SOUSCRIPTEUR: 'INDIVIDUAL',
            NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: '+1234567890',
            BOITE_POSTALE_DU_SOUSCRIPTEUR: 'PO Box 123',
            ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
            NOM_DU_SOUSCRIPTEUR: 'John Doe',
            TELEPHONE_MOBILE_DE_L_ASSURE: '+1234567891',
            BOITE_POSTALE_DE_L_ASSURE: 'PO Box 456',
            ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
            NOM_DE_L_ASSURE: 'Jane Doe',
            IMMATRICULATION_DU_VEHICULE: 'ABC123',
            NUMERO_DE_POLICE: 'POL123456',
            DATE_D_EFFET_DU_CONTRAT: '2023-01-01',
            DATE_D_ECHEANCE_DU_CONTRAT: '2023-12-31',
            OP_ATD: 'OP123',
            PUISSANCE_FISCALE: 8,
            CHARGE_UTILE: 500,
            REDUCTION_FLOTTE: 0
        }
    ],
    ...overrides
});

// Mock service instances
export const createMockCertifyLinkService = () => ({
    searchOrassPolicies: jest.fn(),
    createEditionRequest: jest.fn(),
    getEditionRequestFromAsaci: jest.fn(),
    getStoredAsaciRequests: jest.fn(),
    getAsaciRequestById: jest.fn(),
    downloadCertificate: jest.fn(),
    getEditionRequestDownloadLink: jest.fn(),
    getBatchCertificateDownloadLinks: jest.fn(),
    getUserStatistics: jest.fn(),
    getOrassStatistics: jest.fn()
});

export const createMockOrassService = () => ({
    searchPolicies: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getConnectionStatus: jest.fn(),
    healthCheck: jest.fn()
} as unknown as jest.Mocked<OrassService>);

export const createMockAsaciProductionService = () => ({
    createProductionRequest: jest.fn(),
    getProductionRequests: jest.fn(),
    getProductionRequest: jest.fn(),
    updateProductionRequest: jest.fn(),
    deleteProductionRequest: jest.fn(),
    healthCheck: jest.fn()
}as unknown as jest.Mocked<AsaciProductionService>);

// Additional validation helpers for CertifyLink
export const createValidBatchDownloadDto = (overrides: Partial<any> = {}) => ({
    certificateReferences: ['CERT-001', 'CERT-002', 'CERT-003'],
    ...overrides
});

export const createValidDownloadLinkDto = (overrides: Partial<any> = {}) => ({
    certificateReference: 'CERT-12345',
    ...overrides
});

export const createValidGetStoredRequestsDto = (overrides: Partial<any> = {}) => ({
    status: 'COMPLETED',
    certificateType: 'cima',
    limit: 50,
    offset: 0,
    ...overrides
});

// Mock database models
export const createMockAsaciRequestModel = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    getStatsByUser: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sequelize: {
        transaction: jest.fn(),
        authenticate: jest.fn(),
        close: jest.fn()
    }
});

export const createMockOperationLogModel = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    logOrassOperation: jest.fn(),
    logAsaciOperation: jest.fn(),
    getOperationStats: jest.fn()
});

// Error factories for CertifyLink
export const createOrassServiceError = (message: string = 'ORASS service error') => {
    const error = new Error(message);
    error.name = 'OrassServiceError';
    return error;
};

export const createAsaciServiceError = (message: string = 'ASACI service error') => {
    const error = new Error(message);
    error.name = 'AsaciServiceError';
    return error;
};

export const createDatabaseError = (message: string = 'Database error') => {
    const error = new Error(message);
    error.name = 'DatabaseError';
    return error;
};

// Test data constants for CertifyLink
export const CERTIFY_LINK_TEST_DATA = {
    VALID_POLICY_NUMBER: 'POL123456789',
    VALID_APPLICANT_CODE: 'APP123',
    VALID_ENDORSEMENT_NUMBER: 'END789',
    VALID_ORGANIZATION_CODE: 'ORG001',
    VALID_OFFICE_CODE: 'OFF001',
    VALID_CERTIFICATE_REFERENCE: 'CERT-12345',
    VALID_CERTIFICATE_TYPE: 'cima',
    VALID_CERTIFICATE_COLOR: 'GREEN',
    VALID_VEHICLE_REGISTRATION: 'ABC123',
    VALID_VEHICLE_CHASSIS: 'VIN123456789',
    VALID_DOWNLOAD_URL: 'https://example.com/cert.pdf',
    VALID_PREMIUM_RC: 150000,
    VALID_FISCAL_POWER: 8,
    VALID_USEFUL_LOAD: 500,
    VALID_FLEET_REDUCTION: 0
};

// Performance test helpers for CertifyLink
export const createLargeOrassQueryResult = (count: number = 1000) => ({
    policies: Array(count).fill(null).map(() => createMockOrassPolicy()),
    totalCount: count * 5, // Simulate larger dataset
    hasMore: true
});

export const createLargeAsaciRequestArray = (count: number = 100) =>
    Array(count).fill(null).map(() => createMockAsaciRequest());

export const createLargeBatchDownloadRequest = (count: number = 50) => ({
    certificateReferences: Array(count).fill(null).map((_, i) => `CERT-${String(i).padStart(3, '0')}`)
});

// Assertion helpers for CertifyLink
export const expectOrassServiceCall = (mockService: any, method: string, ...args: any[]) => {
    expect(mockService[method]).toHaveBeenCalledWith(...args);
};

export const expectAsaciServiceCall = (mockService: any, method: string, ...args: any[]) => {
    expect(mockService[method]).toHaveBeenCalledWith(...args);
};

export const expectDatabaseCall = (mockModel: any, method: string, ...args: any[]) => {
    expect(mockModel[method]).toHaveBeenCalledWith(...args);
};

export const expectOperationLog = (mockLogger: any, operation: string, status: string) => {
    expect(mockLogger.logAsaciOperation || mockLogger.logOrassOperation).toHaveBeenCalledWith(
        expect.any(String), // userId
        expect.any(String), // requestId
        operation,
        status,
        expect.any(String), // method
        expect.any(String), // endpoint
        expect.any(Number), // executionTime
        expect.any(Object), // request
        expect.any(Object), // response
        expect.any(Number)  // statusCode
    );
};

// Mock configuration helpers
export const setupCertifyLinkTestEnvironment = () => {
    setupTestEnvironment();
    process.env.ASACI_GENERATED_BY = 'test-generator';
    process.env.ORASS_USERNAME = 'test-orass-user';
    process.env.ORASS_PASSWORD = 'test-orass-password';
    process.env.ASACI_BASE_URL = 'https://api.asaci.test';
    process.env.ASACI_API_KEY = 'test-api-key';
};

export const cleanupCertifyLinkTestEnvironment = () => {
    cleanupTestEnvironment();
    delete process.env.ASACI_GENERATED_BY;
    delete process.env.ORASS_USERNAME;
    delete process.env.ORASS_PASSWORD;
    delete process.env.ASACI_BASE_URL;
    delete process.env.ASACI_API_KEY;
};

// Mock middleware for CertifyLink routes
export const createMockCertifyLinkMiddleware = () => ({
    validateDto: jest.fn((dto) => (req: any, res: any, next: any) => {
        // Simple validation mock
        if (req.body && typeof req.body === 'object') {
            next();
        } else {
            res.status(400).json({ error: 'Invalid request body' });
        }
    }),
    asyncHandlerMiddleware: jest.fn((handler) => handler),
    authMiddleware: jest.fn((req: any, res: any, next: any) => {
        if (req.user) {
            next();
        } else {
            res.status(401).json({ error: 'Authentication required' });
        }
    }),
    requirePermissions: jest.fn((permissions) => (req: any, res: any, next: any) => {
        // Mock permission check
        next();
    })
});

// Test scenario builders
export const createSuccessfulSearchScenario = () => ({
    request: createValidSearchOrassPoliciesDto(),
    response: createMockOrassQueryResult({
        policies: [
            createMockOrassPolicy({ policyNumber: 'POL001' }),
            createMockOrassPolicy({ policyNumber: 'POL002' })
        ],
        totalCount: 2,
        hasMore: false
    })
});

export const createSuccessfulEditionRequestScenario = () => ({
    request: createValidCreateEditionFromOrassDataRequest(),
    response: createMockAsaciEditionRequest()
});

export const createSuccessfulBatchDownloadScenario = () => ({
    request: createValidBatchDownloadDto(),
    response: createMockBatchDownloadResult()
});

export const createFailedServiceScenario = (serviceName: string, errorMessage: string) => ({
    error: serviceName === 'orass'
        ? createOrassServiceError(errorMessage)
        : createAsaciServiceError(errorMessage)
});

// Integration test helpers
export const createMockIntegrationEnvironment = () => ({
    orass: createMockOrassService(),
    asaci: createMockAsaciProductionService(),
    database: {
        asaciRequest: createMockAsaciRequestModel(),
        operationLog: createMockOperationLogModel()
    }
});

// Test utilities for async operations
export const waitForAsyncOperation = (ms: number = 100) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const createTimeoutPromise = (ms: number) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), ms));

// Mock response builders for different scenarios
export const createMockPaginatedResponse = (data: any[], page: number = 1, limit: number = 10) => ({
    data: data.slice((page - 1) * limit, page * limit),
    pagination: {
        total: data.length,
        limit,
        offset: (page - 1) * limit,
        hasMore: page * limit < data.length
    }
});

export const createMockErrorResponse = (status: number, message: string, details?: any) => ({
    status,
    message,
    error: details || message,
    timestamp: new Date().toISOString()
});

/**
 * Mock JWT implementation
 */
export const createMockJWT = () => ({
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn().mockReturnValue({ userId: TEST_DATA.VALID_UUID, type: 'access' }),
    decode: jest.fn().mockReturnValue({ userId: TEST_DATA.VALID_UUID })
});

/**
 * Mock Speakeasy implementation
 */
export const createMockSpeakeasy = () => ({
    generateSecret: jest.fn().mockReturnValue({
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/TestApp%20%28test%40example.com%29?secret=JBSWY3DPEHPK3PXP&issuer=TestApp'
    }),
    totp: {
        verify: jest.fn().mockReturnValue(true)
    }
});

/**
 * Mock QRCode implementation
 */
export const createMockQRCode = () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr')
});

/**
 * Database operation mocks
 */
export const createMockSequelizeModel = <T>(data: T): T & any => ({
    ...data,
    _attributes: {},
    dataValues: { ...data },
    _creationAttributes: {},
    isNewRecord: false,
    get: jest.fn((key: string) => (data as any)[key]),
    set: jest.fn(),
    save: jest.fn().mockResolvedValue(data),
    destroy: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(data),
    reload: jest.fn().mockResolvedValue(data),
    toJSON: jest.fn().mockReturnValue(data),
    previous: jest.fn(),
    changed: jest.fn(),
    setDataValue: jest.fn(),
    getDataValue: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn()
});

/**
 * Error assertion helpers
 */
export const expectValidationError = (error: any, message?: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationException');
    if (message) {
        expect(error.message).toContain(message);
    }
};

export const expectBaseError = (error: any, statusCode?: number, message?: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BaseException');
    if (statusCode) {
        expect(error.statusCode).toBe(statusCode);
    }
    if (message) {
        expect(error.message).toContain(message);
    }
};

/**
 * Async test helper
 */
export const runAsyncTest = async (testFn: () => Promise<void>) => {
    try {
        await testFn();
    } catch (error) {
        throw error;
    }
};

/**
 * Mock service response helper
 */
export const createServiceResponse = <T>(data: T, success: boolean = true) => ({
    success,
    data,
    message: success ? 'Operation successful' : 'Operation failed',
    timestamp: new Date().toISOString()
});

/**
 * Date helpers for testing
 */
export const createTestDate = (daysFromNow: number = 0): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
};

export const createExpiredDate = (): Date => createTestDate(-1);
export const createFutureDate = (): Date => createTestDate(1);

/**
 * Validation helpers
 */
export const createValidLoginDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    password: TEST_DATA.VALID_PASSWORD,
    rememberMe: false,
    ...overrides
});

export const createValidRegisterDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    firstName: 'John',
    lastName: 'Doe',
    password: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    phoneNumber: TEST_DATA.VALID_PHONE,
    ...overrides
});

export const createValidChangePasswordDto = (overrides: Partial<any> = {}) => ({
    currentPassword: 'oldPassword',
    newPassword: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    ...overrides
});

/**
 * Test timeout helper
 */
export const setTestTimeout = (ms: number = 10000) => {
    jest.setTimeout(ms);
};

/**
 * Spy helper for console methods
 */
export const spyOnConsole = () => ({
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation()
});

/**
 * Restore all mocks helper
 */
export const restoreAllMocks = () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
};

// ORASS specific test factories
export const createMockOrassConfig = (overrides: Partial<any> = {}) => ({
    host: 'localhost',
    port: 1521,
    sid: 'ORASS',
    username: 'orass_user',
    ...overrides
});

export const createMockOrassConnectionStatus = (overrides: Partial<any> = {}) => ({
    connected: true,
    lastChecked: new Date(),
    error: undefined,
    connectionInfo: {
        host: 'localhost',
        port: 1521,
        sid: 'ORASS',
        username: 'orass_user'
    },
    ...overrides
});

// In test-utils.ts

export const createMockOracleConnection = (overrides: Partial<oracledb.Connection> = {}): oracledb.Connection => ({
    execute: jest.fn().mockResolvedValue({ rows: [] }),
    close: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    break: jest.fn().mockResolvedValue(undefined),
    changePassword: jest.fn().mockResolvedValue(undefined),
    getDbObjectClass: jest.fn(),
    getQueue: jest.fn(),
    getSodaDatabase: jest.fn(),
    getStatementInfo: jest.fn(),
    ping: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    ...overrides
} as unknown as oracledb.Connection);

export const createMockOraclePool = (overrides: Partial<oracledb.Pool> = {}): oracledb.Pool => ({
    getConnection: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    terminate: jest.fn().mockResolvedValue(undefined),
    connectionsInUse: 0,
    connectionsOpen: 2,
    poolAlias: 'default',
    poolMax: 10,
    poolMin: 2,
    poolIncrement: 1,
    poolTimeout: 300,
    poolPingInterval: 60,
    stmtCacheSize: 30,
    ...overrides
} as unknown as oracledb.Pool);

export const createMockOracleQueryResult = (overrides: Partial<any> = {}) => ({
    rows: [
        {
            NUMERO_DE_POLICE: 'POL123456',
            OFFICE_CODE: 'OFF001',
            ORGANIZATION_CODE: 'ORG001',
            CERTIFICATE_TYPE: 'cima',
            EMAIL_NOTIFICATION: 'test@example.com',
            GENERATED_BY: 'test-generator',
            CHANNEL: 'api',
            COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
            PRIME_RC: 150000,
            ENERGIE_DU_VEHICULE: 'GASOLINE',
            NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789',
            MODELE_DU_VEHICULE: 'Camry',
            GENRE_DU_VEHICULE: 'AUTOMOBILE',
            CATEGORIE_DU_VEHICULE: 'PASSENGER',
            USAGE_DU_VEHICULE: 'PERSONAL',
            MARQUE_DU_VEHICULE: 'Toyota',
            TYPE_DU_VEHICULE: 'SEDAN',
            NOMBRE_DE_PLACE_DU_VEHICULE: 5,
            TYPE_DE_SOUSCRIPTEUR: 'INDIVIDUAL',
            NUMERO_DE_TELEPHONE_DU_SOUS: '+1234567890',
            BOITE_POSTALE_DU_SOUSCRIPTEUR: 'PO Box 123',
            ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
            NOM_DU_SOUSCRIPTEUR: 'John Doe',
            TELEPHONE_MOBILE_DE_L_ASSURE: '+1234567891',
            BOITE_POSTALE_DE_L_ASSURE: 'PO Box 456',
            NOM_DE_L_ASSURE: 'Jane Doe',
            ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
            IMMATRICULATION_DU_VEHICULE: 'ABC123',
            DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01'),
            DATE_D_ECHEANCE_DU_CONTRAT: new Date('2023-12-31'),
            PUISSANCE_FISCALE: 8,
            CHARGE_UTILE: 500,
            REDUCTION_FLOTTE: 0,
            RNUM: 1,
            OP_ATD: 'OP123'
        }
    ],
    metaData: [],
    resultSet: undefined,
    orassRow: {
        NUMERO_DE_POLICE: 'POL123456',
        OFFICE_CODE: 'OFF001',
        ORGANIZATION_CODE: 'ORG001',
        CERTIFICATE_TYPE: 'cima',
        EMAIL_NOTIFICATION: 'test@example.com',
        GENERATED_BY: 'test-generator',
        CHANNEL: 'api',
        COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
        PRIME_RC: 150000,
        ENERGIE_DU_VEHICULE: 'GASOLINE',
        NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789',
        MODELE_DU_VEHICULE: 'Camry',
        GENRE_DU_VEHICULE: 'AUTOMOBILE',
        CATEGORIE_DU_VEHICULE: 'PASSENGER',
        USAGE_DU_VEHICULE: 'PERSONAL',
        MARQUE_DU_VEHICULE: 'Toyota',
        TYPE_DU_VEHICULE: 'SEDAN',
        NOMBRE_DE_PLACE_DU_VEHICULE: 5,
        TYPE_DE_SOUSCRIPTEUR: 'INDIVIDUAL',
        NUMERO_DE_TELEPHONE_DU_SOUS: '+1234567890',
        BOITE_POSTALE_DU_SOUSCRIPTEUR: 'PO Box 123',
        ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
        NOM_DU_SOUSCRIPTEUR: 'John Doe',
        TELEPHONE_MOBILE_DE_L_ASSURE: '+1234567891',
        BOITE_POSTALE_DE_L_ASSURE: 'PO Box 456',
        NOM_DE_L_ASSURE: 'Jane Doe',
        ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
        IMMATRICULATION_DU_VEHICULE: 'ABC123',
        DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01'),
        DATE_D_ECHEANCE_DU_CONTRAT: new Date('2023-12-31'),
        PUISSANCE_FISCALE: 8,
        CHARGE_UTILE: 500,
        REDUCTION_FLOTTE: 0,
        RNUM: 1,
        OP_ATD: 'OP123'
    },
    ...overrides
});

export const createValidOrassPolicySearchCriteria = (overrides: Partial<any> = {}) => ({
    policyNumber: CERTIFY_LINK_TEST_DATA.VALID_POLICY_NUMBER,
    applicantCode: CERTIFY_LINK_TEST_DATA.VALID_APPLICANT_CODE,
    endorsementNumber: CERTIFY_LINK_TEST_DATA.VALID_ENDORSEMENT_NUMBER,
    organizationCode: CERTIFY_LINK_TEST_DATA.VALID_ORGANIZATION_CODE,
    officeCode: CERTIFY_LINK_TEST_DATA.VALID_OFFICE_CODE,
    ...overrides
});

// Mock Oracle database errors
export const createOracleConnectionError = (message: string = 'ORA-12154: TNS:could not resolve the connect identifier') => {
    const error = new Error(message);
    error.name = 'OracleError';
    (error as any).code = 'ORA-12154';
    return error;
};

export const createOracleAuthenticationError = (message: string = 'ORA-01017: invalid username/password; logon denied') => {
    const error = new Error(message);
    error.name = 'OracleError';
    (error as any).code = 'ORA-01017';
    return error;
};

export const createOracleQueryError = (message: string = 'ORA-00942: table or view does not exist') => {
    const error = new Error(message);
    error.name = 'OracleError';
    (error as any).code = 'ORA-00942';
    return error;
};

export const createOracleTimeoutError = (message: string = 'ORA-01013: user requested cancel of current operation') => {
    const error = new Error(message);
    error.name = 'OracleError';
    (error as any).code = 'ORA-01013';
    return error;
};

export const createOraclePoolExhaustionError = (message: string = 'ORA-12520: TNS:listener could not find available handler') => {
    const error = new Error(message);
    error.name = 'OracleError';
    (error as any).code = 'ORA-12520';
    return error;
};

// ORASS health check mocks
export const createMockOrassHealthCheck = (overrides: Partial<any> = {}) => ({
    connection: 'ACTIVE',
    status: 'HEALTHY',
    details: createMockOrassConnectionStatus(),
    timestamp: new Date().toISOString(),
    ...overrides
});

// Large dataset test helpers for ORASS
export const createLargeOrassDataset = (count: number = 1000) => ({
    rows: Array(count).fill(null).map((_, index) => ({
        ...createMockOracleQueryResult().orassRow,
        NUMERO_DE_POLICE: `POL${String(index).padStart(6, '0')}`,
        RNUM: index + 1
    }))
});

// ORASS environment setup
export const setupOrassTestEnvironment = () => {
    setupTestEnvironment();
    process.env.ORASS_USERNAME = 'test_orass_user';
    process.env.ORASS_PASSWORD = 'test_orass_password';
    process.env.ORASS_HOST = 'localhost';
    process.env.ORASS_PORT = '1521';
    process.env.ORASS_SID = 'ORASS';
};

export const cleanupOrassTestEnvironment = () => {
    cleanupTestEnvironment();
    delete process.env.ORASS_USERNAME;
    delete process.env.ORASS_PASSWORD;
    delete process.env.ORASS_HOST;
    delete process.env.ORASS_PORT;
    delete process.env.ORASS_SID;
};

// ORASS query builders for testing
export const createMockOrassQuery = (tableName: string = 'act_detail_att_digitale') => ({
    select: `SELECT * FROM ${tableName}`,
    count: `SELECT COUNT(*) as TOTAL_COUNT FROM ${tableName}`,
    where: 'WHERE 1=1',
    orderBy: 'ORDER BY NUMERO_DE_POLICE DESC',
    pagination: 'WHERE ROWNUM <= :max_row AND rnum > :min_row'
});

export const createMockOrassBindParameters = (overrides: Partial<any> = {}) => ({
    numeropolice: 'APP123POL123456END789',
    max_row: 100,
    min_row: 0,
    ...overrides
});

// Oracle client configuration mocks
export const createMockOracleClientConfig = () => ({
    outFormat: 4001, // OUT_FORMAT_OBJECT
    autoCommit: true,
    initOracleClient: jest.fn(),
    createPool: jest.fn(),
    getConnection: jest.fn()
});

// ORASS performance test helpers
export const createOrassPerformanceTestData = (queryCount: number = 100, recordsPerQuery: number = 1000) => ({
    queries: Array(queryCount).fill(null).map((_, index) => ({
        criteria: createValidOrassPolicySearchCriteria({
            policyNumber: `POL${String(index).padStart(6, '0')}`
        }),
        expectedRecords: recordsPerQuery
    }))
});

// ORASS connection pool test helpers
export const createMockConnectionPoolStats = (overrides: Partial<any> = {}) => ({
    connectionsInUse: 2,
    connectionsOpen: 5,
    poolMax: 10,
    poolMin: 2,
    poolIncrement: 1,
    poolTimeout: 300,
    poolPingInterval: 60,
    stmtCacheSize: 30,
    ...overrides
});

// ORASS data type test helpers
export const createOrassDataTypeTestRow = () => ({
    // String types
    NUMERO_DE_POLICE: 'POL123456789',
    NOM_DU_SOUSCRIPTEUR: 'Jean-Baptiste De La Salle',
    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'jean.baptiste@example.com',

    // Number types
    PRIME_RC: 150000.50,
    NOMBRE_DE_PLACE_DU_VEHICULE: 5,
    PUISSANCE_FISCALE: 8.5,
    CHARGE_UTILE: 1500.75,
    REDUCTION_FLOTTE: 10.25,
    RNUM: 1,

    // Date types
    DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01T00:00:00.000Z'),
    DATE_D_ECHEANCE_DU_CONTRAT: new Date('2023-12-31T23:59:59.999Z'),

    // Nullable fields
    EMAIL_NOTIFICATION: null,
    GENERATED_BY: null,
    OP_ATD: null
});

// SQL injection test data
export const createSqlInjectionTestCriteria = () => ({
    maliciousPolicy: "'; DROP TABLE act_detail_att_digitale; --",
    maliciousApplicant: "APP123'; DELETE FROM users; --",
    maliciousEndorsement: "END789' OR '1'='1",
    specialCharsPolicy: "POL'123\"456",
    specialCharsApplicant: "APP;123",
    specialCharsEndorsement: "END%789"
});

// ORASS assertion helpers
export const expectOrassConnection = (mockPool: any, config: any) => {
    expect(mockPool.createPool || jest.fn()).toHaveBeenCalledWith({
        user: expect.any(String),
        password: expect.any(String),
        connectString: `${config.host}:${config.port}/${config.sid}`,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 300,
        poolPingInterval: 60,
        stmtCacheSize: 30
    });
};

export const expectOrassQuery = (mockConnection: any, tableName: string = 'act_detail_att_digitale') => {
    expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining(tableName),
        expect.any(Object)
    );
};

export const expectOrassQueryWithPagination = (mockConnection: any, limit: number, offset: number) => {
    expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('ROWNUM'),
        expect.objectContaining({
            max_row: offset + limit,
            min_row: offset
        })
    );
};

export const expectOrassConnectionClosed = (mockConnection: any) => {
    expect(mockConnection.close).toHaveBeenCalled();
};

// ORASS test scenario builders
export const createSuccessfulOrassSearchScenario = () => ({
    criteria: createValidOrassPolicySearchCriteria(),
    mockResponse: createMockOracleQueryResult(),
    expectedPolicies: 1,
    expectedTotalCount: 1
});

export const createEmptyOrassSearchScenario = () => ({
    criteria: createValidOrassPolicySearchCriteria(),
    mockResponse: { rows: [] },
    expectedPolicies: 0,
    expectedTotalCount: 0
});

export const createLargeOrassSearchScenario = (count: number = 1000) => ({
    criteria: createValidOrassPolicySearchCriteria(),
    mockResponse: createLargeOrassDataset(count),
    expectedPolicies: count,
    expectedTotalCount: count * 5 // Simulate larger total dataset
});

export const createOrassConnectionFailureScenario = () => ({
    error: createOracleConnectionError(),
    expectedErrorCode: 'DATABASE_CONNECTION_ERROR',
    expectedStatusCode: 503
});

export const createOrassQueryFailureScenario = () => ({
    error: createOracleQueryError(),
    expectedErrorCode: 'DATABASE_QUERY_ERROR',
    expectedStatusCode: 500
});

// ORASS integration test helpers
export const createMockOrassIntegrationEnvironment = () => ({
    config: createMockOrassConfig(),
    pool: createMockOraclePool(),
    connection: createMockOracleConnection(),
    queryResults: createMockOracleQueryResult()
});

// ORASS stress test helpers
export const createOrassStressTestData = () => ({
    concurrentConnections: 50,
    queriesPerConnection: 100,
    recordsPerQuery: 1000,
    totalExpectedQueries: 5000 // 50 * 100
});

// ORASS timeout test helpers
export const createTimeoutTestPromise = (delay: number = 5000) =>
    new Promise((_, reject) =>
        setTimeout(() => reject(createOracleTimeoutError()), delay)
    );

// ORASS memory test helpers
export const createMemoryTestDataset = (sizeInMB: number = 100) => {
    const recordSize = 1024; // Approximate size per record in bytes
    const recordCount = (sizeInMB * 1024 * 1024) / recordSize;

    return Array(recordCount).fill(null).map((_, index) => ({
        ...createMockOracleQueryResult().orassRow,
        NUMERO_DE_POLICE: `POL${String(index).padStart(10, '0')}`,
        // Add large text fields to increase memory usage
        LARGE_FIELD_1: 'A'.repeat(256),
        LARGE_FIELD_2: 'B'.repeat(256),
        LARGE_FIELD_3: 'C'.repeat(256)
    }));
};

// ORASS configuration validation helpers
export const createInvalidOrassConfig = () => ({
    host: '',
    port: -1,
    sid: null,
    username: undefined
});

export const createValidOrassConfig = () => ({
    host: 'localhost',
    port: 1521,
    sid: 'ORASS',
    username: 'orass_user'
});

// ORASS logging test helpers
export const createMockOrassLogger = () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn()
});

// ORASS security test helpers
export const createSqlInjectionTestData = () => [
    {
        name: 'SQL injection with DROP TABLE',
        criteria: {
            policyNumber: "'; DROP TABLE act_detail_att_digitale; --"
        },
        expectedBind: "undefined'; DROP TABLE act_detail_att_digitale; --undefined"
    },
    {
        name: 'SQL injection with UNION SELECT',
        criteria: {
            policyNumber: "' UNION SELECT * FROM users --"
        },
        expectedBind: "undefined' UNION SELECT * FROM users --undefined"
    },
    {
        name: 'SQL injection with OR condition',
        criteria: {
            policyNumber: "' OR '1'='1"
        },
        expectedBind: "undefined' OR '1'='1undefined"
    },
    {
        name: 'Special characters',
        criteria: {
            policyNumber: "POL'123\"456",
            applicantCode: "APP;123",
            endorsementNumber: "END%789"
        },
        expectedBind: "APP;123POL'123\"456END%789"
    }
];

// ORASS performance benchmarks
export const ORASS_PERFORMANCE_BENCHMARKS = {
    CONNECTION_TIME_MS: 5000,
    QUERY_TIME_MS: 30000,
    LARGE_QUERY_TIME_MS: 60000,
    MEMORY_USAGE_MB: 500,
    MAX_CONCURRENT_CONNECTIONS: 20
};

// ORASS test utilities for data validation
export const validateOrassPolicy = (policy: any) => {
    expect(policy).toHaveProperty('policyNumber');
    expect(policy).toHaveProperty('organizationCode');
    expect(policy).toHaveProperty('officeCode');
    expect(policy).toHaveProperty('certificateType');
    expect(policy).toHaveProperty('subscriberName');
    expect(policy).toHaveProperty('insuredName');
    expect(policy).toHaveProperty('vehicleBrand');
    expect(policy).toHaveProperty('vehicleModel');
    expect(policy).toHaveProperty('premiumRC');
    expect(policy).toHaveProperty('policyEffectiveDate');
    expect(policy).toHaveProperty('policyExpiryDate');

    // Type validations
    expect(typeof policy.policyNumber).toBe('string');
    expect(typeof policy.premiumRC).toBe('number');
    expect(policy.policyEffectiveDate).toBeInstanceOf(Date);
    expect(policy.policyExpiryDate).toBeInstanceOf(Date);
};

export const validateOrassQueryResult = (result: any) => {
    expect(result).toHaveProperty('policies');
    expect(result).toHaveProperty('totalCount');
    expect(result).toHaveProperty('hasMore');

    expect(Array.isArray(result.policies)).toBe(true);
    expect(typeof result.totalCount).toBe('number');
    expect(typeof result.hasMore).toBe('boolean');

    result.policies.forEach((policy: any) => validateOrassPolicy(policy));
};

export const validateOrassConnectionStatus = (status: any) => {
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('lastChecked');
    expect(status).toHaveProperty('connectionInfo');

    expect(typeof status.connected).toBe('boolean');
    expect(status.lastChecked).toBeInstanceOf(Date);
    expect(status.connectionInfo).toHaveProperty('host');
    expect(status.connectionInfo).toHaveProperty('port');
    expect(status.connectionInfo).toHaveProperty('sid');
    expect(status.connectionInfo).toHaveProperty('username');
};

// ORASS mock factory with realistic data
export const createRealisticOrassPolicy = (overrides: Partial<any> = {}) => ({
    policyNumber: `CI${Date.now()}`,
    organizationCode: 'NSIA',
    officeCode: 'ABJ001',
    certificateType: 'cima',
    emailNotification: 'notification@nsia.ci',
    generatedBy: 'ORASS_SYSTEM',
    channel: 'api',
    certificateColor: 'GREEN',
    subscriberName: 'KOUASSI JEAN BAPTISTE',
    subscriberPhone: '+22507123456',
    subscriberEmail: 'kouassi.jean@email.ci',
    subscriberPoBox: 'BP 1234 ABIDJAN 01',
    insuredName: 'KOUASSI JEAN BAPTISTE',
    insuredPhone: '+22507123456',
    insuredEmail: 'kouassi.jean@email.ci',
    insuredPoBox: 'BP 1234 ABIDJAN 01',
    vehicleRegistrationNumber: '0123 AB 01',
    vehicleChassisNumber: 'WVWZZZ1JZ3W386752',
    vehicleBrand: 'TOYOTA',
    vehicleModel: 'CAMRY',
    vehicleType: 'SEDAN',
    vehicleCategory: 'PASSENGER',
    vehicleUsage: 'PERSONAL',
    vehicleGenre: 'AUTOMOBILE',
    vehicleEnergy: 'GASOLINE',
    vehicleSeats: 5,
    vehicleFiscalPower: 8,
    vehicleUsefulLoad: 0,
    fleetReduction: 0,
    subscriberType: 'INDIVIDUAL',
    premiumRC: 485000, // CFA Francs
    policyEffectiveDate: new Date('2024-01-01'),
    policyExpiryDate: new Date('2024-12-31'),
    rNum: 1,
    opATD: 'OP001',
    ...overrides
});

// ORASS test data generators
export const generateOrassTestSuite = () => ({
    validSearchCriteria: createValidOrassPolicySearchCriteria(),
    invalidSearchCriteria: { policyNumber: '', applicantCode: null },
    maliciousSearchCriteria: createSqlInjectionTestCriteria(),
    largeDataset: createLargeOrassDataset(5000),
    connectionConfig: createMockOrassConfig(),
    performanceBenchmarks: ORASS_PERFORMANCE_BENCHMARKS
});

// ORASS error simulation helpers
export const simulateOrassNetworkError = () => {
    const error = new Error('Network error: Connection refused');
    error.name = 'NetworkError';
    (error as any).code = 'ECONNREFUSED';
    return error;
};

export const simulateOrassTimeoutError = () => {
    const error = new Error('Query timeout: Operation exceeded time limit');
    error.name = 'TimeoutError';
    (error as any).code = 'ETIMEOUT';
    return error;
};

export const simulateOrassAuthError = () => {
    const error = new Error('Authentication failed: Invalid credentials');
    error.name = 'AuthenticationError';
    (error as any).code = 'ORA-01017';
    return error;
};

// ORASS load testing helpers
export const createOrassLoadTestScenario = (users: number, duration: number) => ({
    virtualUsers: users,
    testDurationMinutes: duration,
    queriesPerUser: Math.floor(duration * 10), // 10 queries per minute per user
    expectedTotalQueries: users * Math.floor(duration * 10),
    maxAcceptableResponseTime: 30000, // 30 seconds
    maxAcceptableErrorRate: 0.05 // 5%
});

// ORASS monitoring helpers
export const createOrassMetrics = () => ({
    connectionPoolStats: createMockConnectionPoolStats(),
    queryMetrics: {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        averageResponseTime: 0,
        slowQueries: 0 // queries > 10 seconds
    },
    errorMetrics: {
        connectionErrors: 0,
        timeoutErrors: 0,
        authenticationErrors: 0,
        queryErrors: 0
    }
});

// ORASS cleanup helpers
export const cleanupOrassTestResources = async (service: any) => {
    try {
        if (service && typeof service.disconnect === 'function') {
            await service.disconnect();
        }
    } catch (error) {
        // Ignore cleanup errors in tests
    }
};

// ORASS test environment validation
export const validateOrassTestEnvironment = () => {
    const requiredEnvVars = [
        'ORASS_USERNAME',
        'ORASS_PASSWORD',
        'ORASS_HOST',
        'ORASS_PORT',
        'ORASS_SID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return true;
};





