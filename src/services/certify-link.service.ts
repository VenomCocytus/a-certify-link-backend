import { AsaciProductionService } from '@services/asaci-production.service';
import { logger } from '@utils/logger';
import {
    OrassPolicySearchCriteria,
    OrassQueryResult,
    CERTIFICATE_COLOR_MAP, CreateEditionFromOrassDataRequest,
} from '@dto/orass.dto';
import {
    SearchOrassPoliciesDto,
} from '@dto/certify-link.dto';
import {OrassService} from "@services/orass-database.service";
import AsaciRequestModel, {AsaciRequestCreationAttributes, AsaciRequestStatus} from "@models/asaci-request.model";
import OperationLogModel, {OperationStatus, OperationType} from "@models/operation-log.model";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";

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
     * Create ASACI certificate production from ORASS policy
     */
    // async createEditionRequest(createProductionRequest: CreateEditionFromOrassDataRequest): Promise<any> {
    //     try {
    //         const productionData = createProductionRequest.toAsaciProductionRequest();
    //         const result = await this.asaciProductionService.createProductionRequest(productionData);
    //
    //         logger.info('Certificate production created from ORASS policy', {
    //             policyNumber: createProductionRequest.policyNumber,
    //             certificateType: createProductionRequest.certificateType,
    //             productionReference: result.reference || 'N/A'
    //         });
    //
    //         return {
    //             success: true,
    //             productionData,
    //             asaciResult: result,
    //             message: 'Certificate production created successfully'
    //         };
    //
    //     } catch (error: any) {
    //         logger.error('Failed to create certificate from ORASS policy:', error);
    //         throw error;
    //     }
    // }

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
            // Create initial database record
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
    async getAttestationsFromAsaci(): Promise<any> {
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
                downloadCount: request.downloadCount + 1,
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
    async getCertificateDownloadLink(certificateReference: string, userId?: string): Promise<any> {
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

                // Safely extract the certificate download link
                let certDownloadLink = null;
                if (
                    storedRequest.asaciResponsePayload &&
                    storedRequest.asaciResponsePayload.data &&
                    Array.isArray(storedRequest.asaciResponsePayload.data.certificates) &&
                    storedRequest.asaciResponsePayload.data.certificates.length > 0
                ) {
                    certDownloadLink = storedRequest.asaciResponsePayload.data.certificates[0].download_link;
                }

                // Optionally, fallback to the production download link
                if (!certDownloadLink && storedRequest?.asaciResponsePayload?.data.download_link) {
                    certDownloadLink = storedRequest.asaciResponsePayload.data.download_link;
                }

                logger.info('Certificate download link retrieved from database', {
                    certificateReference,
                    requestId: storedRequest.id,
                    downloadCount: storedRequest.downloadCount + 1
                });

                return {
                    success: true,
                    source: 'database',
                    certificateReference,
                    downloadLink: certDownloadLink,
                    downloadCount: storedRequest.downloadCount + 1,
                    asaciRequestId: storedRequest.id,
                    message: 'Certificate download link retrieved from database'
                };
            }

            // // If not in database or no download link, fetch from ASACI API
            // const endpoint = ASACI_ENDPOINTS.CERTIFICATES_DOWNLOAD.replace('{certificate_reference}', certificateReference);
            //
            // logger.info('Fetching certificate download link from ASACI API', {
            //     endpoint,
            //     certificateReference
            // });
            //
            // const response = await this.downloadCertificate(userId, userId);
            //
            // const executionTime = Date.now() - startTime;
            //
            // // Log the operation
            // if (userId && storedRequest) {
            //     await OperationLogModel.logAsaciOperation(
            //         userId,
            //         storedRequest.id,
            //         OperationType.ASACI_DOWNLOAD,
            //         OperationStatus.SUCCESS,
            //         'GET',
            //         endpoint,
            //         executionTime,
            //         { certificateReference },
            //         response,
            //         response.status
            //     );
            // }
            //
            // // Extract download link from response
            // let downloadLink = '';
            // if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
            //     // Direct download link
            //     downloadLink = response.data;
            // } else if (response.data && response.data.download_link) {
            //     // Download link in response object
            //     downloadLink = response.data.download_link;
            // } else if (response.headers && response.headers.location) {
            //     // Redirect location
            //     downloadLink = response.headers.location;
            // } else {
            //     // Try to construct a download link
            //     downloadLink = `${process.env.ASACI_BASE_URL}/api/v1/certificates/${certificateReference}/download`;
            // }
            //
            // // Update the stored request if found
            // if (storedRequest && downloadLink) {
            //     await storedRequest.update({
            //         certificateUrl: downloadLink
            //     });
            //     await storedRequest.incrementDownloadCount();
            // }
            //
            // logger.info('Certificate download link retrieved from ASACI API', {
            //     certificateReference,
            //     downloadLink,
            //     executionTime,
            //     source: 'asaci_api'
            // });
            //
            // return {
            //     success: true,
            //     source: 'asaci_api',
            //     certificateReference,
            //     downloadLink,
            //     downloadCount: storedRequest ? storedRequest.downloadCount + 1 : 1,
            //     asaciRequestId: storedRequest?.id,
            //     executionTime,
            //     message: 'Certificate download link retrieved from ASACI API'
            // };

        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            logger.error('Failed to get certificate download link:', {
                error: error.message,
                certificateReference,
                userId,
                executionTime
            });

            // Log the failure
            if (userId) {
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
                    this.getCertificateDownloadLink(ref, userId)
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
     * Create multiple certificates from ORASS policies (bulk operation)
     */
    // async bulkCreateCertificatesFromOrass(bulkDto: BulkCreateCertificatesFromOrassDto): Promise<any> {
    //     const results: any[] = [];
    //     const errors: any[] = [];
    //
    //     try {
    //         logger.info('Starting bulk certificate creation', {
    //             policyCount: bulkDto.policyNumbers.length,
    //             certificateType: bulkDto.certificateType
    //         });
    //
    //         for (const policyNumber of bulkDto.policyNumbers) {
    //             try {
    //                 const result = await this.createEditionRequest({
    //                     policyNumber,
    //                     certificateType: bulkDto.certificateType as CertificateType,
    //                     emailNotification: bulkDto.emailNotification,
    //                     generatedBy: bulkDto.generatedBy,
    //                     channel: bulkDto.channel as ChannelType,
    //                     certificateColor: bulkDto.defaultCertificateColor
    //                 });
    //
    //                 results.push({
    //                     policyNumber,
    //                     success: true,
    //                     result
    //                 });
    //
    //             } catch (error: any) {
    //                 const errorInfo = {
    //                     policyNumber,
    //                     success: false,
    //                     error: error.message,
    //                     details: error.details || {}
    //                 };
    //
    //                 errors.push(errorInfo);
    //                 results.push(errorInfo);
    //
    //                 logger.warn('Failed to create certificate for policy', {
    //                     policyNumber,
    //                     error: error.message
    //                 });
    //             }
    //         }
    //
    //         const successCount = results.filter(r => r.success).length;
    //         const errorCount = errors.length;
    //
    //         logger.info('Bulk certificate creation completed', {
    //             total: bulkDto.policyNumbers.length,
    //             successful: successCount,
    //             failed: errorCount
    //         });
    //
    //         return {
    //             summary: {
    //                 total: bulkDto.policyNumbers.length,
    //                 successful: successCount,
    //                 failed: errorCount
    //             },
    //             results,
    //             errors: errorCount > 0 ? errors : undefined
    //         };
    //
    //     } catch (error: any) {
    //         logger.error('Failed bulk certificate creation:', error);
    //         throw error;
    //     }
    // }

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
     * Get available certificate colors from ORASS policies
     */
    async getAvailableCertificateColors(): Promise<string[]> {
        try {
            // This would typically query distinct certificate colors from ORASS
            // For now, return the mapped colors
            return Object.values(CERTIFICATE_COLOR_MAP);
        } catch (error: any) {
            logger.error('Failed to get available certificate colors:', error);
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

    /**
     * Health check for the service
     */
    async healthCheck(): Promise<any> {
        try {
            const orassHealth = await this.orassService.healthCheck();

            return {
                service: 'certify-link',
                status: orassHealth.status === 'healthy' ? 'healthy' : 'degraded',
                dependencies: {
                    orass: orassHealth,
                    asaci: 'healthy' // This could be expanded to check ASACI health
                },
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                service: 'certify-link',
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}