import { jest } from '@jest/globals';
import { CertifyLinkController } from '@controllers/certify-link.controller';
import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciRequestStatus } from '@models/asaci-request.model';
import {
    createMockRequest,
    createMockResponse,
    createMockAuthenticatedRequest,
    createMockAsaciRequest,
    createMockOrassQueryResult,
    createMockStatistics,
    createValidCreateEditionFromOrassDataRequest,
    TEST_DATA,
    setupTestEnvironment,
    expectHttpStatus,
    expectJsonResponse, setupCertifyLinkTestEnvironment
} from '../../utils/test.utils';
import {AsaciProductionService} from "@services/asaci-production.service";
import {OrassService} from "@services/orass.service";

// Mock the certify link service
jest.mock('@services/certify-link.service');

const MockedAsaciProductionService = AsaciProductionService as jest.MockedClass<typeof AsaciProductionService>;
const MockedOrassService = OrassService as jest.MockedClass<typeof OrassService>;
const MockedCertifyLinkService = CertifyLinkService as jest.MockedClass<typeof CertifyLinkService>;

describe('CertifyLinkController', () => {
    let controller: CertifyLinkController;
    let mockOrassService: jest.Mocked<OrassService>;
    let mockAsaciProductionService: jest.Mocked<AsaciProductionService>;
    let mockService: jest.Mocked<CertifyLinkService>;
    let mockRequest: any;
    let mockAuthenticatedRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnvironment();
        setupCertifyLinkTestEnvironment();

        mockOrassService = new MockedOrassService() as jest.Mocked<OrassService>;
        mockAsaciProductionService = new MockedAsaciProductionService(process.env.ASACI_BASE_URL as string) as jest.Mocked<AsaciProductionService>;
        mockService = new MockedCertifyLinkService(mockOrassService, mockAsaciProductionService) as jest.Mocked<CertifyLinkService>;
        controller = new CertifyLinkController(mockService);

        mockRequest = createMockRequest();
        mockResponse = createMockResponse();
        mockAuthenticatedRequest = createMockAuthenticatedRequest();
    });

    describe('searchOrassPolicies', () => {
        it('should search policies with query parameters', async () => {
            // Arrange
            const queryParams = {
                policyNumber: 'POL123',
                applicantCode: 'APP456',
                endorsementNumber: 'END789',
                limit: '50',
                offset: '10'
            };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith({
                policyNumber: 'POL123',
                applicantCode: 'APP456',
                endorsementNumber: 'END789',
                organizationCode: undefined,
                officeCode: undefined,
                limit: 50,
                offset: 10
            });

            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'ORASS policies retrieved successfully',
                data: mockResult.policies,
                pagination: {
                    total: mockResult.totalCount,
                    limit: 50,
                    offset: 10,
                    hasMore: mockResult.hasMore
                },
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should use default pagination when not provided', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123' };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith({
                policyNumber: 'POL123',
                applicantCode: undefined,
                endorsementNumber: undefined,
                organizationCode: undefined,
                officeCode: undefined,
                limit: 100,
                offset: 0
            });
        });

        it('should handle invalid numeric parameters', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123', limit: 'invalid', offset: 'invalid' };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 100, // defaults to 100 when parsing fails
                    offset: 0   // defaults to 0 when parsing fails
                })
            );
        });

        it('should handle service errors', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123' };
            const error = new Error('ORASS service unavailable');
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('ORASS service unavailable');
        });
    });

    describe('createEditionRequestFromOrassPolicy', () => {
        it('should create edition request successfully', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const mockResult = {
                success: true,
                asaciRequestId: TEST_DATA.VALID_UUID,
                message: 'Certificate production created successfully'
            };
            mockAuthenticatedRequest.body = createRequest;
            mockService.createEditionRequest.mockResolvedValue(mockResult);

            // Act
            await controller.createEditionRequestFromOrassPolicy(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.createEditionRequest).toHaveBeenCalledWith(
                createRequest,
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 201);
            expectJsonResponse(mockResponse, {
                message: 'Certificate production created successfully from ORASS policy',
                data: mockResult,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 401 when user ID is missing', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const requestWithoutUser = createMockAuthenticatedRequest({ user: null });
            requestWithoutUser.body = createRequest;

            // Act
            await controller.createEditionRequestFromOrassPolicy(requestWithoutUser, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expectJsonResponse(mockResponse, {
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            expect(mockService.createEditionRequest).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const error = new Error('ASACI service unavailable');
            mockAuthenticatedRequest.body = createRequest;
            mockService.createEditionRequest.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.createEditionRequestFromOrassPolicy(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('ASACI service unavailable');
        });
    });

    describe('getEditionRequestFromAsaci', () => {
        it('should get edition requests from ASACI successfully', async () => {
            // Arrange
            const mockResult = {
                success: true,
                data: [createMockAsaciRequest()],
                pagination: {
                    total: 1,
                    path: '/api/productions',
                    perPage: 10,
                    nextCursor: null,
                    prevCursor: null
                },
                metadata: {
                    executionTime: 150,
                    timestamp: new Date().toISOString()
                }
            };
            mockService.getEditionRequestFromAsaci.mockResolvedValue(mockResult);

            // Act
            await controller.getEditionRequestFromAsaci(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getEditionRequestFromAsaci).toHaveBeenCalled();
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'Edition requests retrieved successfully from ASACI',
                data: mockResult.data,
                pagination: mockResult.pagination,
                metadata: mockResult.metadata,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should handle service errors', async () => {
            // Arrange
            const error = new Error('ASACI service unavailable');
            mockService.getEditionRequestFromAsaci.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.getEditionRequestFromAsaci(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('ASACI service unavailable');
        });
    });

    describe('getStoredAsaciRequests', () => {
        it('should get stored requests with filters', async () => {
            // Arrange
            const queryParams = {
                status: AsaciRequestStatus.COMPLETED,
                certificate_type: 'cima',
                limit: '25',
                offset: '5'
            };
            const mockResult = {
                success: true,
                data: [createMockAsaciRequest()],
                pagination: {
                    total: 50,
                    limit: 25,
                    offset: 5,
                    hasMore: true
                }
            };
            mockAuthenticatedRequest.query = queryParams;
            mockService.getStoredAsaciRequests.mockResolvedValue(mockResult);

            // Act
            await controller.getStoredAsaciRequests(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getStoredAsaciRequests).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                {
                    status: AsaciRequestStatus.COMPLETED,
                    certificateType: 'cima',
                    limit: 25,
                    offset: 5
                }
            );
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'Stored ASACI requests retrieved successfully',
                data: mockResult.data,
                pagination: mockResult.pagination,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should use default filters when not provided', async () => {
            // Arrange
            const mockResult = {
                success: true,
                data: [createMockAsaciRequest()],
                pagination: { total: 1, limit: 50, offset: 0, hasMore: false }
            };
            mockAuthenticatedRequest.query = {};
            mockService.getStoredAsaciRequests.mockResolvedValue(mockResult);

            // Act
            await controller.getStoredAsaciRequests(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getStoredAsaciRequests).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                {
                    status: undefined,
                    certificateType: undefined,
                    limit: 50,
                    offset: 0
                }
            );
        });

        it('should return 401 when user ID is missing', async () => {
            // Arrange
            const requestWithoutUser = createMockAuthenticatedRequest({ user: null });

            // Act
            await controller.getStoredAsaciRequests(requestWithoutUser, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expectJsonResponse(mockResponse, {
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            expect(mockService.getStoredAsaciRequests).not.toHaveBeenCalled();
        });
    });

    describe('getAsaciRequestById', () => {
        it('should get request by ID successfully', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest();
            mockAuthenticatedRequest.params = { requestId };
            mockService.getAsaciRequestById.mockResolvedValue(mockRequest);

            // Act
            await controller.getAsaciRequestById(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getAsaciRequestById).toHaveBeenCalledWith(
                requestId,
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'ASACI request retrieved successfully',
                data: mockRequest,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 404 when request not found', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            mockAuthenticatedRequest.params = { requestId };
            mockService.getAsaciRequestById.mockResolvedValue(null);

            // Act
            await controller.getAsaciRequestById(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 404);
            expectJsonResponse(mockResponse, {
                message: 'ASACI request not found',
                error: `No request found with ID: ${requestId}`
            });
        });

        it('should return 401 when user ID is missing', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const requestWithoutUser = createMockAuthenticatedRequest({ user: null });
            requestWithoutUser.params = { requestId };

            // Act
            await controller.getAsaciRequestById(requestWithoutUser, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expect(mockService.getAsaciRequestById).not.toHaveBeenCalled();
        });
    });

    describe('downloadEditionRequest', () => {
        it('should download edition request successfully', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const mockResult = {
                success: true,
                certificateUrl: 'https://example.com/cert.pdf',
                downloadCount: 6,
                message: 'Certificate download initiated'
            };
            mockAuthenticatedRequest.params = { requestId };
            mockService.downloadCertificate.mockResolvedValue(mockResult);

            // Act
            await controller.downloadEditionRequest(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.downloadCertificate).toHaveBeenCalledWith(
                requestId,
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'Certificate download initiated',
                data: mockResult,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 401 when user ID is missing', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const requestWithoutUser = createMockAuthenticatedRequest({ user: null });
            requestWithoutUser.params = { requestId };

            // Act
            await controller.downloadEditionRequest(requestWithoutUser, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expect(mockService.downloadCertificate).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const error = new Error('Certificate not found');
            mockAuthenticatedRequest.params = { requestId };
            mockService.downloadCertificate.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.downloadEditionRequest(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Certificate not found');
        });
    });

    describe('getUserStatistics', () => {
        it('should get user statistics successfully', async () => {
            // Arrange
            const mockResult = {
                success: true,
                data: createMockStatistics(),
                timestamp: new Date().toISOString()
            };
            mockService.getUserStatistics.mockResolvedValue(mockResult);

            // Act
            await controller.getUserStatistics(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getUserStatistics).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'User statistics retrieved successfully',
                data: mockResult.data,
                timestamp: mockResult.timestamp,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 401 when user ID is missing', async () => {
            // Arrange
            const requestWithoutUser = createMockAuthenticatedRequest({ user: null });

            // Act
            await controller.getUserStatistics(requestWithoutUser, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expect(mockService.getUserStatistics).not.toHaveBeenCalled();
        });
    });

    describe('getEditionRequestDownloadLink', () => {
        it('should get download link successfully', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const mockResult = {
                success: true,
                downloadLink: 'https://example.com/cert.pdf',
                source: 'database',
                downloadCount: 5,
                message: 'Certificate download link retrieved successfully'
            };
            mockAuthenticatedRequest.params = { reference: certificateReference };
            mockService.getEditionRequestDownloadLink.mockResolvedValue(mockResult);

            // Act
            await controller.getEditionRequestDownloadLink(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getEditionRequestDownloadLink).toHaveBeenCalledWith(
                certificateReference,
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'Certificate download link retrieved successfully',
                data: mockResult,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 400 when certificate reference is missing', async () => {
            // Arrange
            mockAuthenticatedRequest.params = {};

            // Act
            await controller.getEditionRequestDownloadLink(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 400);
            expectJsonResponse(mockResponse, {
                message: 'Certificate reference is required',
                error: 'Missing certificateReference in request body'
            });
            expect(mockService.getEditionRequestDownloadLink).not.toHaveBeenCalled();
        });
    });

    describe('getBatchEditionRequestDownloadLinks', () => {
        it('should get batch download links successfully', async () => {
            // Arrange
            const certificateReferences = ['CERT-001', 'CERT-002', 'CERT-003'];
            const mockResult = {
                success: true,
                summary: { total: 3, successful: 2, failed: 1 },
                results: [
                    { certificateReference: 'CERT-001', downloadLink: 'https://example.com/cert-001.pdf' },
                    { certificateReference: 'CERT-002', downloadLink: 'https://example.com/cert-002.pdf' }
                ],
                errors: [{ certificateReference: 'CERT-003', error: 'Not found' }],
                message: 'Batch operation completed. 2 successful, 1 failed.'
            };
            mockAuthenticatedRequest.body = { certificateReferences };
            mockService.getBatchCertificateDownloadLinks.mockResolvedValue(mockResult);

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getBatchCertificateDownloadLinks).toHaveBeenCalledWith(
                certificateReferences,
                mockAuthenticatedRequest.user.id
            );
            expectHttpStatus(mockResponse, 207); // Multi-Status for partial success
            expectJsonResponse(mockResponse, {
                message: mockResult.message,
                data: mockResult,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should return 200 for all successful requests', async () => {
            // Arrange
            const certificateReferences = ['CERT-001', 'CERT-002'];
            const mockResult = {
                success: true,
                summary: { total: 2, successful: 2, failed: 0 },
                results: [
                    { certificateReference: 'CERT-001', downloadLink: 'https://example.com/cert-001.pdf' },
                    { certificateReference: 'CERT-002', downloadLink: 'https://example.com/cert-002.pdf' }
                ],
                message: 'Batch operation completed. 2 successful, 0 failed.'
            };
            mockAuthenticatedRequest.body = { certificateReferences };
            mockService.getBatchCertificateDownloadLinks.mockResolvedValue(mockResult);

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 200);
        });

        it('should return 400 when certificate references are missing', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {};

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 400);
            expectJsonResponse(mockResponse, {
                message: 'Certificate references array is required',
                error: 'Missing or invalid certificateReferences in request body'
            });
        });

        it('should return 400 when certificate references is not an array', async () => {
            // Arrange
            mockAuthenticatedRequest.body = { certificateReferences: 'not-an-array' };

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 400);
        });

        it('should return 400 when certificate references array is empty', async () => {
            // Arrange
            mockAuthenticatedRequest.body = { certificateReferences: [] };

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 400);
        });

        it('should return 400 when exceeding maximum limit', async () => {
            // Arrange
            const certificateReferences = Array(51).fill(null).map((_, i) => `CERT-${i}`);
            mockAuthenticatedRequest.body = { certificateReferences };

            // Act
            await controller.getBatchEditionRequestDownloadLinks(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 400);
            expectJsonResponse(mockResponse, {
                message: 'Too many certificate references',
                error: 'Maximum 50 certificate references allowed per batch request'
            });
        });
    });

    describe('getOrassStatistics', () => {
        it('should get ORASS statistics successfully', async () => {
            // Arrange
            const mockStatistics = {
                totalPolicies: 15000,
                lastUpdated: new Date().toISOString()
            };
            mockService.getOrassStatistics.mockResolvedValue(mockStatistics);

            // Act
            await controller.getOrassStatistics(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.getOrassStatistics).toHaveBeenCalled();
            expectHttpStatus(mockResponse, 200);
            expectJsonResponse(mockResponse, {
                message: 'ORASS statistics retrieved successfully',
                data: mockStatistics,
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should handle service errors', async () => {
            // Arrange
            const error = new Error('ORASS service unavailable');
            mockService.getOrassStatistics.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.getOrassStatistics(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('ORASS service unavailable');
        });
    });

    describe('Error Handling', () => {
        it('should handle service errors properly', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123' };
            const error = new Error('Service error');
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Service error');
        });

        it('should handle missing user in authenticated requests', async () => {
            // Arrange
            const requestWithoutUser = createMockRequest();

            // Act
            await controller.getUserStatistics(requestWithoutUser as any, mockResponse);

            // Assert
            expectHttpStatus(mockResponse, 401);
            expectJsonResponse(mockResponse, {
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            expect(mockService.getUserStatistics).not.toHaveBeenCalled();
        });

        it('should handle malformed request data', async () => {
            // Arrange
            mockAuthenticatedRequest.body = null;
            const error = new Error('Invalid request data');
            mockService.createEditionRequest.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.createEditionRequestFromOrassPolicy(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Invalid request data');
        });
    });

    describe('Response Formatting', () => {
        it('should format responses consistently', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123' };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectJsonResponse(mockResponse, {
                message: 'ORASS policies retrieved successfully',
                data: mockResult.policies,
                pagination: expect.objectContaining({
                    total: mockResult.totalCount,
                    limit: 100,
                    offset: 0,
                    hasMore: mockResult.hasMore
                }),
                user: mockAuthenticatedRequest.user.email
            });
        });

        it('should include user email in all responses', async () => {
            // Arrange
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = { policyNumber: 'POL123' };
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expectJsonResponse(mockResponse, expect.objectContaining({
                user: mockAuthenticatedRequest.user.email
            }));
        });
    });

    describe('Parameter Validation', () => {
        it('should handle numeric parameter conversion', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123', limit: '25', offset: '50' };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 25,
                    offset: 50
                })
            );
        });

        it('should handle zero values correctly', async () => {
            // Arrange
            const queryParams = { policyNumber: 'POL123', limit: '0', offset: '0' };
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = queryParams;
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 0,
                    offset: 0
                })
            );
        });

        it('should handle missing parameters gracefully', async () => {
            // Arrange
            const mockResult = createMockOrassQueryResult();
            mockAuthenticatedRequest.query = {};
            mockService.searchOrassPolicies.mockResolvedValue(mockResult);

            // Act
            await controller.searchOrassPolicies(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockService.searchOrassPolicies).toHaveBeenCalledWith({
                policyNumber: undefined,
                applicantCode: undefined,
                endorsementNumber: undefined,
                organizationCode: undefined,
                officeCode: undefined,
                limit: 100,
                offset: 0
            });
        });
    });
});