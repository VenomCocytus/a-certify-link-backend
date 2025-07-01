import { AsaciProductionService } from '@services/asaci-production.service';
import { logger } from '@utils/logger';
import { ValidationException } from '@exceptions/validation.exception';
import {
    OrassPolicy,
    OrassPolicySearchCriteria,
    OrassQueryResult,
    AsaciProductionData,
    CERTIFICATE_COLOR_MAP,
    VEHICLE_TYPE_MAP
} from '@interfaces/orass.interfaces';
import {
    SearchOrassPoliciesDto,
    CreateCertificateFromOrassDto,
    BulkCreateCertificatesFromOrassDto,
    ValidateOrassPolicyDto
} from '@dto/certify-link.dto';
import {OrassService} from "@services/orass-database.service";
import {CertificateColor, CertificateType, ChannelType, ProductionDataDto, VehicleCode} from "@dto/asaci.dto";

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
     * Get ORASS policy by policy number
     */
    async getOrassPolicyByNumber(policyNumber: string): Promise<OrassPolicy | null> {
        try {
            const policy = await this.orassService.getPolicyByNumber(policyNumber);

            if (policy) {
                logger.info('ORASS policy found', { policyNumber });
            } else {
                logger.warn('ORASS policy not found', { policyNumber });
            }

            return policy;
        } catch (error: any) {
            logger.error('Failed to get ORASS policy by number:', error);
            throw error;
        }
    }

    /**
     * Validate ORASS policy for certificate creation
     */
    async validateOrassPolicy(validateDto: ValidateOrassPolicyDto): Promise<{
        isValid: boolean;
        policy?: OrassPolicy;
        errors: string[];
    }> {
        const errors: string[] = [];

        try {
            const policy = await this.getOrassPolicyByNumber(validateDto.policyNumber);

            if (!policy) {
                errors.push('Policy not found in ORASS database');
                return { isValid: false, errors };
            }

            // Validate expected vehicle registration if provided
            if (validateDto.expectedVehicleRegistration) {
                if (policy.vehicleRegistrationNumber.toUpperCase() !== validateDto.expectedVehicleRegistration.toUpperCase()) {
                    errors.push('Vehicle registration does not match expected value');
                }
            }

            // Validate expected chassis number if provided
            if (validateDto.expectedChassisNumber) {
                if (policy.vehicleChassisNumber.toUpperCase() !== validateDto.expectedChassisNumber.toUpperCase()) {
                    errors.push('Chassis number does not match expected value');
                }
            }

            // Validate policy dates
            const now = new Date();
            if (policy.policyExpiryDate < now) {
                errors.push('Policy contract has expired');
            }

            if (policy.policyEffectiveDate > now) {
                errors.push('Policy contract has not started yet');
            }

            // Validate required fields for certificate creation
            const requiredFields = [
                'organizationCode', 'officeCode', 'subscriberName', 'insuredName',
                'vehicleRegistration', 'vehicleChassisNumber', 'vehicleBrand',
                'vehicleModel', 'vehicleType', 'premiumRC'
            ];

            for (const field of requiredFields) {
                if (!policy[field as keyof OrassPolicy]) {
                    errors.push(`Required field missing: ${field}`);
                }
            }

            const isValid = errors.length === 0;

            logger.info('ORASS policy validation completed', {
                policyNumber: validateDto.policyNumber,
                isValid,
                errorsCount: errors.length
            });

            return { isValid, policy, errors };
        } catch (error: any) {
            logger.error('Failed to validate ORASS policy:', error);
            errors.push('Failed to validate policy due to system error');
            return { isValid: false, errors };
        }
    }

    /**
     * Create ASACI certificate production from ORASS policy
     */
    async createCertificateFromOrassPolicy(createDto: CreateCertificateFromOrassDto): Promise<any> {
        try {
            // First validate the policy
            const validation = await this.validateOrassPolicy({
                policyNumber: createDto.policyNumber
            });

            if (!validation.isValid || !validation.policy) {
                throw new ValidationException(
                    'ORASS policy validation failed',
                    { errors: validation.errors },
                    `/certify-link/policies/${createDto.policyNumber}`
                );
            }

            const policy = validation.policy;

            // Map ORASS policy to ASACI production data
            const productionData = this.mapOrassPolicyToAsaciProduction(
                policy,
                createDto.certificateType as CertificateType,
                createDto.emailNotification,
                createDto.generatedBy,
                createDto.channel as ChannelType,
                createDto.certificateColor as CertificateColor
            );

            // Create production request via ASACI service
            const result = await this.asaciProductionService.createProductionRequest(productionData);

            logger.info('Certificate production created from ORASS policy', {
                policyNumber: createDto.policyNumber,
                certificateType: createDto.certificateType,
                productionReference: result.reference || 'N/A'
            });

            return {
                success: true,
                policy,
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
    async bulkCreateCertificatesFromOrass(bulkDto: BulkCreateCertificatesFromOrassDto): Promise<any> {
        const results: any[] = [];
        const errors: any[] = [];

        try {
            logger.info('Starting bulk certificate creation', {
                policyCount: bulkDto.policyNumbers.length,
                certificateType: bulkDto.certificateType
            });

            for (const policyNumber of bulkDto.policyNumbers) {
                try {
                    const result = await this.createCertificateFromOrassPolicy({
                        policyNumber,
                        certificateType: bulkDto.certificateType as CertificateType,
                        emailNotification: bulkDto.emailNotification,
                        generatedBy: bulkDto.generatedBy,
                        channel: bulkDto.channel as ChannelType,
                        certificateColor: bulkDto.defaultCertificateColor
                    });

                    results.push({
                        policyNumber,
                        success: true,
                        result
                    });

                } catch (error: any) {
                    const errorInfo = {
                        policyNumber,
                        success: false,
                        error: error.message,
                        details: error.details || {}
                    };

                    errors.push(errorInfo);
                    results.push(errorInfo);

                    logger.warn('Failed to create certificate for policy', {
                        policyNumber,
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.success).length;
            const errorCount = errors.length;

            logger.info('Bulk certificate creation completed', {
                total: bulkDto.policyNumbers.length,
                successful: successCount,
                failed: errorCount
            });

            return {
                summary: {
                    total: bulkDto.policyNumbers.length,
                    successful: successCount,
                    failed: errorCount
                },
                results,
                errors: errorCount > 0 ? errors : undefined
            };

        } catch (error: any) {
            logger.error('Failed bulk certificate creation:', error);
            throw error;
        }
    }

    /**
     * Map ORASS policy data to ASACI production format
     */
    private mapOrassPolicyToAsaciProduction(
        policy: OrassPolicy,
        certificateType: CertificateType,
        emailNotification: string,
        generatedBy: string,
        channel: ChannelType = ChannelType.API,
        overrideCertificateColor?: CertificateColor
    ): AsaciProductionData {

        // Determine certificate color
        const certificateColor: CertificateColor = overrideCertificateColor ||
            (CERTIFICATE_COLOR_MAP[policy.certificateColor] as CertificateColor) ||
            CertificateColor.CIMA_JAUNE;

        // Map vehicle type to ASACI format
        const mappedVehicleType = VEHICLE_TYPE_MAP[policy.vehicleType] || policy.vehicleType;

        const productionItem: ProductionDataDto = {
            COULEUR_D_ATTESTATION_A_EDITER: certificateColor,
            PRIME_RC: policy.premiumRC,
            ENERGIE_DU_VEHICULE: policy.vehicleEnergy as VehicleCode,
            NUMERO_DE_CHASSIS_DU_VEHICULE: policy.vehicleChassisNumber,
            MODELE_DU_VEHICULE: policy.vehicleModel,
            GENRE_DU_VEHICULE: policy.vehicleGenre as VehicleCode,
            CATEGORIE_DU_VEHICULE: policy.vehicleCategory as VehicleCode,
            USAGE_DU_VEHICULE: policy.vehicleUsage as VehicleCode,
            MARQUE_DU_VEHICULE: policy.vehicleBrand as VehicleCode,
            TYPE_DU_VEHICULE: mappedVehicleType as VehicleCode,
            NOMBRE_DE_PLACE_DU_VEHICULE: policy.vehicleSeats,
            TYPE_DE_SOUSCRIPTEUR: policy.subscriberType as VehicleCode,
            NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: policy.subscriberPhone,
            BOITE_POSTALE_DU_SOUSCRIPTEUR: policy.subscriberPoBox,
            ADRESSE_EMAIL_DU_SOUSCRIPTEUR: policy.subscriberEmail,
            NOM_DU_SOUSCRIPTEUR: policy.subscriberName,
            TELEPHONE_MOBILE_DE_L_ASSURE: policy.insuredPhone,
            BOITE_POSTALE_DE_L_ASSURE: policy.insuredPoBox,
            ADRESSE_EMAIL_DE_L_ASSURE: policy.insuredEmail,
            NOM_DE_L_ASSURE: policy.insuredName,
            IMMATRICULATION_DU_VEHICULE: policy.vehicleRegistrationNumber,
            NUMERO_DE_POLICE: policy.policyNumber,
            DATE_D_EFFET_DU_CONTRAT: this.formatDateForAsaci(policy.policyEffectiveDate),
            DATE_D_ECHEANCE_DU_CONTRAT: this.formatDateForAsaci(policy.policyExpiryDate),
            OP_ATD: policy.opATD,
            PUISSANCE_FISCALE: policy.vehicleFiscalPower,
            CHARGE_UTILE: policy.vehicleUsefulLoad,
            REDUCTION_FLOTTE: policy.fleetReduction
        };

        return {
            office_code: policy.officeCode,
            organization_code: policy.organizationCode,
            certificate_type: certificateType,
            email_notification: emailNotification,
            generated_by: generatedBy,
            channel,
            productions: [productionItem]
        };
    }

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