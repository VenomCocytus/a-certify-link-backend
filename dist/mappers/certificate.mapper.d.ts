import { CertificateModel } from '@/models';
import { AsaciAttestationEditionResponse } from '@dto/asaci.dto';
import { CertificateData, CertificateStatus } from '@interfaces/certificate.interfaces';
import { OrassPolicyModel } from '@/models';
import { OrassInsuredModel } from '@/models';
export declare class CertificateMapper {
    /**
     * Map Certificate model to response DTO
     */
    static toResponseDto(certificate: CertificateModel): AsaciAttestationEditionResponse;
    /**
     * Map Certificate model to detailed certificate data
     */
    static toCertificateData(certificate: CertificateModel, p0: OrassPolicyModel | undefined, // policy?: OrassPolicyModel,
    insured?: OrassInsuredModel): CertificateData;
    /**
     * Map array of Certificate models to response DTOs
     */
    static toResponseDtoArray(certificates: CertificateModel[]): AsaciAttestationEditionResponse[];
    /**
     * Map Orass Policy for certificate data
     */
    private static mapOrassPolicy;
    /**
     * Map Orass Insured for certificate data
     */
    private static mapOrassInsured;
    /**
     * Map certificate status from Ivory to internal status
     */
    static mapIvoryStatusToInternal(ivoryStatus: number): CertificateStatus;
    /**
     * Build certificate metadata for audit purposes
     */
    static buildMetadata(ivoryStatus?: number, errorMessage?: string, retryCount?: number, additionalData?: Record<string, unknown>): Record<string, unknown>;
}
//# sourceMappingURL=certificate.mapper.d.ts.map