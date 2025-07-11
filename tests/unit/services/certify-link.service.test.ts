import { jest } from '@jest/globals';
import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciProductionService } from '@services/asaci-production.service';
import { OrassService } from '@services/orass.service';
import AsaciRequestModel, { AsaciRequestStatus } from '@models/asaci-request.model';
import OperationLogModel, { OperationStatus, OperationType } from '@models/operation-log.model';
import { logger } from '@utils/logger';
import { ASACI_ENDPOINTS } from '@config/asaci-endpoints';
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
} from '../../utils/test.utils';

// Mock dependencies
jest.mock('@services/asaci-production.service');
jest.mock('@services/orass.service');
jest.mock('@models/asaci-request.model');
jest.mock('@models/operation-log.model');
jest.mock('@utils/logger');

const MockedAsaciProductionService = AsaciProductionService as jest.MockedClass<typeof AsaciProductionService>;
const MockedOrassService = OrassService as jest.MockedClass<typeof OrassService>;
const MockedAsaciRequestModel = AsaciRequestModel as jest.MockedClass<typeof AsaciRequestModel>;
const MockedOperationLogModel = OperationLogModel as jest.MockedClass<typeof OperationLogModel>;

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
        jest.mocked(MockedOperationLogModel.logOrassOperation).mockResolvedValue(undefined as any);
        jest.mocked(MockedOperationLogModel.logAsaciOperation).mockResolvedValue(undefined as any);
    };

    describe('constructor', () => {
        it('should initialize with provided services', () => {
            expect(service).toBeInstanceOf(CertifyLinkService);
            expect((service as any).orassService).toBe(mockOrassService);
            expect((service as any).asaciProductionService).toBe(mockAsaciService);
        });
    });

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

        it('should map all search criteria correctly', async () => {
            // Arrange
            const searchDto = createValidSearchOrassPoliciesDto({
                policyNumber: 'POL123',
                applicantCode: 'APP456',
                endorsementNumber: 'END789',
                organizationCode: 'ORG001',
                officeCode: 'OFF002'
            });
            const expectedResult = createMockOrassQueryResult();
            mockOrassService.searchPolicies.mockResolvedValue(expectedResult);

            // Act
            await service.searchOrassPolicies(searchDto);

            // Assert
            expect(mockOrassService.searchPolicies).toHaveBeenCalledWith(
                {
                    policyNumber: 'POL123',
                    applicantCode: 'APP456',
                    endorsementNumber: 'END789',
                    organizationCode: 'ORG001',
                    officeCode: 'OFF002'
                },
                expect.any(Number),
                expect.any(Number)
            );
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

        it('should handle certificate URL from certificates array', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse({
                status: 201,
                data: {
                    reference: 'CERT-12345',
                    certificates: [{ download_link: 'https://example.com/cert-from-array.pdf' }]
                }
            });
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(mockAsaciRequest.markAsCompleted).toHaveBeenCalledWith(
                'https://example.com/cert-from-array.pdf',
                mockResponse.data
            );
        });

        it('should log ORASS operation start', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse();
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(MockedOperationLogModel.logOrassOperation).toHaveBeenCalledWith(
                userId,
                mockAsaciRequest.id,
                OperationStatus.STARTED,
                undefined,
                { policyNumber: createRequest.policyNumber }
            );
        });

        it('should log successful ASACI operation', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse({ status: 201 });
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(MockedOperationLogModel.logAsaciOperation).toHaveBeenCalledWith(
                userId,
                mockAsaciRequest.id,
                OperationType.ASACI_REQUEST,
                OperationStatus.SUCCESS,
                'POST',
                ASACI_ENDPOINTS.PRODUCTIONS,
                expect.any(Number),
                expect.any(Object),
                mockResponse,
                201
            );
        });

        it('should log failed ASACI operation', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('ASACI service failed');
            mockAsaciService.createProductionRequest.mockRejectedValue(error);

            // Act & Assert
            await expect(service.createEditionRequest(createRequest, userId))
                .rejects.toThrow('ASACI service failed');

            expect(MockedOperationLogModel.logAsaciOperation).toHaveBeenCalledWith(
                userId,
                mockAsaciRequest.id,
                OperationType.ASACI_REQUEST,
                OperationStatus.FAILED,
                'POST',
                ASACI_ENDPOINTS.PRODUCTIONS,
                expect.any(Number),
                undefined,
                undefined,
                undefined,
                error
            );
        });

        it('should handle non-201 status response', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse({ status: 400 });
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            const result = await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(mockAsaciRequest.markAsCompleted).not.toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.asaciResult.status).toBe(400);
        });

        it('should set ORASS data and ASACI request data', async () => {
            // Arrange
            const createRequest = createValidCreateEditionFromOrassDataRequest();
            const userId = TEST_DATA.VALID_UUID;
            const mockResponse = createMockAsaciResponse();
            mockAsaciService.createProductionRequest.mockResolvedValue(mockResponse);

            // Act
            await service.createEditionRequest(createRequest, userId);

            // Assert
            expect(mockAsaciRequest.setOrassData).toHaveBeenCalledWith(
                createRequest.policyNumber,
                createRequest
            );
            expect(mockAsaciRequest.setAsaciRequest).toHaveBeenCalled();
            expect(mockAsaciRequest.setAsaciResponse).toHaveBeenCalled();
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
                meta: { 
                    total: 2, 
                    per_page: 10,
                    path: '/api/productions',
                    next_cursor: null,
                    prev_cursor: null
                }
            };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].user.username).toBe('test-generator');
            expect(result.metadata.filteredBy).toBe('generated_id');
            expect(result.pagination.path).toBe('/api/productions');
        });

        it('should handle empty ASACI response', async () => {
            // Arrange
            const mockResponse = { 
                data: [], 
                meta: { 
                    total: 0,
                    per_page: 10,
                    path: '/api/productions',
                    next_cursor: null,
                    prev_cursor: null
                }
            };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle ASACI service errors', async () => {
            // Arrange
            const error = new Error('ASACI service unavailable');
            mockAsaciService.getProductionRequests.mockRejectedValue(error);

            // Act & Assert
            await expect(service.getEditionRequestFromAsaci())
                .rejects.toThrow('Failed to retrieve attestations: ASACI service unavailable');
        });

        it('should handle non-array data response', async () => {
            // Arrange
            const mockResponse = { 
                data: null,
                meta: { total: 0 }
            };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle missing ASACI_GENERATED_BY environment variable', async () => {
            // Arrange
            delete process.env.ASACI_GENERATED_BY;
            const mockResponse = {
                data: [{ id: 1, user: { username: 'test-user' } }],
                meta: { total: 1 }
            };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
            expect(result.metadata.filteredBy).toBeNull();
        });

        it('should include execution time in metadata', async () => {
            // Arrange
            const mockResponse = { data: [], meta: { total: 0 } };
            mockAsaciService.getProductionRequests.mockResolvedValue(mockResponse);

            // Act
            const result = await service.getEditionRequestFromAsaci();

            // Assert
            expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
            expect(result.metadata.timestamp).toBeDefined();
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

        it('should filter by status only', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const filters = { status: AsaciRequestStatus.ASACI_PENDING };
            MockedAsaciRequestModel.findAll.mockResolvedValue([]);
            MockedAsaciRequestModel.count.mockResolvedValue(0);

            // Act
            await service.getStoredAsaciRequests(userId, filters);

            // Assert
            expect(MockedAsaciRequestModel.findAll).toHaveBeenCalledWith({
                where: { userId, status: AsaciRequestStatus.ASACI_PENDING },
                order: [['createdAt', 'DESC']],
                limit: 50,
                offset: 0
            });
        });

        it('should filter by certificate type only', async () => {
            // Arrange
            const userId = TEST_DATA.VALID_UUID;
            const filters = { certificateType: 'original' };
            MockedAsaciRequestModel.findAll.mockResolvedValue([]);
            MockedAsaciRequestModel.count.mockResolvedValue(0);

            // Act
            await service.getStoredAsaciRequests(userId, filters);

            // Assert
            expect(MockedAsaciRequestModel.findAll).toHaveBeenCalledWith({
                where: { userId, certificateType: 'original' },
                order: [['createdAt', 'DESC']],
                limit: 50,
                offset: 0
            });
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
            expect(logger.info).toHaveBeenCalledWith('Retrieved ASACI request by ID', {
                requestId,
                userId,
                status: mockRequest.status
            });
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
            expect(logger.info).not.toHaveBeenCalledWith('Retrieved ASACI request by ID', expect.any(Object));
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
            expect(logger.error).toHaveBeenCalledWith('Failed to get ASACI request by ID:', error);
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
            expect(MockedOperationLogModel.logAsaciOperation).toHaveBeenCalledWith(
                userId,
                requestId,
                OperationType.ASACI_DOWNLOAD,
                OperationStatus.SUCCESS,
                'GET',
                'https://example.com/cert.pdf'
            );
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

        it('should handle download count when it is null', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                certificateUrl: 'https://example.com/cert.pdf',
                downloadCount: null
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.downloadCertificate(requestId, userId);

            // Assert
            expect(result.downloadCount).toBe(0);
        });

        it('should log download failure', async () => {
            // Arrange
            const requestId = TEST_DATA.VALID_UUID;
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Download failed');
            MockedAsaciRequestModel.findOne.mockRejectedValue(error);

            // Act & Assert
            await expect(service.downloadCertificate(requestId, userId))
                .rejects.toThrow('Download failed');

            expect(MockedOperationLogModel.logAsaciOperation).toHaveBeenCalledWith(
                userId,
                requestId,
                OperationType.ASACI_DOWNLOAD,
                OperationStatus.FAILED,
                'GET',
                '',
                undefined,
                undefined,
                undefined,
                undefined,
                error
            );
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
            expect(mockRequest.reload).toHaveBeenCalled();
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
            expect(result.downloadLink).toBeNull();
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

        it('should work without userId', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference);

            // Assert
            expect(MockedAsaciRequestModel.findOne).not.toHaveBeenCalled();
            expect(result.success).toBe(false);
        });

        it('should extract download link from asaciResponsePayload certificates array', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/fallback.pdf',
                asaciResponsePayload: {
                    data: {
                        certificates: [{ download_link: 'https://example.com/cert-from-payload.pdf' }]
                    }
                }
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.downloadLink).toBe('https://example.com/cert-from-payload.pdf');
        });

        it('should fallback to production download link from payload', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/fallback.pdf',
                asaciResponsePayload: {
                    data: {
                        download_link: 'https://example.com/production-link.pdf'
                    }
                }
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.downloadLink).toBe('https://example.com/production-link.pdf');
        });

        it('should handle logging errors when request is found but operation logging fails', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({ asaciReference: certificateReference });
            const operationError = new Error('Operation error');
            const logError = new Error('Log error');

            // First call succeeds to find the request
            MockedAsaciRequestModel.findOne
                .mockResolvedValueOnce(mockRequest)
                .mockResolvedValueOnce(mockRequest); // Second call for logging also succeeds

            // Mock incrementDownloadCount to throw an error
            mockRequest.incrementDownloadCount.mockRejectedValue(operationError);

            // Mock the logging operation to also fail
            MockedOperationLogModel.logAsaciOperation.mockRejectedValue(logError);

            // Act & Assert
            await expect(service.getEditionRequestDownloadLink(certificateReference, userId))
                .rejects.toThrow('Failed to retrieve certificate download link: Operation error');

            expect(logger.error).toHaveBeenCalledWith('Failed to log operation failure:', expect.objectContaining({
                error: 'Log error',
                originalError: 'Operation error',
                certificateReference,
                userId
            }));
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
            expect(result.errors[0]).toEqual({
                certificateReference: 'CERT-003',
                error: 'Certificate not found',
                success: false
            });
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
            expect(result.summary.successful).toBe(0);
            expect(result.summary.failed).toBe(0);
            expect(result.results).toHaveLength(0);
            expect(result.errors).toBeUndefined();
        });

        it('should handle all successful requests', async () => {
            // Arrange
            const certificateReferences = ['CERT-001', 'CERT-002'];
            const userId = TEST_DATA.VALID_UUID;

            jest.spyOn(service, 'getEditionRequestDownloadLink')
                .mockResolvedValue({ success: true, downloadLink: 'https://example.com/cert.pdf' } as any);

            // Act
            const result = await service.getBatchCertificateDownloadLinks(certificateReferences, userId);

            // Assert
            expect(result.summary.failed).toBe(0);
            expect(result.errors).toBeUndefined();
        });

        it('should handle all failed requests', async () => {
            // Arrange
            const certificateReferences = ['CERT-001', 'CERT-002'];
            const userId = TEST_DATA.VALID_UUID;

            jest.spyOn(service, 'getEditionRequestDownloadLink')
                .mockRejectedValue(new Error('All failed'));

            // Act
            const result = await service.getBatchCertificateDownloadLinks(certificateReferences, userId);

            // Assert
            expect(result.summary.successful).toBe(0);
            expect(result.summary.failed).toBe(2);
            expect(result.errors).toHaveLength(2);
        });

        it('should work without userId', async () => {
            // Arrange
            const certificateReferences = ['CERT-001'];

            jest.spyOn(service, 'getEditionRequestDownloadLink')
                .mockResolvedValue({ success: true } as any);

            // Act
            const result = await service.getBatchCertificateDownloadLinks(certificateReferences);

            // Assert
            expect(result.success).toBe(true);
            expect(service.getEditionRequestDownloadLink).toHaveBeenCalledWith('CERT-001', undefined);
        });

        it('should handle service-level errors', async () => {
            // Arrange
            const certificateReferences = ['CERT-001'];
            const userId = TEST_DATA.VALID_UUID;
            const error = new Error('Service error');

            // Mock Promise.allSettled to throw
            jest.spyOn(Promise, 'allSettled').mockRejectedValue(error);

            // Act & Assert
            await expect(service.getBatchCertificateDownloadLinks(certificateReferences, userId))
                .rejects.toThrow('Service error');

            expect(logger.error).toHaveBeenCalledWith('Failed batch certificate download links operation:', error);

            // Restore Promise.allSettled
            (Promise.allSettled as jest.Mock).mockRestore();
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
            expect(MockedAsaciRequestModel.getStatsByUser).toHaveBeenCalledWith(userId, AsaciRequestModel.sequelize);
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
            expect(logger.error).toHaveBeenCalledWith('Failed to get user statistics:', error);
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
            expect(mockOrassService.searchPolicies).toHaveBeenCalledWith({}, 1);
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
            expect(logger.error).toHaveBeenCalledWith('Failed to get ORASS statistics:', error);
        });
    });

    describe('error handling and edge cases', () => {
        it('should handle null asaciResponsePayload gracefully', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/cert.pdf',
                asaciResponsePayload: null
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.downloadLink).toBe('https://example.com/cert.pdf');
        });

        it('should handle empty certificates array in payload', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/cert.pdf',
                asaciResponsePayload: {
                    data: {
                        certificates: []
                    }
                }
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.downloadLink).toBe('https://example.com/cert.pdf');
        });

        it('should handle missing data in payload', async () => {
            // Arrange
            const certificateReference = 'CERT-12345';
            const userId = TEST_DATA.VALID_UUID;
            const mockRequest = createMockAsaciRequest({
                asaciReference: certificateReference,
                certificateUrl: 'https://example.com/cert.pdf',
                asaciResponsePayload: {}
            });
            MockedAsaciRequestModel.findOne.mockResolvedValue(mockRequest);

            // Act
            const result = await service.getEditionRequestDownloadLink(certificateReference, userId);

            // Assert
            expect(result.downloadLink).toBe('https://example.com/cert.pdf');
        });
    });
});