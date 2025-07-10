import { AsaciProductionService } from '@services/asaci-production.service';
import { logger } from '@utils/logger';
import {
    OrassPolicySearchCriteria,
    OrassQueryResult,
    CreateEditionFromOrassDataRequest,
} from '@dto/orass.dto';
import {
    SearchOrassPoliciesDto,
} from '@dto/certify-link.dto';
import {OrassService} from "@services/orass.service";
import AsaciRequestModel, {AsaciRequestCreationAttributes, AsaciRequestStatus} from "@models/asaci-request.model";
import OperationLogModel, {OperationStatus, OperationType} from "@models/operation-log.model";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";
import {AsaciResponsePayload} from "@interfaces/asaci.interfaces";

export class CertifyLinkService {
    constructor(
        private readonly orassService: OrassService,
        private readonly asaciProductionService: AsaciProductionService
    ) {}

    /**
     * Search ORASS policies based on criteria
     */
    async searchOrassPolicies(searchDto: SearchOrassPoliciesDto): Promise<OrassQueryResult> {
        try {
            const criteria: OrassPolicySearchCriteria = {
                policyNumber: searchDto.policyNumber,
                applicantCode: searchDto.applicantCode,
                endorsementNumber: searchDto.endorsementNumber,
                organizationCode: searchDto.organizationCode,
                officeCode: searchDto.officeCode
            };

            const result = await this.orassService.searchPolicies(
                criteria,
                searchDto.limit || 100,
                searchDto.offset || 0
            );

            logger.info('ORASS policies search completed', {
                criteria,
                foundPolicies: result.policies.length,
                totalCount: result.totalCount
            });

            return result;
        } catch (error: any) {
            logger.error('Failed to search ORASS policies:', error);
            throw error;
        }
    }

    /**
     * Create ASACI certificate production from ORASS policy and store in a database
     */
    async createEditionRequest(
        createProductionRequest: CreateEditionFromOrassDataRequest,
        userId: string
    ): Promise<any> {
        const startTime = Date.now();
        let asaciRequest: AsaciRequestModel | null = null;

        try {
            // Create an initial database record
            const asaciRequestData: AsaciRequestCreationAttributes = {
                userId,
                officeCode: createProductionRequest.officeCode,
                organizationCode: createProductionRequest.organizationCode,
                certificateType: createProductionRequest.certificateType,
                emailNotification: createProductionRequest.emailNotification,
                generatedBy: createProductionRequest.generatedBy,
                channel: createProductionRequest.channel || 'web',
                status: AsaciRequestStatus.ORASS_FETCHING
            };

            asaciRequest = await AsaciRequestModel.create(asaciRequestData);

            // Log the start of the operation
            await OperationLogModel.logOrassOperation(
                userId,
                asaciRequest.id,
                OperationStatus.STARTED,
                undefined,
                { policyNumber: createProductionRequest.policyNumber }
            );

            // Update status to ORASS_FETCHED (simulate ORASS data fetch)
            await asaciRequest.setOrassData(
                createProductionRequest.policyNumber,
                createProductionRequest
            );

            // Convert to ASACI production request
            const productionData = createProductionRequest.toAsaciProductionRequest();

            // Store the request payload
            await asaciRequest.setAsaciRequest(productionData);

            // Call ASACI service
            const result = await this.asaciProductionService.createProductionRequest(productionData);

            // Store the response
            await asaciRequest.setAsaciResponse(
                result.data?.reference || result.data?.id,
                result
            );

            // Mark as completed if successful
            if (result.status === 201 && result.data) {
                const certificateUrl = result.data.download_link ||
                    (result.data.certificates && result.data.certificates[0]?.download_link);

                await asaciRequest.markAsCompleted(certificateUrl, result.data);

                // Log successful completion
                const executionTime = Date.now() - startTime;
                await OperationLogModel.logAsaciOperation(
                    userId,
                    asaciRequest.id,
                    OperationType.ASACI_REQUEST,
                    OperationStatus.SUCCESS,
                    'POST',
                    ASACI_ENDPOINTS.PRODUCTIONS,
                    executionTime,
                    productionData,
                    result,
                    result.status
                );
            }

            logger.info('Certificate production created from ORASS policy', {
                policyNumber: createProductionRequest.policyNumber,
                certificateType: createProductionRequest.certificateType,
                productionReference: result.data?.reference || 'N/A',
                asaciRequestId: asaciRequest.id
            });

            return {
                success: true,
                asaciRequestId: asaciRequest.id,
                productionData,
                asaciResult: result,
                message: 'Certificate production created successfully'
            };

        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            if (asaciRequest) {
                await asaciRequest.markAsFailed(error.message, {
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });

                // Log the failure
                await OperationLogModel.logAsaciOperation(
                    userId,
                    asaciRequest.id,
                    OperationType.ASACI_REQUEST,
                    OperationStatus.FAILED,
                    'POST',
                    ASACI_ENDPOINTS.PRODUCTIONS,
                    executionTime,
                    undefined,
                    undefined,
                    undefined,
                    error
                );
            }

            logger.error('Failed to create certificate from ORASS policy:', error);
            throw error;
        }
    }

    /**
     * Get attestations from ASACI API filtered by generated_id and other criteria
     */
    async getEditionRequestFromAsaci(): Promise<any> {
        const startTime = Date.now();

        try {
            const result = await this.asaciProductionService.getProductionRequests();
            let filteredData: any[] = [];

            if (result.data && Array.isArray(result.data)) {
                filteredData = result.data.filter((attestation: any) => {
                    return attestation.user.username === process.env.ASACI_GENERATED_BY;
                });
            }

            const executionTime = Date.now() - startTime;

            logger.info('Successfully retrieved attestations from ASACI', {
                totalCount: Array.isArray(result.data) ? result.data.length : 0,
                filteredCount: Array.isArray(filteredData) ? filteredData.length : 0,
                executionTime,
                generated_id: process.env.ASACI_GENERATED_BY
            });

            return {
                success: true,
                data: filteredData,
                pagination: result.meta || {
                    total: Array.isArray(filteredData) ? filteredData.length : 0,
                    path: result.meta.path,
                    perPage: result.meta.per_page,
                    nextCursor: result.meta.next_cursor,
                    prevCursor: result.meta.prev_cursor,
                },
                metadata: {
                    executionTime,
                    filteredBy: process.env.ASACI_GENERATED_BY ? 'generated_id' : null,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            logger.error('Failed to get attestations from ASACI:', {
                error: error.message,
                executionTime
            });

            throw new Error(`Failed to retrieve attestations: ${error.message}`);
        }
    }

    /**
     * Get stored ASACI requests by the user with optional filtering
     */
    async getStoredAsaciRequests(
        userId: string,
        filters?: {
            status?: AsaciRequestStatus;
            certificateType?: string;
            limit?: number;
            offset?: number;
        }
    ): Promise<any> {
        try {
            const whereClause: any = { userId };

            if (filters?.status) {
                whereClause.status = filters.status;
            }

            if (filters?.certificateType) {
                whereClause.certificateType = filters.certificateType;
            }

            const requests = await AsaciRequestModel.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit: filters?.limit || 50,
                offset: filters?.offset || 0
            });

            const totalCount = await AsaciRequestModel.count({ where: whereClause });

            return {
                success: true,
                data: requests,
                pagination: {
                    total: totalCount,
                    limit: filters?.limit || 50,
                    offset: filters?.offset || 0,
                    hasMore: (filters?.offset || 0) + requests.length < totalCount
                }
            };

        } catch (error: any) {
            logger.error('Failed to get stored ASACI requests:', error);
            throw error;
        }
    }

    /**
     * Get ASACI request by ID
     */
    async getAsaciRequestById(requestId: string, userId: string): Promise<AsaciRequestModel | null> {
        try {
            const request = await AsaciRequestModel.findOne({
                where: { id: requestId, userId }
            });

            if (request) {
                logger.info('Retrieved ASACI request by ID', {
                    requestId,
                    userId,
                    status: request.status
                });
            }

            return request;
        } catch (error: any) {
            logger.error('Failed to get ASACI request by ID:', error);
            throw error;
        }
    }

    /**
     * Download certificate and update download count
     */
    async downloadCertificate(requestId: string, userId: string): Promise<any> {
        try {
            const request = await this.getAsaciRequestById(requestId, userId);

            if (!request) {
                throw new Error('ASACI request not found');
            }

            if (!request.certificateUrl) {
                throw new Error('Certificate URL not available');
            }

            // Increment download count
            await request.incrementDownloadCount();

            // Log download operation
            await OperationLogModel.logAsaciOperation(
                userId,
                requestId,
                OperationType.ASACI_DOWNLOAD,
                OperationStatus.SUCCESS,
                'GET',
                request.certificateUrl
            );

            return {
                success: true,
                certificateUrl: request.certificateUrl,
                downloadCount: request.downloadCount ? request.downloadCount + 1 : 0,
                message: 'Certificate download initiated'
            };

        } catch (error: any) {
            logger.error('Failed to download certificate:', error);

            // Log download failure
            await OperationLogModel.logAsaciOperation(
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

            throw error;
        }
    }

    /**
     * Get a certificate download link by ASACI certificate reference/ID
     */
    async getEditionRequestDownloadLink(certificateReference: string, userId?: string): Promise<any> {
        const startTime = Date.now();

        try {
            logger.info('Fetching certificate download link from ASACI', {
                certificateReference,
                userId
            });

            // Try to find the certificate in our database first
            let storedRequest: AsaciRequestModel | null = null;
            if (userId) {
                storedRequest = await AsaciRequestModel.findOne({
                    where: {
                        userId,
                        asaciReference: certificateReference
                    }
                });
            }

            // If found in the database and has a download link, return it
            if (storedRequest && storedRequest.certificateUrl) {
                await storedRequest.incrementDownloadCount();

                let certDownloadLink: string | null = null;

                try {
                    const responsePayload = storedRequest.asaciResponsePayload as AsaciResponsePayload;
                    if (responsePayload && typeof responsePayload === 'object') {
                        if (
                            responsePayload.data &&
                            Array.isArray(responsePayload.data.certificates) &&
                            responsePayload.data.certificates.length > 0
                        ) {
                            certDownloadLink = responsePayload.data.certificates[0].download_link;
                        }

                        // Optionally, fallback to the production download link
                        if (!certDownloadLink && responsePayload.data?.download_link) {
                            certDownloadLink = responsePayload.data.download_link;
                        }
                    }
                } catch (jsonError : any) {
                    logger.warn('Failed to parse asaciResponsePayload JSON', {
                        certificateReference,
                        requestId: storedRequest.id,
                        error: jsonError.message
                    });

                    certDownloadLink = storedRequest.certificateUrl;
                }

                await storedRequest.reload();

                logger.info('Certificate download link retrieved from database', {
                    certificateReference,
                    requestId: storedRequest.id,
                    downloadCount: storedRequest.downloadCount
                });

                return {
                    success: true,
                    source: 'database',
                    certificateReference,
                    downloadLink: certDownloadLink || storedRequest.certificateUrl,
                    downloadCount: storedRequest.downloadCount,
                    asaciRequestId: storedRequest.id,
                    message: 'Certificate download link retrieved from database'
                };
            }

            logger.info('Certificate not found in database', {
                certificateReference,
                userId
            });

            return {
                success: false,
                source: 'database',
                certificateReference,
                message: 'Certificate not found in database',
                downloadLink: null
            };

        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            logger.error('Failed to get certificate download link:', {
                error: error.message,
                stack: error.stack,
                certificateReference,
                userId,
                executionTime
            });

            // Log the failure
            if (userId) {
                try {
                    const storedRequest = await AsaciRequestModel.findOne({
                        where: { userId, asaciReference: certificateReference }
                    });

                    if (storedRequest) {
                        await OperationLogModel.logAsaciOperation(
                            userId,
                            storedRequest.id,
                            OperationType.ASACI_DOWNLOAD,
                            OperationStatus.FAILED,
                            'GET',
                            ASACI_ENDPOINTS.CERTIFICATES_DOWNLOAD.replace('{certificate_reference}', certificateReference),
                            executionTime,
                            { certificateReference },
                            undefined,
                            undefined,
                            error
                        );
                    }
                } catch (logError : any) {
                    logger.error('Failed to log operation failure:', {
                        error: logError.message,
                        originalError: error.message,
                        certificateReference,
                        userId
                    });
                }
            }

            throw new Error(`Failed to retrieve certificate download link: ${error.message}`);
        }
    }

    /**
     * Batch get certificate download links by multiple ASACI certificate references
     */
    async getBatchCertificateDownloadLinks(
        certificateReferences: string[],
        userId?: string
    ): Promise<any> {
        try {
            logger.info('Fetching batch certificate download links', {
                count: certificateReferences.length,
                certificateReferences,
                userId
            });

            const results = await Promise.allSettled(
                certificateReferences.map(ref =>
                    this.getEditionRequestDownloadLink(ref, userId)
                )
            );

            const successful: any[] = [];
            const failed: any[] = [];

            results.forEach((result, index) => {
                const certificateReference = certificateReferences[index];

                if (result.status === 'fulfilled') {
                    successful.push(result.value);
                } else {
                    failed.push({
                        certificateReference,
                        error: result.reason.message,
                        success: false
                    });
                }
            });

            logger.info('Batch certificate download links completed', {
                total: certificateReferences.length,
                successful: successful.length,
                failed: failed.length
            });

            return {
                success: true,
                summary: {
                    total: certificateReferences.length,
                    successful: successful.length,
                    failed: failed.length
                },
                results: successful,
                errors: failed.length > 0 ? failed : undefined,
                message: `Batch operation completed. ${successful.length} successful, ${failed.length} failed.`
            };

        } catch (error: any) {
            logger.error('Failed batch certificate download links operation:', error);
            throw error;
        }
    }

    /**
     * Get statistics for user's ASACI requests
     */
    async getUserStatistics(userId: string): Promise<any> {
        try {
            const stats = await AsaciRequestModel.getStatsByUser(userId, AsaciRequestModel.sequelize!);

            return {
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            logger.error('Failed to get user statistics:', error);
            throw error;
        }
    }

    /**
     * Get statistics about ORASS policies
     */
    async getOrassStatistics(): Promise<any> {
        try {
            // Get basic statistics - this could be expanded based on requirements
            const totalPolicies = await this.orassService.searchPolicies({}, 1);

            return {
                totalPolicies: totalPolicies.totalCount,
                lastUpdated: new Date().toISOString()
            };
        } catch (error: any) {
            logger.error('Failed to get ORASS statistics:', error);
            throw error;
        }
    }
}