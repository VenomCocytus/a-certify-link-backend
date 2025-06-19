import { OrassServiceInterface } from '@interfaces/serviceInterfaces';
import { OrassPolicyData, OrassInsuredData, OrassQueryParams } from '@interfaces/orass.interfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
export declare class OrassService implements OrassServiceInterface {
    private httpClient;
    private authToken;
    private tokenExpiresAt;
    constructor();
    /**
     * Authenticate with an Orass system
     */
    authenticate(): Promise<string>;
    /**
     * Get policy by policy number
     */
    getPolicyByNumber(policyNumber: string): Promise<OrassPolicyData | null>;
    /**
     * Get insured by ID
     */
    getInsuredById(insuredId: string): Promise<OrassInsuredData | null>;
    /**
     * Search policies with pagination
     */
    searchPolicies(params: OrassQueryParams): Promise<PaginatedResponse<OrassPolicyData>>;
    /**
     * Validate policy for certificate creation
     */
    validatePolicyForCertificate(policyNumber: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    /**
     * Check connection to Orass
     */
    checkConnection(): Promise<boolean>;
    /**
     * Refresh authentication token
     */
    refreshToken(): Promise<string>;
    private ensureAuthenticated;
}
//# sourceMappingURL=orass.service.d.ts.map