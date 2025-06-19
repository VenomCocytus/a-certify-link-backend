import { AsaciAttestationEditionRequest, AsaciAttestationEditionResponse, AsaciAttestationInfo } from '@dto/asaci.dto';
import { OrassPolicyModel } from '@/models';
import { OrassInsuredModel } from '@/models';
export declare class IvoryAttestationMapper {
    /**
     * Map certificate request and Orass data to IvoryAttestation request format
     */
    static toIvoryEditionRequest(certificateRequest: AsaciAttestationEditionRequest, policy: OrassPolicyModel, insured: OrassInsuredModel, companyCode: string, agentCode?: string): AsaciAttestationEditionRequest;
    /**
     * Map IvoryAttestation response to internal format
     */
    static fromIvoryEditionResponse(response: AsaciAttestationEditionResponse): {
        success: boolean;
        requestNumber?: string;
        certificateInfo?: AsaciAttestationInfo[];
        errorCode?: number;
        errorMessage?: string;
    };
    /**
     * Get an error message for IvoryAttestation status code
     */
    static getErrorMessage(statusCode: number): string;
    /**
     * Estimate seating capacity based on a vehicle type
     */
    private static estimateSeatingCapacity;
    /**
     * Generate card number based on policy number
     */
    private static generateCardNumber;
    /**
     * Calculate RC amount from guarantees
     */
    private static calculateRC;
    /**
     * Determine certificate color based on vehicle type and usage
     */
    private static determineCertificateColor;
    /**
     * Calculate contract duration in the past months
     */
    private static calculateContractDuration;
    /**
     * Estimate vehicle value based on year, make, and model
     */
    private static estimateVehicleValue;
    /**
     * Calculate other guarantees amount
     */
    private static calculateOtherGuarantees;
    /**
     * Calculate accessories amount (typically 5% of premium)
     */
    private static calculateAccessories;
    /**
     * Calculate taxes (TVA + other taxes, typically 18% in the Ivory Coast)
     */
    private static calculateTaxes;
    /**
     * Calculate card fee (fixed amount)
     */
    private static calculateCardFee;
    /**
     * Calculate FGA (Fonds de Garantie Automobile, typically 1% of premium)
     */
    private static calculateFGA;
    /**
     * Calculate total premium including all fees and taxes
     */
    private static calculateTotalPremium;
}
//# sourceMappingURL=ivoryAttestation.mapper.d.ts.map