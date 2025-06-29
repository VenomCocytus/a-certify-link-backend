"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertifyLinkService = void 0;
const logger_1 = require("@utils/logger");
const validation_exception_1 = require("@exceptions/validation.exception");
const orass_interfaces_1 = require("@interfaces/orass.interfaces");
const asaci_dto_1 = require("@dto/asaci.dto");
class CertifyLinkService {
    constructor(orassService, asaciProductionService) {
        this.orassService = orassService;
        this.asaciProductionService = asaciProductionService;
    }
    /**
     * Search ORASS policies based on criteria
     */
    async searchOrassPolicies(searchDto) {
        try {
            const criteria = {
                policyNumber: searchDto.policyNumber,
                vehicleRegistration: searchDto.vehicleRegistration,
                vehicleChassisNumber: searchDto.vehicleChassisNumber,
                subscriberName: searchDto.subscriberName,
                insuredName: searchDto.insuredName,
                organizationCode: searchDto.organizationCode,
                officeCode: searchDto.officeCode,
                certificateColor: searchDto.certificateColor,
                contractStartDate: searchDto.contractStartDate ? new Date(searchDto.contractStartDate) : undefined,
                contractEndDate: searchDto.contractEndDate ? new Date(searchDto.contractEndDate) : undefined,
            };
            const result = await this.orassService.searchPolicies(criteria, searchDto.limit || 100, searchDto.offset || 0);
            logger_1.logger.info('ORASS policies search completed', {
                criteria,
                foundPolicies: result.policies.length,
                totalCount: result.totalCount
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to search ORASS policies:', error);
            throw error;
        }
    }
    /**
     * Get ORASS policy by policy number
     */
    async getOrassPolicyByNumber(policyNumber) {
        try {
            const policy = await this.orassService.getPolicyByNumber(policyNumber);
            if (policy) {
                logger_1.logger.info('ORASS policy found', { policyNumber });
            }
            else {
                logger_1.logger.warn('ORASS policy not found', { policyNumber });
            }
            return policy;
        }
        catch (error) {
            logger_1.logger.error('Failed to get ORASS policy by number:', error);
            throw error;
        }
    }
    /**
     * Validate ORASS policy for certificate creation
     */
    async validateOrassPolicy(validateDto) {
        const errors = [];
        try {
            const policy = await this.getOrassPolicyByNumber(validateDto.policyNumber);
            if (!policy) {
                errors.push('Policy not found in ORASS database');
                return { isValid: false, errors };
            }
            // Validate expected vehicle registration if provided
            if (validateDto.expectedVehicleRegistration) {
                if (policy.vehicleRegistration.toUpperCase() !== validateDto.expectedVehicleRegistration.toUpperCase()) {
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
            if (policy.contractEndDate < now) {
                errors.push('Policy contract has expired');
            }
            if (policy.contractStartDate > now) {
                errors.push('Policy contract has not started yet');
            }
            // Validate required fields for certificate creation
            const requiredFields = [
                'organizationCode', 'officeCode', 'subscriberName', 'insuredName',
                'vehicleRegistration', 'vehicleChassisNumber', 'vehicleBrand',
                'vehicleModel', 'vehicleType', 'premiumRC'
            ];
            for (const field of requiredFields) {
                if (!policy[field]) {
                    errors.push(`Required field missing: ${field}`);
                }
            }
            const isValid = errors.length === 0;
            logger_1.logger.info('ORASS policy validation completed', {
                policyNumber: validateDto.policyNumber,
                isValid,
                errorsCount: errors.length
            });
            return { isValid, policy, errors };
        }
        catch (error) {
            logger_1.logger.error('Failed to validate ORASS policy:', error);
            errors.push('Failed to validate policy due to system error');
            return { isValid: false, errors };
        }
    }
    /**
     * Create ASACI certificate production from ORASS policy
     */
    async createCertificateFromOrassPolicy(createDto) {
        try {
            // First validate the policy
            const validation = await this.validateOrassPolicy({
                policyNumber: createDto.policyNumber
            });
            if (!validation.isValid || !validation.policy) {
                throw new validation_exception_1.ValidationException('ORASS policy validation failed', { errors: validation.errors }, `/certify-link/policies/${createDto.policyNumber}`);
            }
            const policy = validation.policy;
            // Map ORASS policy to ASACI production data
            const productionData = this.mapOrassPolicyToAsaciProduction(policy, createDto.certificateType, createDto.emailNotification, createDto.generatedBy, createDto.channel, createDto.certificateColor);
            // Create production request via ASACI service
            const result = await this.asaciProductionService.createProductionRequest(productionData);
            logger_1.logger.info('Certificate production created from ORASS policy', {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to create certificate from ORASS policy:', error);
            throw error;
        }
    }
    /**
     * Create multiple certificates from ORASS policies (bulk operation)
     */
    async bulkCreateCertificatesFromOrass(bulkDto) {
        const results = [];
        const errors = [];
        try {
            logger_1.logger.info('Starting bulk certificate creation', {
                policyCount: bulkDto.policyNumbers.length,
                certificateType: bulkDto.certificateType
            });
            for (const policyNumber of bulkDto.policyNumbers) {
                try {
                    const result = await this.createCertificateFromOrassPolicy({
                        policyNumber,
                        certificateType: bulkDto.certificateType,
                        emailNotification: bulkDto.emailNotification,
                        generatedBy: bulkDto.generatedBy,
                        channel: bulkDto.channel,
                        certificateColor: bulkDto.defaultCertificateColor
                    });
                    results.push({
                        policyNumber,
                        success: true,
                        result
                    });
                }
                catch (error) {
                    const errorInfo = {
                        policyNumber,
                        success: false,
                        error: error.message,
                        details: error.details || {}
                    };
                    errors.push(errorInfo);
                    results.push(errorInfo);
                    logger_1.logger.warn('Failed to create certificate for policy', {
                        policyNumber,
                        error: error.message
                    });
                }
            }
            const successCount = results.filter(r => r.success).length;
            const errorCount = errors.length;
            logger_1.logger.info('Bulk certificate creation completed', {
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
        }
        catch (error) {
            logger_1.logger.error('Failed bulk certificate creation:', error);
            throw error;
        }
    }
    /**
     * Map ORASS policy data to ASACI production format
     */
    mapOrassPolicyToAsaciProduction(policy, certificateType, emailNotification, generatedBy, channel = asaci_dto_1.ChannelType.API, overrideCertificateColor) {
        // Determine certificate color
        const certificateColor = overrideCertificateColor ||
            orass_interfaces_1.CERTIFICATE_COLOR_MAP[policy.certificateColor] ||
            asaci_dto_1.AttestationColor.CIMA_JAUNE;
        // Map vehicle type to ASACI format
        const mappedVehicleType = orass_interfaces_1.VEHICLE_TYPE_MAP[policy.vehicleType] || policy.vehicleType;
        const productionItem = {
            COULEUR_D_ATTESTATION_A_EDITER: certificateColor,
            PRIME_RC: policy.premiumRC,
            ENERGIE_DU_VEHICULE: policy.vehicleEnergy,
            NUMERO_DE_CHASSIS_DU_VEHICULE: policy.vehicleChassisNumber,
            MODELE_DU_VEHICULE: policy.vehicleModel,
            GENRE_DU_VEHICULE: policy.vehicleGenre,
            CATEGORIE_DU_VEHICULE: policy.vehicleCategory,
            USAGE_DU_VEHICULE: policy.vehicleUsage,
            MARQUE_DU_VEHICULE: policy.vehicleBrand,
            TYPE_DU_VEHICULE: mappedVehicleType,
            NOMBRE_DE_PLACE_DU_VEHICULE: policy.vehicleSeats,
            TYPE_DE_SOUSCRIPTEUR: policy.subscriberType,
            NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: policy.subscriberPhone,
            BOITE_POSTALE_DU_SOUSCRIPTEUR: policy.subscriberAddress,
            ADRESSE_EMAIL_DU_SOUSCRIPTEUR: policy.subscriberEmail,
            NOM_DU_SOUSCRIPTEUR: policy.subscriberName,
            TELEPHONE_MOBILE_DE_L_ASSURE: policy.insuredPhone,
            BOITE_POSTALE_DE_L_ASSURE: policy.insuredAddress,
            ADRESSE_EMAIL_DE_L_ASSURE: policy.insuredEmail,
            NOM_DE_L_ASSURE: policy.insuredName,
            IMMATRICULATION_DU_VEHICULE: policy.vehicleRegistration,
            NUMERO_DE_POLICE: policy.policyNumber,
            DATE_D_EFFET_DU_CONTRAT: this.formatDateForAsaci(policy.contractStartDate),
            DATE_D_ECHEANCE_DU_CONTRAT: this.formatDateForAsaci(policy.contractEndDate),
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
    formatDateForAsaci(date) {
        return date.toISOString().split('T')[0];
    }
    /**
     * Get available certificate colors from ORASS policies
     */
    async getAvailableCertificateColors() {
        try {
            // This would typically query distinct certificate colors from ORASS
            // For now, return the mapped colors
            return Object.values(orass_interfaces_1.CERTIFICATE_COLOR_MAP);
        }
        catch (error) {
            logger_1.logger.error('Failed to get available certificate colors:', error);
            throw error;
        }
    }
    /**
     * Get statistics about ORASS policies
     */
    async getOrassStatistics() {
        try {
            // Get basic statistics - this could be expanded based on requirements
            const totalPolicies = await this.orassService.searchPolicies({}, 1);
            return {
                totalPolicies: totalPolicies.totalCount,
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get ORASS statistics:', error);
            throw error;
        }
    }
    /**
     * Health check for the service
     */
    async healthCheck() {
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
        }
        catch (error) {
            return {
                service: 'certify-link',
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
exports.CertifyLinkService = CertifyLinkService;
//# sourceMappingURL=certify-link.service.js.map