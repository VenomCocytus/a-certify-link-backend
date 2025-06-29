import { Request, Response } from 'express';
import { CertifyLinkService } from '@services/certify-link.service';
import { AuthenticatedRequest } from "@interfaces/common.interfaces";
export declare class CertifyLinkController {
    private readonly certifyLinkService;
    constructor(certifyLinkService: CertifyLinkService);
    /**
     * Search ORASS policies
     * @route GET /certify-link/policies/search
     */
    searchOrassPolicies(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get ORASS policy by policy number
     * @route GET /certify-link/policies/:policyNumber
     */
    getOrassPolicyByNumber(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Validate ORASS policy for certificate creation
     * @route POST /certify-link/policies/validate
     */
    validateOrassPolicy(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Create certificate production from ORASS policy
     * @route POST /certify-link/certificates/create
     */
    createCertificateFromOrassPolicy(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Create multiple certificates from ORASS policies (bulk operation)
     * @route POST /certify-link/certificates/bulk-create
     */
    bulkCreateCertificatesFromOrass(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get available certificate colors
     * @route GET /certify-link/certificate-colors
     */
    getAvailableCertificateColors(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get ORASS statistics
     * @route GET /certify-link/statistics
     */
    getOrassStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Health check for certify-link service
     * @route GET /certify-link/health
     */
    healthCheck(req: Request, res: Response): Promise<void>;
    /**
     * Get policies by vehicle registration (convenience endpoint)
     * @route GET /certify-link/policies/by-vehicle/:vehicleRegistration
     */
    getPoliciesByVehicleRegistration(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get policies by chassis number (convenience endpoint)
     * @route GET /certify-link/policies/by-chassis/:chassisNumber
     */
    getPoliciesByChassisNumber(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Preview certificate data before creation
     * @route POST /certify-link/certificates/preview
     */
    previewCertificateData(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=certify-link.controller.d.ts.map