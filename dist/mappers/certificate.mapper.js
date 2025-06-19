"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateMapper = void 0;
class CertificateMapper {
    /**
     * Map Certificate model to response DTO
     */
    static toResponseDto(certificate) {
        return {
            infos: [], numero_demande: "", statut: 0,
        };
    }
    /**
     * Map Certificate model to detailed certificate data
     */
    static toCertificateData(certificate, p0, // policy?: OrassPolicyModel,
    insured) {
        return {
            id: certificate.id,
            referenceNumber: certificate.reference_number,
            ivoryRequestNumber: certificate.ivory_request_number || undefined,
            status: certificate.status,
            certificateNumber: certificate.certificate_number || undefined,
            downloadUrl: certificate.download_url || undefined,
            policyNumber: certificate.policy_number,
            registrationNumber: certificate.registration_number,
            companyCode: certificate.company_code,
            agentCode: certificate.agent_code || undefined,
            requestedBy: certificate.created_by,
            errorMessage: certificate.error_message || undefined,
            metadata: certificate.metadata || undefined,
            createdAt: certificate.created_at,
            updatedAt: certificate.updated_at,
            // policy: policy ? this.mapOrassPolicy(policy) : undefined,
            insured: insured ? this.mapOrassInsured(insured) : undefined,
        };
    }
    /**
     * Map array of Certificate models to response DTOs
     */
    static toResponseDtoArray(certificates) {
        return certificates.map(cert => this.toResponseDto(cert));
    }
    /**
     * Map Orass Policy for certificate data
     */
    static mapOrassPolicy(policy) {
        return {
            id: policy.orass_id,
            policyNumber: policy.policy_number,
            insuredId: policy.insured_id,
            vehicleRegistration: policy.vehicle_registration,
            vehicleMake: policy.vehicle_make,
            vehicleModel: policy.vehicle_model,
            vehicleYear: policy.vehicle_year || undefined,
            vehicleType: policy.vehicle_type || undefined,
            vehicleUsage: policy.vehicle_usage || undefined,
            vehicleChassisNumber: policy.vehicle_chassis_number || undefined,
            vehicleMotorNumber: policy.vehicle_motor_number || undefined,
            subscriptionDate: policy.subscription_date.toISOString().split('T')[0],
            effectiveDate: policy.effective_date.toISOString().split('T')[0],
            expirationDate: policy.expiration_date.toISOString().split('T')[0],
            premiumAmount: Number(policy.premium_amount),
            currency: policy.currency,
            status: policy.status,
            agentCode: policy.agent_code || undefined,
            companyCode: policy.company_code,
            guarantees: policy.guarantees || undefined,
            createdAt: policy.created_at.toISOString(),
            updatedAt: policy.updated_at.toISOString(),
        };
    }
    /**
     * Map Orass Insured for certificate data
     */
    static mapOrassInsured(insured) {
        return {
            id: insured.orass_id,
            firstName: insured.first_name,
            lastName: insured.last_name,
            email: insured.email || undefined,
            phone: insured.phone || undefined,
            address: insured.address || undefined,
            profession: insured.profession || undefined,
            type: insured.type,
            dateOfBirth: insured.date_of_birth?.toISOString().split('T')[0],
            nationalId: insured.national_id || undefined,
            companyRegistration: insured.company_registration || undefined,
            createdAt: insured.created_at.toISOString(),
            updatedAt: insured.updated_at.toISOString(),
        };
    }
    /**
     * Map certificate status from Ivory to internal status
     */
    static mapIvoryStatusToInternal(ivoryStatus) {
        switch (ivoryStatus) {
            case 0: // Success
                return 'completed';
            case 121: // Pending generation
            case 122: // Generating
                return 'processing';
            case 123: // Ready for transfer
            case 124: // Transferred
                return 'completed';
            default:
                if (ivoryStatus < 0) {
                    return 'failed';
                }
                return 'pending';
        }
    }
    /**
     * Build certificate metadata for audit purposes
     */
    static buildMetadata(ivoryStatus, errorMessage, retryCount, additionalData) {
        return {
            ivoryStatus,
            errorMessage,
            retryCount,
            lastUpdated: new Date().toISOString(),
            ...additionalData,
        };
    }
}
exports.CertificateMapper = CertificateMapper;
//# sourceMappingURL=certificate.mapper.js.map