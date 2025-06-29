import { AsaciProductionService } from '@services/asaci-production.service';
import { OrassPolicy, OrassQueryResult } from '@interfaces/orass.interfaces';
import { SearchOrassPoliciesDto, CreateCertificateFromOrassDto, BulkCreateCertificatesFromOrassDto, ValidateOrassPolicyDto } from '@dto/certify-link.dto';
import { OrassService } from "@services/orass-database.service";
export declare class CertifyLinkService {
    private readonly orassService;
    private readonly asaciProductionService;
    constructor(orassService: OrassService, asaciProductionService: AsaciProductionService);
    /**
     * Search ORASS policies based on criteria
     */
    searchOrassPolicies(searchDto: SearchOrassPoliciesDto): Promise<OrassQueryResult>;
    /**
     * Get ORASS policy by policy number
     */
    getOrassPolicyByNumber(policyNumber: string): Promise<OrassPolicy | null>;
    /**
     * Validate ORASS policy for certificate creation
     */
    validateOrassPolicy(validateDto: ValidateOrassPolicyDto): Promise<{
        isValid: boolean;
        policy?: OrassPolicy;
        errors: string[];
    }>;
    /**
     * Create ASACI certificate production from ORASS policy
     */
    createCertificateFromOrassPolicy(createDto: CreateCertificateFromOrassDto): Promise<any>;
    /**
     * Create multiple certificates from ORASS policies (bulk operation)
     */
    bulkCreateCertificatesFromOrass(bulkDto: BulkCreateCertificatesFromOrassDto): Promise<any>;
    /**
     * Map ORASS policy data to ASACI production format
     */
    private mapOrassPolicyToAsaciProduction;
    /**
     * Format date for ASACI API (YYYY-MM-DD format)
     */
    private formatDateForAsaci;
    /**
     * Get available certificate colors from ORASS policies
     */
    getAvailableCertificateColors(): Promise<string[]>;
    /**
     * Get statistics about ORASS policies
     */
    getOrassStatistics(): Promise<any>;
    /**
     * Health check for the service
     */
    healthCheck(): Promise<any>;
}
//# sourceMappingURL=certify-link.service.d.ts.map