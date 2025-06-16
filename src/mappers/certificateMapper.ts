import { CertificateModel } from '@/models';
import { CertificateResponseDto } from '@/dto/certificateDto';
import { CertificateData, CertificateStatus } from '@interfaces/certificateInterfaces';
import { OrassPolicyModel } from '@/models';
import { OrassInsuredModel } from '@/models';

export class CertificateMapper {
    /**
     * Map Certificate model to response DTO
     */
    static toResponseDto(certificate: CertificateModel): CertificateResponseDto {
        return {
            id: certificate.id,
            referenceNumber: certificate.reference_number,
            ivoryRequestNumber: certificate.ivory_request_number || undefined,
            status: certificate.status as CertificateStatus,
            certificateNumber: certificate.certificate_number || undefined,
            downloadUrl: certificate.download_url || undefined,
            createdAt: certificate.created_at,
            updatedAt: certificate.updated_at,
            policyNumber: certificate.policy_number,
            registrationNumber: certificate.registration_number,
            companyCode: certificate.company_code,
        };
    }

    /**
     * Map Certificate model to detailed certificate data
     */
    static toCertificateData(
        certificate: CertificateModel, p0: OrassPolicyModel | undefined, // policy?: OrassPolicyModel,
        insured?: OrassInsuredModel    ): CertificateData {
        return {
            id: certificate.id,
            referenceNumber: certificate.reference_number,
            ivoryRequestNumber: certificate.ivory_request_number || undefined,
            status: certificate.status as CertificateStatus,
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
    static toResponseDtoArray(certificates: CertificateModel[]): CertificateResponseDto[] {
        return certificates.map(cert => this.toResponseDto(cert));
    }

    /**
     * Map Orass Policy for certificate data
     */
    private static mapOrassPolicy(policy: OrassPolicyModel) {
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
    private static mapOrassInsured(insured: OrassInsuredModel) {
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
    static mapIvoryStatusToInternal(ivoryStatus: number): CertificateStatus {
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
    static buildMetadata(
        ivoryStatus?: number,
        errorMessage?: string,
        retryCount?: number,
        additionalData?: Record<string, unknown>
    ): Record<string, unknown> {
        return {
            ivoryStatus,
            errorMessage,
            retryCount,
            lastUpdated: new Date().toISOString(),
            ...additionalData,
        };
    }
}