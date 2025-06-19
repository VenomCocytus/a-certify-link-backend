import { IvoryAttestationServiceInterface } from '@interfaces/serviceInterfaces';
import { AsaciAttestationEditionRequest, AsaciAttestationEditionResponse, AsaciAttestationUpdateStatusRequest, AsaciAttestationUpdateStatusResponse, AsaciAttestationVerificationRequest, AsaciAttestationVerificationResponse } from "@dto/asaci.dto";
export declare class IvoryAttestationService implements IvoryAttestationServiceInterface {
    private httpClient;
    constructor();
    /**
     * Create digital attestation
     */
    createAttestation(request: AsaciAttestationEditionRequest): Promise<AsaciAttestationEditionResponse>;
    /**
     * Check attestation status
     */
    checkAttestationStatus(request: AsaciAttestationVerificationRequest): Promise<AsaciAttestationVerificationResponse>;
    /**
     * Update attestation status (cancel/suspend)
     */
    updateAttestationStatus(request: AsaciAttestationUpdateStatusRequest): Promise<AsaciAttestationUpdateStatusResponse>;
    /**
     * Download attestation files
     */
    downloadAttestation(companyCode: string, requestNumber: string): Promise<{
        url: string;
        type: string;
    }[]>;
    /**
     * Validate IvoryAttestation request
     */
    validateRequest(request: AsaciAttestationEditionRequest): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    /**
     * Check connection to IvoryAttestation
     */
    checkConnection(): Promise<boolean>;
    /**
     * Get a human-readable description for status code
     */
    getStatusCodeDescription(statusCode: number): string;
}
//# sourceMappingURL=ivoryAttestation.service.d.ts.map