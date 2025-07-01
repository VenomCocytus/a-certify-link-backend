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
    async createEditionRequest(createProductionRequest: CreateEditionFromOrassDataRequest): Promise<any> {
        try {
            const productionData = createProductionRequest.toAsaciProductionRequest();
            const result = await this.asaciProductionService.createProductionRequest(productionData);

            logger.info('Certificate production created from ORASS policy', {
                policyNumber: createProductionRequest.policyNumber,
                certificateType: createProductionRequest.certificateType,
                productionReference: result.reference || 'N/A'
            });

            return {
                success: true,
                productionData,
                asaciResult: result,
                message: 'Certificate production created successfully'
            };

        } catch (error: any) {
            logger.error('Failed to create certificate from ORASS policy:', error);
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
     * Format date for ASACI API (YYYY-MM-DD format)
     */
    private formatDateForAsaci(date: Date): string {
        return date.toISOString().split('T')[0];
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