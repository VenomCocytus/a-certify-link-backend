import {CreateProductionRequestDto, ProductionDataDto} from '@dto/asaci.dto';
import {
    CertificateColor,
    CertificateType,
    ChannelType,
    SubscriberType,
    VehicleCategory,
    VehicleEnergy,
    VehicleGenre,
    VehicleType,
    VehicleUsage
} from '@interfaces/common.enum';
import {HttpClient} from '@utils/httpClient';
import {AsaciProductionService} from '@services/asaci-production.service';
import MockedObject = jest.MockedObject;

/**
 * Test utilities for AsaciProductionService
 */

// Mock data factories
export const createMockProductionData = (overrides: Partial<ProductionDataDto> = {}): ProductionDataDto => ({
    COULEUR_D_ATTESTATION_A_EDITER: CertificateColor.CIMA_JAUNE,
    PRIME_RC: 150000,
    ENERGIE_DU_VEHICULE: VehicleEnergy.GASOLINE,
    NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789ABCDEF',
    MODELE_DU_VEHICULE: 'CAMRY',
    GENRE_DU_VEHICULE: VehicleGenre.CAR,
    CATEGORIE_DU_VEHICULE: VehicleCategory.CATEGORY_1,
    USAGE_DU_VEHICULE: VehicleUsage.PERSONAL_BUSINESS,
    MARQUE_DU_VEHICULE: 'TOYOTA',
    TYPE_DU_VEHICULE: VehicleType.PERSONAL,
    NOMBRE_DE_PLACE_DU_VEHICULE: 5,
    TYPE_DE_SOUSCRIPTEUR: SubscriberType.PHYSICAL_PERSON,
    NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: '+22507123456',
    BOITE_POSTALE_DU_SOUSCRIPTEUR: 'BP 1234 ABIDJAN 01',
    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
    NOM_DU_SOUSCRIPTEUR: 'KOUASSI JEAN BAPTISTE',
    TELEPHONE_MOBILE_DE_L_ASSURE: '+22507654321',
    BOITE_POSTALE_DE_L_ASSURE: 'BP 5678 ABIDJAN 01',
    ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
    NOM_DE_L_ASSURE: 'KOUASSI MARIE CLAIRE',
    IMMATRICULATION_DU_VEHICULE: '0123 AB 01',
    NUMERO_DE_POLICE: 'CI2024001234567',
    DATE_D_EFFET_DU_CONTRAT: '2024-01-01',
    DATE_D_ECHEANCE_DU_CONTRAT: '2024-12-31',
    OP_ATD: 'OP001',
    PUISSANCE_FISCALE: 8,
    CHARGE_UTILE: 0,
    REDUCTION_FLOTTE: 0,
    ...overrides
});

export const createMockCreateProductionRequestDto = (overrides: Partial<CreateProductionRequestDto> = {}): CreateProductionRequestDto => ({
    office_code: 'ABJ001',
    organization_code: 'NSIA',
    certificate_type: CertificateType.CIMA,
    email_notification: 'notification@nsia.ci',
    generated_by: 'test-user',
    channel: ChannelType.API,
    productions: [createMockProductionData()],
    ...overrides
});

export const createMockProductionResponse = (overrides: Partial<any> = {}) => ({
    id: 'prod-123e4567-e89b-12d3-a456-426614174000',
    reference: 'PROD-2024-001234',
    status: 'COMPLETED',
    download_link: 'https://api.asaci.test/productions/download/PROD-2024-001234',
    user: {
        id: 'user-123',
        username: 'test-user',
        email: 'test@example.com'
    },
    office_code: 'ABJ001',
    organization_code: 'NSIA',
    certificate_type: 'cima',
    email_notification: 'notification@nsia.ci',
    generated_by: 'test-user',
    channel: 'api',
    productions_count: 1,
    created_at: '2024-01-15T10:30:00.000Z',
    updated_at: '2024-01-15T10:35:00.000Z',
    completed_at: '2024-01-15T10:35:00.000Z',
    ...overrides
});

export const createMockProductionListResponse = (overrides: Partial<any> = {}) => ({
    data: [
        createMockProductionResponse({ reference: 'PROD-2024-001234' }),
        createMockProductionResponse({ reference: 'PROD-2024-001235', status: 'PENDING' }),
        createMockProductionResponse({ reference: 'PROD-2024-001236', status: 'FAILED' })
    ],
    pagination: {
        total: 150,
        page: 1,
        limit: 10,
        total_pages: 15,
        has_next: true,
        has_previous: false
    },
    ...overrides
});

export const createMockDownloadResponse = (overrides: Partial<any> = {}) => ({
    download_url: 'https://api.asaci.test/productions/download/PROD-2024-001234',
    file_name: 'PROD-2024-001234.zip',
    file_size: 2048576, // 2MB
    expires_at: '2024-01-16T10:30:00.000Z',
    content_type: 'application/zip',
    ...overrides
});

export const createMockFetchProductionResponse = (overrides: Partial<any> = {}) => ({
    success: true,
    message: 'Production fetched successfully',
    data: {
        reference: 'PROD-2024-001234',
        status: 'COMPLETED',
        certificates: [
            {
                id: 'cert-001',
                policy_number: 'CI2024001234567',
                download_link: 'https://api.asaci.test/certificates/cert-001.pdf',
                status: 'GENERATED'
            }
        ]
    },
    ...overrides
});

// Mock HttpClient
export const createMockHttpClient = (): MockedObject<HttpClient> => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    setAuthToken: jest.fn(),
    setApiKey: jest.fn()
} as MockedObject<HttpClient>)

// Service factory
export const createAsaciProductionService = (baseUrl: string = 'https://api.asaci.test', authToken?: string): AsaciProductionService => {
    return new AsaciProductionService(baseUrl, authToken);
};

export const createMockAsaciProductionService = (): jest.Mocked<AsaciProductionService> => {
    return {
        setAuthToken: jest.fn(),
        createProductionRequest: jest.fn(),
        getProductionRequests: jest.fn(),
        downloadProductionZip: jest.fn(),
        fetchProduction: jest.fn()
    } as unknown as jest.Mocked<AsaciProductionService>;
};

// Error factories
export const createAsaciApiError = (status: number, message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'AsaciApiError';
    (error as any).response = {
        status,
        data: {
            error: message,
            details: details || {},
            timestamp: new Date().toISOString()
        }
    };
    return error;
};

export const createNetworkError = (message: string = 'Network Error') => {
    const error = new Error(message);
    error.name = 'NetworkError';
    (error as any).code = 'ECONNREFUSED';
    return error;
};

export const createTimeoutError = (message: string = 'Request Timeout') => {
    const error = new Error(message);
    error.name = 'TimeoutError';
    (error as any).code = 'ECONNABORTED';
    return error;
};

export const createValidationError = (field: string, message: string) => {
    const error = new Error(`Validation failed for field: ${field}`);
    error.name = 'ValidationError';
    (error as any).field = field;
    (error as any).details = { [field]: message };
    return error;
};

export const createAuthenticationError = (message: string = 'Authentication failed') => {
    const error = new Error(message);
    error.name = 'AuthenticationError';
    (error as any).response = {
        status: 401,
        data: {
            error: 'Unauthorized',
            message
        }
    };
    return error;
};

export const createRateLimitError = (message: string = 'Rate limit exceeded') => {
    const error = new Error(message);
    error.name = 'RateLimitError';
    (error as any).response = {
        status: 429,
        data: {
            error: 'Too Many Requests',
            message,
            retry_after: 60
        }
    };
    return error;
};

// Test data generators
export const generateLargeProductionRequest = (count: number = 100): CreateProductionRequestDto => ({
    office_code: 'ABJ001',
    organization_code: 'NSIA',
    certificate_type: CertificateType.CIMA,
    email_notification: 'notification@nsia.ci',
    generated_by: 'test-user',
    channel: ChannelType.API,
    productions: Array(count).fill(null).map((_, index) => 
        createMockProductionData({
            NUMERO_DE_POLICE: `CI2024${String(index + 1).padStart(9, '0')}`,
            NUMERO_DE_CHASSIS_DU_VEHICULE: `VIN${String(index + 1).padStart(14, '0')}`,
            IMMATRICULATION_DU_VEHICULE: `${String(index + 1).padStart(4, '0')} AB 01`
        })
    )
});

export const generateInvalidProductionData = (): Partial<ProductionDataDto> => ({
    COULEUR_D_ATTESTATION_A_EDITER: 'INVALID_COLOR' as any,
    PRIME_RC: -1000, // Invalid negative premium
    ENERGIE_DU_VEHICULE: 'INVALID_ENERGY' as any,
    NUMERO_DE_CHASSIS_DU_VEHICULE: '', // Empty chassis number
    MODELE_DU_VEHICULE: '', // Empty model
    NOMBRE_DE_PLACE_DU_VEHICULE: 0, // Invalid seat count
    NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: 'invalid-phone',
    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'invalid-email',
    NUMERO_DE_POLICE: '', // Empty policy number
    DATE_D_EFFET_DU_CONTRAT: 'invalid-date',
    DATE_D_ECHEANCE_DU_CONTRAT: 'invalid-date'
});

// Test scenarios
export const createSuccessfulProductionScenario = () => ({
    request: createMockCreateProductionRequestDto(),
    response: createMockProductionResponse(),
    expectedCalls: 1
});

export const createFailedProductionScenario = (errorType: 'validation' | 'network' | 'auth' | 'rateLimit' = 'validation') => {
    const request = createMockCreateProductionRequestDto();
    
    let error;
    switch (errorType) {
        case 'validation':
            error = createValidationError('productions', 'Invalid production data');
            break;
        case 'network':
            error = createNetworkError();
            break;
        case 'auth':
            error = createAuthenticationError();
            break;
        case 'rateLimit':
            error = createRateLimitError();
            break;
        default:
            error = createAsaciApiError(500, 'Internal Server Error');
    }

    return { request, error };
};

export const createPaginationScenario = (page: number = 1, limit: number = 10) => ({
    params: { page, limit },
    response: createMockProductionListResponse({
        pagination: {
            total: 150,
            page,
            limit,
            total_pages: Math.ceil(150 / limit),
            has_next: page < Math.ceil(150 / limit),
            has_previous: page > 1
        }
    })
});

// Assertion helpers
export const expectHttpClientCall = (mockHttpClient: jest.Mocked<HttpClient>, method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) => {
    if (data) {
        expect(mockHttpClient[method]).toHaveBeenCalledWith(url, data);
    } else {
        expect(mockHttpClient[method]).toHaveBeenCalledWith(url);
    }
};

export const expectAuthTokenSet = (mockHttpClient: jest.Mocked<HttpClient>, token: string) => {
    expect(mockHttpClient.setAuthToken).toHaveBeenCalledWith(token);
};

export const expectProductionResponse = (response: any, expectedReference?: string) => {
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('reference');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('download_link');
    expect(response).toHaveProperty('created_at');
    expect(response).toHaveProperty('updated_at');

    if (expectedReference) {
        expect(response.reference).toBe(expectedReference);
    }

    // Validate status is one of expected values
    expect(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).toContain(response.status);
};

export const expectProductionListResponse = (response: any, expectedCount?: number) => {
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('pagination');
    expect(Array.isArray(response.data)).toBe(true);

    if (expectedCount !== undefined) {
        expect(response.data).toHaveLength(expectedCount);
    }

    // Validate pagination structure
    expect(response.pagination).toHaveProperty('total');
    expect(response.pagination).toHaveProperty('page');
    expect(response.pagination).toHaveProperty('limit');
    expect(response.pagination).toHaveProperty('total_pages');
    expect(response.pagination).toHaveProperty('has_next');
    expect(response.pagination).toHaveProperty('has_previous');

    // Validate each production in the list
    response.data.forEach((production: any) => {
        expectProductionResponse(production);
    });
};

export const expectDownloadResponse = (response: any) => {
    expect(response).toHaveProperty('download_url');
    expect(response).toHaveProperty('file_name');
    expect(response).toHaveProperty('expires_at');
    expect(response).toHaveProperty('content_type');

    // Validate URL format
    expect(response.download_url).toMatch(/^https?:\/\/.+/);
    
    // Validate content type
    expect(['application/zip', 'application/pdf', 'application/octet-stream']).toContain(response.content_type);
};

export const expectFetchProductionResponse = (response: any) => {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');
    expect(response).toHaveProperty('data');
    expect(response.success).toBe(true);

    expect(response.data).toHaveProperty('reference');
    expect(response.data).toHaveProperty('status');
    expect(response.data).toHaveProperty('certificates');
    expect(Array.isArray(response.data.certificates)).toBe(true);
};

// Performance test helpers
export const measureExecutionTime = async (fn: () => Promise<any>): Promise<{ result: any; duration: number }> => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
};

export const expectExecutionTimeUnder = async (fn: () => Promise<any>, maxTime: number) => {
    const { duration } = await measureExecutionTime(fn);
    expect(duration).toBeLessThan(maxTime);
};

// Mock environment setup
export const setupAsaciTestEnvironment = () => {
    process.env.ASACI_BASE_URL = 'https://api.asaci.test';
    process.env.ASACI_API_KEY = 'test-api-key';
    process.env.ASACI_TIMEOUT = '30000';
    
    // Mock ASACI endpoints
    process.env.ASACI_PRODUCTIONS = '/productions';
    process.env.ASACI_PRODUCTIONS_DOWNLOAD = '/productions/{reference}/download';
    process.env.ASACI_PRODUCTIONS_FETCH = '/productions/fetch/{policeNumber}/{organizationCode}';
};

export const cleanupAsaciTestEnvironment = () => {
    delete process.env.ASACI_BASE_URL;
    delete process.env.ASACI_API_KEY;
    delete process.env.ASACI_TIMEOUT;
    delete process.env.ASACI_PRODUCTIONS;
    delete process.env.ASACI_PRODUCTIONS_DOWNLOAD;
    delete process.env.ASACI_PRODUCTIONS_FETCH;
};

// Integration test helpers
export const createMockAsaciServer = () => {
    const responses = new Map();
    
    return {
        setResponse: (endpoint: string, method: string, response: any) => {
            responses.set(`${method}:${endpoint}`, response);
        },
        getResponse: (endpoint: string, method: string) => {
            return responses.get(`${method}:${endpoint}`);
        },
        clear: () => {
            responses.clear();
        }
    };
};

// Validation test data
export const createValidationTestCases = () => [
    {
        name: 'Missing office_code',
        data: { ...createMockCreateProductionRequestDto(), office_code: '' },
        expectedError: 'office_code is required'
    },
    {
        name: 'Missing organization_code',
        data: { ...createMockCreateProductionRequestDto(), organization_code: '' },
        expectedError: 'organization_code is required'
    },
    {
        name: 'Invalid certificate_type',
        data: { ...createMockCreateProductionRequestDto(), certificate_type: 'invalid' as any },
        expectedError: 'certificate_type must be a valid enum value'
    },
    {
        name: 'Empty productions array',
        data: { ...createMockCreateProductionRequestDto(), productions: [] },
        expectedError: 'productions array cannot be empty'
    },
    {
        name: 'Invalid email format',
        data: { ...createMockCreateProductionRequestDto(), email_notification: 'invalid-email' },
        expectedError: 'email_notification must be a valid email'
    }
];

// Load test helpers
export const createLoadTestScenario = (concurrentRequests: number, requestsPerSecond: number, duration: number) => ({
    concurrentRequests,
    requestsPerSecond,
    duration,
    totalRequests: requestsPerSecond * duration,
    expectedMaxResponseTime: 5000, // 5 seconds
    expectedSuccessRate: 0.95 // 95%
});

// Security test helpers
export const createSecurityTestCases = () => [
    {
        name: 'SQL Injection in policy number',
        data: createMockProductionData({
            NUMERO_DE_POLICE: "'; DROP TABLE productions; --"
        })
    },
    {
        name: 'XSS in subscriber name',
        data: createMockProductionData({
            NOM_DU_SOUSCRIPTEUR: '<script>alert("xss")</script>'
        })
    },
    {
        name: 'Path traversal in vehicle model',
        data: createMockProductionData({
            MODELE_DU_VEHICULE: '../../../etc/passwd'
        })
    },
    {
        name: 'Command injection in chassis number',
        data: createMockProductionData({
            NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123; rm -rf /'
        })
    }
];

// Retry mechanism test helpers
export const createRetryTestScenario = (maxRetries: number = 3) => ({
    maxRetries,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
    expectedRetryAttempts: maxRetries + 1 // Initial attempt + retries
});

// Mock data for edge cases
export const createEdgeCaseTestData = () => ({
    maxLengthStrings: {
        NUMERO_DE_CHASSIS_DU_VEHICULE: 'A'.repeat(255),
        NOM_DU_SOUSCRIPTEUR: 'B'.repeat(255),
        ADRESSE_EMAIL_DU_SOUSCRIPTEUR: `${'c'.repeat(240)}@example.com`,
        MODELE_DU_VEHICULE: 'D'.repeat(255)
    },
    minValues: {
        PRIME_RC: 1,
        NOMBRE_DE_PLACE_DU_VEHICULE: 1,
        PUISSANCE_FISCALE: 1,
        CHARGE_UTILE: 0,
        REDUCTION_FLOTTE: 0
    },
    maxValues: {
        PRIME_RC: 999999999,
        NOMBRE_DE_PLACE_DU_VEHICULE: 100,
        PUISSANCE_FISCALE: 999,
        CHARGE_UTILE: 999999,
        REDUCTION_FLOTTE: 100
    },
    specialCharacters: {
        NOM_DU_SOUSCRIPTEUR: "O'Connor-Smith & Associés",
        ADRESSE_EMAIL_DU_SOUSCRIPTEUR: "test+tag@sub-domain.example.com",
        BOITE_POSTALE_DU_SOUSCRIPTEUR: "BP 1234/56 - Plateau"
    },
    unicodeCharacters: {
        NOM_DU_SOUSCRIPTEUR: "Müller François-José",
        MODELE_DU_VEHICULE: "Citroën C4 Picasso"
    }
});

// Test constants
export const ASACI_TEST_CONSTANTS = {
    DEFAULT_TIMEOUT: 30000,
    MAX_PRODUCTIONS_PER_REQUEST: 1000,
    MIN_PRODUCTIONS_PER_REQUEST: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    VALID_CERTIFICATE_TYPES: ['cima', 'pooltpv', 'matca', 'pooltpvbleu'],
    VALID_CHANNELS: ['api', 'web'],
    VALID_PRODUCTION_STATUSES: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    PERFORMANCE_THRESHOLDS: {
        CREATE_PRODUCTION: 5000, // 5 seconds
        GET_PRODUCTIONS: 3000,   // 3 seconds
        DOWNLOAD_ZIP: 10000,     // 10 seconds
        FETCH_PRODUCTION: 5000   // 5 seconds
    }
};

export default {
    createMockProductionData,
    createMockCreateProductionRequestDto,
    createMockProductionResponse,
    createMockProductionListResponse,
    createMockDownloadResponse,
    createMockFetchProductionResponse,
    createMockHttpClient,
    createAsaciProductionService,
    createMockAsaciProductionService,
    createAsaciApiError,
    createNetworkError,
    createTimeoutError,
    createValidationError,
    createAuthenticationError,
    createRateLimitError,
    generateLargeProductionRequest,
    generateInvalidProductionData,
    createSuccessfulProductionScenario,
    createFailedProductionScenario,
    createPaginationScenario,
    expectHttpClientCall,
    expectAuthTokenSet,
    expectProductionResponse,
    expectProductionListResponse,
    expectDownloadResponse,
    expectFetchProductionResponse,
    measureExecutionTime,
    expectExecutionTimeUnder,
    setupAsaciTestEnvironment,
    cleanupAsaciTestEnvironment,
    createMockAsaciServer,
    createValidationTestCases,
    createLoadTestScenario,
    createSecurityTestCases,
    createRetryTestScenario,
    createEdgeCaseTestData,
    ASACI_TEST_CONSTANTS
};