import { jest } from '@jest/globals';
import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciProductionService } from '@services/asaci-production.service';
import { OrassService } from '@services/orass.service';
import AsaciRequestModel, { AsaciRequestStatus } from '@models/asaci-request.model';
import { logger } from '@utils/logger';
import {
    createMockAsaciRequest,
    createMockOrassQueryResult,
    createMockAsaciResponse,
    createMockStatistics,
    createValidSearchOrassPoliciesDto,
    createValidCreateEditionFromOrassDataRequest,
    TEST_DATA,
    setupTestEnvironment,
    setupCertifyLinkTestEnvironment
} from '../../helpers/test-utils';

// Mock dependencies
jest.mock('@services/asaci-production.service');
jest.mock('@services/orass.service');
jest.mock('@models/asaci-request.model');
jest.mock('@models/operation-log.model');
jest.mock('@utils/logger');

const MockedAsaciProductionService = AsaciProductionService as jest.MockedClass<typeof AsaciProductionService>;
const MockedOrassService = OrassService as jest.MockedClass<typeof OrassService>;
const MockedAsaciRequestModel = AsaciRequestModel as jest.MockedClass<typeof AsaciRequestModel>;
describe('CertifyLinkService', () => {
    let service: CertifyLinkService;
    let mockOrassService: jest.Mocked<OrassService>;
    let mockAsaciService: jest.Mocked<AsaciProductionService>;
    let mockAsaciRequest: any;

    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnvironment();
        setupCertifyLinkTestEnvironment();

        mockOrassService = new MockedOrassService() as jest.Mocked<OrassService>;
        mockAsaciService = new MockedAsaciProductionService(process.env.ASACI_BASE_URL as string) as jest.Mocked<AsaciProductionService>;
        service = new CertifyLinkService(mockOrassService, mockAsaciService);

        mockAsaciRequest = createMockAsaciRequest();
        setupDefaultMocks();
    });

    const setupDefaultMocks = () => {
        jest.mocked(MockedAsaciRequestModel.create).mockResolvedValue(mockAsaciRequest);
        jest.mocked(MockedAsaciRequestModel.findAll).mockResolvedValue([mockAsaciRequest]);
        jest.mocked(MockedAsaciRequestModel.findOne).mockResolvedValue(mockAsaciRequest);
        jest.mocked(MockedAsaciRequestModel.count).mockResolvedValue(1);
        jest.mocked(MockedAsaciRequestModel.getStatsByUser).mockResolvedValue(createMockStatistics());
        // jest.mocked(MockedOperationLogModel.logOrassOperation).mockResolvedValue(undefined);
        // jest.mocked(MockedOperationLogModel.logAsaciOperation).mockResolvedValue(undefined);
    };

    describe('searchOrassPolicies', () => {
        it('should search ORASS policies with all parameters', async () => {
            // Arrange
            const searchDto = createValidSearchOrassPoliciesDto();
            const expectedResult = createMockOrassQueryResult();
            mockOrassService.searchPolicies.mockResolvedValue(expectedResult);

            // Act
            const result = await service.searchOrassPolicies(searchDto);

            // Assert
            expect(mockOrassService.searchPolicies).toHaveBeenCalledWith(
                {
                    policyNumber: searchDto.policyNumber,
                    applicantCode: searchDto.applicantCode,
                    endorsementNumber: searchDto.endorsementNumber,
                    organizationCode: searchDto.organizationCode,
                    officeCode: searchDto.officeCode
                },
                searchDto.limit,
                searchDto.offset
            );
            expect(result).toEqual(expectedResult);
            expect(logger.info).toHaveBeenCalledWith('ORASS policies search completed', expect.any(Object));
        });

        it('should use default pagination when not provided', async () => {
            // Arrange
            const searchDto = createValidSearchOrassPoliciesDto({ limit: undefined, offset: undefined });
            const expectedResult = createMockOrassQueryResult();
            mockOrassService.searchPolicies.mockResolvedValue(expectedResult);

            // Act
            await service.searchOrassPolicies(searchDto);

            // Assert
            expect(mockOrassService.searchPolicies).toHaveBeenCalledWith(
                expect.any(Object),
                100, // default limit
                0    // default offset
            );
        });

        it('should handle ORASS service errors', async () => {
            // Arrange
            const searchDto = createValidSearchOrassPoliciesDto();
            const error = new Error('ORASS connection failed');
            mockOrassService.searchPolicies.mockRejectedValue(error);

            // Act & Assert
            await expect(service.searchOrassPolicies(searchDto)).rejects.toThrow('ORASS connection failed');
            expect(logger.error).toHaveBeenCalledWith('Failed to search ORASS policies:', error);
        });

        it('should handle empty search results', async () => {
            // Arrange
            const searchDto = createValidSearchOrassPoliciesDto();
            const emptyResult = createMockOrassQueryResult({ policies: [], totalCount: 0, hasMore: false });
            mockOrassService.searchPolicies.mockResolvedValue(emptyResult);

            // Act
            const result = await service.searchOrassPolicies(searchDto);

            // Assert
            expect(result.policies).toHaveLength(0);
            expect(result.totalCount).toBe(0);
            expect(result.hasMore).toBe(false);
        });
    });

    describe('createEditionRequest', () => {
        it('should create edition request successfully', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse({ status: 201 });
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            const result = await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(MockedAsaciRequestModel.create).toHaveBeenCalledWith({
                userId,
                officeCode: createRequest.officeCode,
                organizationCode: createRequest.organizationCode,
                certificateType: createRequest.certificateType,
                emailNotification: createRequest.emailNotification,
                generatedBy: createRequest.generatedBy,
                channel: createRequest.channel || 'web',
                status: AsaciRequestStatus.ORASS_FETCHING
            });

            expect(mockAsaciService.createProductionRequest).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.asaciRequestId).toBe(mockAsaciRequest.id);
            expect(result.message).toBe('Certificate production created successfully');
        });

        it('should handle ASACI service failure', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('ASACI service unavailable');
            mockAsaciService.createProductionRequest.mockRejectedValue(error);

            // Act & Assert
            await expect(service.createEditionRequest(createRequest, userId))
                .rejects.toThrow('ASACI service unavailable');

            expect(mockAsaciRequest.markAsFailed).toHaveBeenCalledWith(
                error.message,
                expect.objectContaining({
                    stack: error.stack,
                    timestamp: expect.any(String)
                })
            );
        });

        it('should mark request as completed for successful response', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse({
                status: 201,
                data: {
                    reference: 'CERT-12345',
                    download_link: 'https://example.com/cert.pdf'
                }
            });
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(mockAsaciRequest.markAsCompleted).toHaveBeenCalledWith(
                'https://example.com/cert.pdf',
                mockResponse.data
            );
        });

        it('should use default channel when not provided', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest({ channel: undefined });
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse();
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(MockedAsaciRequestModel.create).toHaveBeenCalledWith(
                expect.objectContaining({ channel: 'web' })
            );
        });
    });

    describe('getEditionRequestFromAsaci', () => {
        it('should filter requests by generated_id', async () => {
            // Arrange
            process.env.ASACI_GENERATED_BY = 'test-generator';
            const mockResponse = {
                data: [
                    { id: 1, user: { username: 'test-generator' } },
                    { id: 2, user: { username: 'other-user' } }
                ],
                meta: { total: 2, per_page: 10 }
            };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].user.username).toBe('test-generator');
            expect(result.metadata.filteredBy).toBe('generated_id');
        });

        it('should handle empty ASACI response', async () => {
            // Arrange
            const mockResponse = { data: [], meta: { total: 0 } };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(0);
        });

        it('should handle ASACI service errors', async () => {
            // Arrange
            const error = new Error('ASACI service unavailable');
            mockAsaciService.getProductionRequests.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getEditionRequestFromAsaci())
                .rejects.toThrow('Failed to retrieve attestations: ASACI service unavailable');
        });
    });

    describe('getStoredAsaciRequests', () => {
        it('should get stored requests with filters', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const filters = {
                status: AsaciRequestStatus.COMPLETED,
                certificateType: 'cima',
                limit: 25,
                offset: 10
            };
            const mockRequests = [createMockAsaciRequest(), createMockAsaciRequest()];
            MockedAsaciRequestModel.findAll.mockResolvedValue(mockRequests);
            MockedAsaciRequestModel.count.mockResolvedValue(50);

            // Act
            const result = await service.getStoredAsaciRequests(userId, filters);

            // Assert
            expect(MockedAsaciRequestModel.findAll).toHaveBeenCalledWith({
                where: {
                    userId,
                    status: AsaciRequestStatus.COMPLETED,
                    certificateType: 'cima'
                },
                order: [['createdAt', 'DESC']],
                limit: 25,
                offset: 10
            });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockRequests);
            expect(result.pagination.hasMore).toBe(true);
        });

        it('should use default filters when not provided', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const mockRequests = [createMockAsaciRequest()];
            MockedAsaciRequestModel.findAll.mockResolvedValue(mockRequests);
            MockedAsaciRequestModel.count.mockResolvedValue(1);

            // Act
            const result = await service.getStoredAsaciRequests(userId);

            // Assert
            expect(MockedAsaciRequestModel.findAll).toHaveBeenCalledWith({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit: 50,
                offset: 0
            });
            expect(result.pagination.hasMore).toBe(false);
        });

        it('should handle database errors', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Database connection failed');
            MockedAsaciRequestModel.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getStoredAsaciRequests(userId))
                .rejects.toThrow('Database connection failed');
        });
    });

    describe('getAsaciRequestById', () => {
        it('should get request by ID successfully', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest();
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getAsaciRequestById(requestId, userId);

            // Assert
            expect(MockedAsaciRequestModel.findOne).toHaveBeenCalledWith({
                where: { id: requestId, userId }
            });
            expect(result).toEqual(mockRequest);
        });

        it('should return null for non-existent request', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            MockedAsaciRequestModel.findOne.mockResolvedValue(null);

            // Act
            const result = await service.getAsaciRequestById(requestId, userId);

            // Assert
            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Database query failed');
            MockedAsaciRequestModel.findOne.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getAsaciRequestById(requestId, userId))
                .rejects.toThrow('Database query failed');
        });
    });

    describe('downloadCertificate', () => {
        it('should download certificate successfully', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                certificateUrl: 'https://example.com/cert.pdf',
                downloadCount: 5
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.downloadCertificate(requestId, userId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.certificateUrl).toBe('https://example.com/cert.pdf');
            expect(result.downloadCount).toBe(6);
            expect(mockRequest.incrementDownloadCount).toHaveBeenCalled();
        });

        it('should throw error for non-existent request', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            MockedAsaciRequestModel.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.downloadCertificate(requestId, userId))
                .rejects.toThrow('ASACI request not found');
        });

        it('should throw error when certificate URL is not available', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({ certificateUrl: null });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act & Assert
            await expect(service.downloadCertificate(requestId, userId))
                .rejects.toThrow('Certificate URL not available');
        });
    });

    describe('getEditionRequestDownloadLink', () => {
        it('should get download link from database', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/cert.pdf',
                downloadCount: 3
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.source).toBe('database');
            expect(result.downloadLink).toBe('https://example.com/cert.pdf');
            expect(mockRequest.incrementDownloadCount).toHaveBeenCalled();
        });

        it('should return failure when certificate not found', async () => {
            // Arrange
            const certificateReference = 'CERT-NONEXISTENT';
            const userId = TEST_DATA.VALID_UUID;
            MockedAsaciRequestModel.findOne.mockResolvedValue(null);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Certificate not found in database');
        });

        it('should handle database errors', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Database connection failed');
            MockedAsaciRequestModel.findOne.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getEditionRequestDownloadLink(certificateReference, userId))
                .rejects.toThrow('Failed to retrieve certificate download link: Database connection failed');
        });
    });

    describe('getBatchCertificateDownloadLinks', () => {
        it('should process batch requests successfully', async () => {
            // Arrange
            const certificateReferences = ['CERT-001', 'CERT-002', 'CERT-003'];
            const userId = TEST_DATA.VALID_UUID;

            jest.spyOn(service, 'getEditionRequestDownloadLink')
                .mockImplementation((ref) => {
                    if (ref === 'CERT-003') {
                        return Promise.reject(new Error('Certificate not found'));
                    }
                    return Promise.resolve({ success: true, downloadLink: `https://example.com/${ref}.pdf` } as any);
                });

            // Act
            const result = await service.getBatchCertificateDownloadLinks(certificateReferences, userId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.summary).toEqual({
                total: 3,
                successful: 2,
                failed: 1
            });
            expect(result.results).toHaveLength(2);
            expect(result.errors).toHaveLength(1);
        });

        it('should handle empty certificate references', async () => {
            // Arrange
            const certificateReferences: string[] = [];
            const userId = TEST_DATA.VALID_UUID;

            // Act
            const result = await service.getBatchCertificateDownloadLinks(certificateReferences, userId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.summary.total).toBe(0);
        });
    });

    describe('getUserStatistics', () => {
        it('should get user statistics successfully', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const mockStats = createMockStatistics();
            MockedAsaciRequestModel.getStatsByUser.mockResolvedValue(mockStats);

            // Act
            const result = await service.getUserStatistics(userId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockStats);
            expect(result.timestamp).toBeDefined();
        });

        it('should handle database errors', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Statistics query failed');
            MockedAsaciRequestModel.getStatsByUser.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getUserStatistics(userId))
                .rejects.toThrow('Statistics query failed');
        });
    });

    describe('getOrassStatistics', () => {
        it('should get ORASS statistics successfully', async () => {
            // Arrange
            const mockResult = createMockOrassQueryResult({ totalCount: 1500 });
            mockOrassService.searchPolicies.mockResolvedValue(mockResult);

            // Act
            const result = await service.getOrassStatistics();

            // Assert
            expect(result.totalPolicies).toBe(1500);
            expect(result.lastUpdated).toBeDefined();
        });

        it('should handle ORASS service errors', async () => {
            // Arrange
            const error = new Error('ORASS service unavailable');
            mockOrassService.searchPolicies.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getOrassStatistics())
                .rejects.toThrow('ORASS service unavailable');
        });
    });
});