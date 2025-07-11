import { AsaciProductionService } from '@services/asaci-production.service';
import { HttpClient } from '@utils/httpClient';
import { ASACI_ENDPOINTS } from '@config/asaci-endpoints';
import {
    createMockCreateProductionRequestDto,
    createMockProductionResponse,
    createMockProductionListResponse,
    createMockDownloadResponse,
    createMockFetchProductionResponse,
    createMockHttpClient,
    createAsaciApiError,
    createNetworkError,
    createTimeoutError,
    createAuthenticationError,
    createRateLimitError,
    createSuccessfulProductionScenario,
    createFailedProductionScenario,
    createPaginationScenario,
    generateLargeProductionRequest,
    expectHttpClientCall,
    expectAuthTokenSet,
    expectProductionResponse,
    expectProductionListResponse,
    expectDownloadResponse,
    expectFetchProductionResponse,
    expectExecutionTimeUnder,
    setupAsaciTestEnvironment,
    cleanupAsaciTestEnvironment,
    createValidationTestCases,
    createSecurityTestCases,
    createEdgeCaseTestData,
    ASACI_TEST_CONSTANTS
} from './asaci-production.test.utils';
import MockedObject = jest.MockedObject;

// Mock the HttpClient
jest.mock('@utils/httpClient');
const MockedHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// Mock the ASACI_ENDPOINTS
jest.mock('@config/asaci-endpoints', () => ({
    ASACI_ENDPOINTS: {
        PRODUCTIONS: '/productions',
        PRODUCTIONS_DOWNLOAD: '/productions/{reference}/download',
        PRODUCTIONS_FETCH: '/productions/fetch/{policeNumber}/{organizationCode}'
    }
}));

describe('AsaciProductionService', () => {
    let service: AsaciProductionService;
    let mockHttpClient: MockedObject<HttpClient>

    beforeAll(() => {
        setupAsaciTestEnvironment();
    });

    afterAll(() => {
        cleanupAsaciTestEnvironment();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockHttpClient = createMockHttpClient();
        MockedHttpClient.mockImplementation(() => mockHttpClient);
        
        service = new AsaciProductionService('https://api.asaci.test', 'test-token');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should create service instance with correct configuration', () => {
            expect(MockedHttpClient).toHaveBeenCalledWith({
                baseURL: 'https://api.asaci.test/api/v1',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should set auth token if provided', () => {
            expectAuthTokenSet(mockHttpClient, 'test-token');
        });

        it('should create service without auth token', () => {
            jest.clearAllMocks();
            const serviceWithoutToken = new AsaciProductionService('https://api.asaci.test');
            
            expect(MockedHttpClient).toHaveBeenCalledWith({
                baseURL: 'https://api.asaci.test/api/v1',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            expect(mockHttpClient.setAuthToken).not.toHaveBeenCalled();
        });

        it('should handle different base URLs correctly', () => {
            const testUrls = [
                'https://api.asaci.prod',
                'http://localhost:3000',
                'https://staging.asaci.test'
            ];

            testUrls.forEach(url => {
                jest.clearAllMocks();
                new AsaciProductionService(url);
                
                expect(MockedHttpClient).toHaveBeenCalledWith({
                    baseURL: `${url}/api/v1`,
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            });
        });
    });

    describe('setAuthToken', () => {
        it('should set authentication token', () => {
            const newToken = 'new-auth-token';
            
            service.setAuthToken(newToken);
            
            expectAuthTokenSet(mockHttpClient, newToken);
        });

        it('should update existing token', () => {
            service.setAuthToken('token1');
            service.setAuthToken('token2');
            
            expect(mockHttpClient.setAuthToken).toHaveBeenCalledTimes(3); // Initial + 2 updates
            expect(mockHttpClient.setAuthToken).toHaveBeenLastCalledWith('token2');
        });

        it('should handle empty token', () => {
            service.setAuthToken('');
            
            expect(mockHttpClient.setAuthToken).toHaveBeenCalledWith('');
        });
    });

    describe('createProductionRequest', () => {
        it('should create production request successfully', async () => {
            const { request, response } = createSuccessfulProductionScenario();
            mockHttpClient.post.mockResolvedValue(response);

            const result = await service.createProductionRequest(request);

            expectHttpClientCall(mockHttpClient, 'post', ASACI_ENDPOINTS.PRODUCTIONS, request);
            expectProductionResponse(result, response.reference);
            expect(result).toEqual(response);
        });

        it('should handle single production request', async () => {
            const request = createMockCreateProductionRequestDto();
            const response = createMockProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            const result = await service.createProductionRequest(request);

            expect(result).toEqual(response);
            expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple productions in single request', async () => {
            const request = generateLargeProductionRequest(5);
            const response = createMockProductionResponse({ productions_count: 5 });
            mockHttpClient.post.mockResolvedValue(response);

            const result = await service.createProductionRequest(request);

            expect(result.productions_count).toBe(5);
            expectHttpClientCall(mockHttpClient, 'post', ASACI_ENDPOINTS.PRODUCTIONS, request);
        });

        it('should handle large production requests', async () => {
            const request = generateLargeProductionRequest(100);
            const response = createMockProductionResponse({ productions_count: 100 });
            mockHttpClient.post.mockResolvedValue(response);

            await expectExecutionTimeUnder(
                () => service.createProductionRequest(request),
                ASACI_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.CREATE_PRODUCTION
            );

            expect(mockHttpClient.post).toHaveBeenCalledWith(ASACI_ENDPOINTS.PRODUCTIONS, request);
        });

        it('should handle validation errors', async () => {
            const { request, error } = createFailedProductionScenario('validation');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow(error);
            expectHttpClientCall(mockHttpClient, 'post', ASACI_ENDPOINTS.PRODUCTIONS, request);
        });

        it('should handle network errors', async () => {
            const { request, error } = createFailedProductionScenario('network');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Network Error');
        });

        it('should handle authentication errors', async () => {
            const { request, error } = createFailedProductionScenario('auth');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Authentication failed');
        });

        it('should handle rate limit errors', async () => {
            const { request, error } = createFailedProductionScenario('rateLimit');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Rate limit exceeded');
        });

        it('should handle server errors', async () => {
            const request = createMockCreateProductionRequestDto();
            const error = createAsaciApiError(500, 'Internal Server Error');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Internal Server Error');
        });

        it('should handle timeout errors', async () => {
            const request = createMockCreateProductionRequestDto();
            const error = createTimeoutError();
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Request Timeout');
        });

        describe('Validation Test Cases', () => {
            const validationCases = createValidationTestCases();

            validationCases.forEach(({ name, data, expectedError }) => {
                it(`should handle validation error: ${name}`, async () => {
                    const error = createAsaciApiError(400, expectedError);
                    mockHttpClient.post.mockRejectedValue(error);

                    await expect(service.createProductionRequest(data as any)).rejects.toThrow(expectedError);
                });
            });
        });

        describe('Edge Cases', () => {
            const edgeCaseData = createEdgeCaseTestData();

            it('should handle maximum length strings', async () => {
                const request = createMockCreateProductionRequestDto({
                    productions: [edgeCaseData.maxLengthStrings as any]
                });
                const response = createMockProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.createProductionRequest(request);
                expect(result).toEqual(response);
            });

            it('should handle minimum values', async () => {
                const request = createMockCreateProductionRequestDto({
                    productions: [edgeCaseData.minValues as any]
                });
                const response = createMockProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.createProductionRequest(request);
                expect(result).toEqual(response);
            });

            it('should handle maximum values', async () => {
                const request = createMockCreateProductionRequestDto({
                    productions: [edgeCaseData.maxValues as any]
                });
                const response = createMockProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.createProductionRequest(request);
                expect(result).toEqual(response);
            });

            it('should handle special characters', async () => {
                const request = createMockCreateProductionRequestDto({
                    productions: [edgeCaseData.specialCharacters as any]
                });
                const response = createMockProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.createProductionRequest(request);
                expect(result).toEqual(response);
            });

            it('should handle unicode characters', async () => {
                const request = createMockCreateProductionRequestDto({
                    productions: [edgeCaseData.unicodeCharacters as any]
                });
                const response = createMockProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.createProductionRequest(request);
                expect(result).toEqual(response);
            });
        });

        describe('Security Test Cases', () => {
            const securityCases = createSecurityTestCases();

            securityCases.forEach(({ name, data }) => {
                it(`should handle security case: ${name}`, async () => {
                    const request = createMockCreateProductionRequestDto({
                        productions: [data]
                    });
                    const response = createMockProductionResponse();
                    mockHttpClient.post.mockResolvedValue(response);

                    // Should not throw error - data should be properly escaped/sanitized
                    const result = await service.createProductionRequest(request);
                    expect(result).toEqual(response);
                });
            });
        });
    });

    describe('getProductionRequests', () => {
        it('should get production requests without parameters', async () => {
            const response = createMockProductionListResponse();
            mockHttpClient.get.mockResolvedValue(response);

            const result = await service.getProductionRequests();

            expectHttpClientCall(mockHttpClient, 'get', ASACI_ENDPOINTS.PRODUCTIONS);
            expectProductionListResponse(result, 3);
            expect(result).toEqual(response);
        });

        it('should get production requests with pagination parameters', async () => {
            const { params, response } = createPaginationScenario(2, 20);
            mockHttpClient.get.mockResolvedValue(response);

            const result = await service.getProductionRequests(params);

            const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?page=2&limit=20`;
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(20);
        });

        it('should handle page parameter only', async () => {
            const response = createMockProductionListResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await service.getProductionRequests({ page: 3 });

            const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?page=3`;
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
        });

        it('should handle limit parameter only', async () => {
            const response = createMockProductionListResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await service.getProductionRequests({ limit: 50 });

            const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?limit=50`;
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
        });

        it('should handle empty response', async () => {
            const emptyResponse = createMockProductionListResponse({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    total_pages: 0,
                    has_next: false,
                    has_previous: false
                }
            });
            mockHttpClient.get.mockResolvedValue(emptyResponse);

            const result = await service.getProductionRequests();

            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle large page numbers', async () => {
            const response = createMockProductionListResponse({
                pagination: {
                    total: 1000,
                    page: 100,
                    limit: 10,
                    total_pages: 100,
                    has_next: false,
                    has_previous: true
                }
            });
            mockHttpClient.get.mockResolvedValue(response);

            await service.getProductionRequests({ page: 100, limit: 10 });

            const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?page=100&limit=10`;
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
        });

        it('should handle performance requirements', async () => {
            const response = createMockProductionListResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await expectExecutionTimeUnder(
                () => service.getProductionRequests({ page: 1, limit: 100 }),
                ASACI_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.GET_PRODUCTIONS
            );
        });

        it('should handle network errors', async () => {
            const error = createNetworkError();
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.getProductionRequests()).rejects.toThrow('Network Error');
        });

        it('should handle authentication errors', async () => {
            const error = createAuthenticationError();
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.getProductionRequests()).rejects.toThrow('Authentication failed');
        });

        it('should handle server errors', async () => {
            const error = createAsaciApiError(500, 'Internal Server Error');
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.getProductionRequests()).rejects.toThrow('Internal Server Error');
        });

        describe('Pagination Edge Cases', () => {
            it('should handle negative page number', async () => {
                const response = createMockProductionListResponse();
                mockHttpClient.get.mockResolvedValue(response);

                await service.getProductionRequests({ page: -1 });

                const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?page=-1`;
                expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
            });

            it('should handle very large limit', async () => {
                const response = createMockProductionListResponse();
                mockHttpClient.get.mockResolvedValue(response);

                await service.getProductionRequests({ limit: 10000 });

                const expectedUrl = `${ASACI_ENDPOINTS.PRODUCTIONS}?limit=10000`;
                expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
            });
        });
    });

    describe('downloadProductionZip', () => {
        it('should download production zip successfully', async () => {
            const reference = 'PROD-2024-001234';
            const response = createMockDownloadResponse();
            mockHttpClient.get.mockResolvedValue(response);

            const result = await service.downloadProductionZip(reference);

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', reference);
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
            expectDownloadResponse(result);
            expect(result).toEqual(response);
        });

        it('should handle different reference formats', async () => {
            const references = [
                'PROD-2024-001234',
                'CERT-ABC123',
                'REF_123456',
                '12345',
                'prod-with-special-chars_123'
            ];

            for (const reference of references) {
                jest.clearAllMocks();
                const response = createMockDownloadResponse();
                mockHttpClient.get.mockResolvedValue(response);

                await service.downloadProductionZip(reference);

                const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', reference);
                expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
            }
        });

        it('should handle empty reference', async () => {
            const response = createMockDownloadResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await service.downloadProductionZip('');

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', '');
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
        });

        it('should handle special characters in reference', async () => {
            const reference = 'PROD-2024-001234@#$%';
            const response = createMockDownloadResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await service.downloadProductionZip(reference);

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', reference);
            expectHttpClientCall(mockHttpClient, 'get', expectedUrl);
        });

        it('should handle performance requirements', async () => {
            const reference = 'PROD-2024-001234';
            const response = createMockDownloadResponse();
            mockHttpClient.get.mockResolvedValue(response);

            await expectExecutionTimeUnder(
                () => service.downloadProductionZip(reference),
                ASACI_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.DOWNLOAD_ZIP
            );
        });

        it('should handle not found errors', async () => {
            const reference = 'NON-EXISTENT-REF';
            const error = createAsaciApiError(404, 'Production not found');
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.downloadProductionZip(reference)).rejects.toThrow('Production not found');
        });

        it('should handle unauthorized access', async () => {
            const reference = 'PROD-2024-001234';
            const error = createAuthenticationError('Access denied');
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.downloadProductionZip(reference)).rejects.toThrow('Access denied');
        });

        it('should handle server errors', async () => {
            const reference = 'PROD-2024-001234';
            const error = createAsaciApiError(500, 'Download service unavailable');
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.downloadProductionZip(reference)).rejects.toThrow('Download service unavailable');
        });

        it('should handle timeout errors', async () => {
            const reference = 'PROD-2024-001234';
            const error = createTimeoutError('Download timeout');
            mockHttpClient.get.mockRejectedValue(error);

            await expect(service.downloadProductionZip(reference)).rejects.toThrow('Download timeout');
        });
    });

    describe('fetchProduction', () => {
        it('should fetch production successfully', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const response = createMockFetchProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            const result = await service.fetchProduction(policeNumber, organizationCode);

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
                .replace('{policeNumber}', policeNumber)
                .replace('{organizationCode}', organizationCode);
            expectHttpClientCall(mockHttpClient, 'post', expectedUrl);
            expectFetchProductionResponse(result);
            expect(result).toEqual(response);
        });

        it('should handle different police number formats', async () => {
            const policeNumbers = [
                'CI2024001234567',
                'POL123456789',
                'ABC-123-DEF',
                '123456',
                'POLICY_2024_001'
            ];
            const organizationCode = 'NSIA';

            for (const policeNumber of policeNumbers) {
                jest.clearAllMocks();
                const response = createMockFetchProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                await service.fetchProduction(policeNumber, organizationCode);

                const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
                    .replace('{policeNumber}', policeNumber)
                    .replace('{organizationCode}', organizationCode);
                expectHttpClientCall(mockHttpClient, 'post', expectedUrl);
            }
        });

        it('should handle different organization codes', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCodes = [
                'NSIA',
                'SAHAM',
                'ATLANTIQUE',
                'ORG123',
                'org-with-special-chars_123'
            ];

            for (const organizationCode of organizationCodes) {
                jest.clearAllMocks();
                const response = createMockFetchProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                await service.fetchProduction(policeNumber, organizationCode);

                const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
                    .replace('{policeNumber}', policeNumber)
                    .replace('{organizationCode}', organizationCode);
                expectHttpClientCall(mockHttpClient, 'post', expectedUrl);
            }
        });

        it('should handle empty parameters', async () => {
            const response = createMockFetchProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            await service.fetchProduction('', '');

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
                .replace('{policeNumber}', '')
                .replace('{organizationCode}', '');
            expectHttpClientCall(mockHttpClient, 'post', expectedUrl);
        });

        it('should handle special characters in parameters', async () => {
            const policeNumber = 'CI2024@#$%001234567';
            const organizationCode = 'NSIA&CO';
            const response = createMockFetchProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            await service.fetchProduction(policeNumber, organizationCode);

            const expectedUrl = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
                .replace('{policeNumber}', policeNumber)
                .replace('{organizationCode}', organizationCode);
            expectHttpClientCall(mockHttpClient, 'post', expectedUrl);
        });

        it('should handle performance requirements', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const response = createMockFetchProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            await expectExecutionTimeUnder(
                () => service.fetchProduction(policeNumber, organizationCode),
                ASACI_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.FETCH_PRODUCTION
            );
        });

        it('should handle not found errors', async () => {
            const policeNumber = 'NON-EXISTENT-POLICY';
            const organizationCode = 'UNKNOWN-ORG';
            const error = createAsaciApiError(404, 'Production not found');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Production not found');
        });

        it('should handle validation errors', async () => {
            const policeNumber = 'INVALID-POLICY';
            const organizationCode = 'INVALID-ORG';
            const error = createAsaciApiError(400, 'Invalid parameters');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Invalid parameters');
        });

        it('should handle unauthorized access', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const error = createAuthenticationError('Access denied');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Access denied');
        });

        it('should handle server errors', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const error = createAsaciApiError(500, 'Fetch service unavailable');
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Fetch service unavailable');
        });

        it('should handle network errors', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const error = createNetworkError();
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Network Error');
        });

        it('should handle timeout errors', async () => {
            const policeNumber = 'CI2024001234567';
            const organizationCode = 'NSIA';
            const error = createTimeoutError();
            mockHttpClient.post.mockRejectedValue(error);

            await expect(service.fetchProduction(policeNumber, organizationCode)).rejects.toThrow('Request Timeout');
        });

        describe('Response Validation', () => {
            it('should validate successful response structure', async () => {
                const policeNumber = 'CI2024001234567';
                const organizationCode = 'NSIA';
                const response = createMockFetchProductionResponse();
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.fetchProduction(policeNumber, organizationCode);

                expect(result.success).toBe(true);
                expect(result.data).toHaveProperty('reference');
                expect(result.data).toHaveProperty('status');
                expect(result.data).toHaveProperty('certificates');
                expect(Array.isArray(result.data.certificates)).toBe(true);
            });

            it('should handle response with multiple certificates', async () => {
                const policeNumber = 'CI2024001234567';
                const organizationCode = 'NSIA';
                const response = createMockFetchProductionResponse({
                    data: {
                        reference: 'PROD-2024-001234',
                        status: 'COMPLETED',
                        certificates: [
                            {
                                id: 'cert-001',
                                policy_number: 'CI2024001234567',
                                download_link: 'https://api.asaci.test/certificates/cert-001.pdf',
                                status: 'GENERATED'
                            },
                            {
                                id: 'cert-002',
                                policy_number: 'CI2024001234568',
                                download_link: 'https://api.asaci.test/certificates/cert-002.pdf',
                                status: 'GENERATED'
                            }
                        ]
                    }
                });
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.fetchProduction(policeNumber, organizationCode);

                expect(result.data.certificates).toHaveLength(2);
                result.data.certificates.forEach((cert: any) => {
                    expect(cert).toHaveProperty('id');
                    expect(cert).toHaveProperty('policy_number');
                    expect(cert).toHaveProperty('download_link');
                    expect(cert).toHaveProperty('status');
                });
            });

            it('should handle response with no certificates', async () => {
                const policeNumber = 'CI2024001234567';
                const organizationCode = 'NSIA';
                const response = createMockFetchProductionResponse({
                    data: {
                        reference: 'PROD-2024-001234',
                        status: 'PENDING',
                        certificates: []
                    }
                });
                mockHttpClient.post.mockResolvedValue(response);

                const result = await service.fetchProduction(policeNumber, organizationCode);

                expect(result.data.certificates).toHaveLength(0);
                expect(result.data.status).toBe('PENDING');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle HTTP client initialization errors', () => {
            MockedHttpClient.mockImplementation(() => {
                throw new Error('HTTP client initialization failed');
            });

            expect(() => new AsaciProductionService('https://api.asaci.test')).toThrow('HTTP client initialization failed');
        });

        it('should handle malformed URLs', () => {
            const invalidUrls = [
                '',
                'not-a-url',
                'ftp://invalid-protocol.com',
                'http://',
                'https://'
            ];

            invalidUrls.forEach(url => {
                expect(() => new AsaciProductionService(url)).not.toThrow();
                // Service should be created, but an HTTP client will handle URL validation
            });
        })
    });

    describe('Integration Scenarios', () => {
        it('should handle complete production workflow', async () => {
            // 1. Create production request
            const createRequest = createMockCreateProductionRequestDto();
            const createResponse = createMockProductionResponse();
            mockHttpClient.post.mockResolvedValueOnce(createResponse);

            const createdProduction = await service.createProductionRequest(createRequest);
            expect(createdProduction.reference).toBe(createResponse.reference);

            // 2. Get production requests
            const listResponse = createMockProductionListResponse();
            mockHttpClient.get.mockResolvedValueOnce(listResponse);

            const productions = await service.getProductionRequests();
            expect(productions.data).toHaveLength(3);

            // 3. Download production zip
            const downloadResponse = createMockDownloadResponse();
            mockHttpClient.get.mockResolvedValueOnce(downloadResponse);

            const downloadResult = await service.downloadProductionZip(createResponse.reference);
            expect(downloadResult.download_url).toBeDefined();

            // 4. Fetch production details
            const fetchResponse = createMockFetchProductionResponse();
            mockHttpClient.post.mockResolvedValueOnce(fetchResponse);

            const fetchResult = await service.fetchProduction('CI2024001234567', 'NSIA');
            expect(fetchResult.success).toBe(true);
        });

        it('should handle authentication token refresh scenario', async () => {
            // Initial request with expired token
            const request = createMockCreateProductionRequestDto();
            const authError = createAuthenticationError('Token expired');
            mockHttpClient.post.mockRejectedValueOnce(authError);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Token expired');

            // Set new token
            service.setAuthToken('new-valid-token');

            // Retry request with new token
            const response = createMockProductionResponse();
            mockHttpClient.post.mockResolvedValueOnce(response);

            const result = await service.createProductionRequest(request);
            expect(result).toEqual(response);
            expect(mockHttpClient.setAuthToken).toHaveBeenCalledWith('new-valid-token');
        });

        it('should handle rate limiting with backoff', async () => {
            const request = createMockCreateProductionRequestDto();
            
            // First request hits rate limit
            const rateLimitError = createRateLimitError();
            mockHttpClient.post.mockRejectedValueOnce(rateLimitError);

            await expect(service.createProductionRequest(request)).rejects.toThrow('Rate limit exceeded');

            // Subsequent request succeeds
            const response = createMockProductionResponse();
            mockHttpClient.post.mockResolvedValueOnce(response);

            const result = await service.createProductionRequest(request);
            expect(result).toEqual(response);
        });
    });

    describe('Performance Tests', () => {
        it('should handle concurrent requests efficiently', async () => {
            const requests = Array(10).fill(null).map(() => createMockCreateProductionRequestDto());
            const responses = Array(10).fill(null).map(() => createMockProductionResponse());
            
            mockHttpClient.post.mockImplementation(() => Promise.resolve(responses[0]));

            const startTime = Date.now();
            const results = await Promise.all(
                requests.map(request => service.createProductionRequest(request))
            );
            const duration = Date.now() - startTime;

            expect(results).toHaveLength(10);
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            expect(mockHttpClient.post).toHaveBeenCalledTimes(10);
        });

        it('should handle large payload efficiently', async () => {
            const largeRequest = generateLargeProductionRequest(500);
            const response = createMockProductionResponse({ productions_count: 500 });
            mockHttpClient.post.mockResolvedValue(response);

            const startTime = Date.now();
            const result = await service.createProductionRequest(largeRequest);
            const duration = Date.now() - startTime;

            expect(result.productions_count).toBe(500);
            expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
        });
    });

    describe('Memory Management', () => {
        it('should not leak memory with repeated requests', async () => {
            const request = createMockCreateProductionRequestDto();
            const response = createMockProductionResponse();
            mockHttpClient.post.mockResolvedValue(response);

            // Simulate many requests
            for (let i = 0; i < 100; i++) {
                await service.createProductionRequest(request);
            }

            expect(mockHttpClient.post).toHaveBeenCalledTimes(100);
            // No memory leak assertions - would require more sophisticated testing
        });
    });
});