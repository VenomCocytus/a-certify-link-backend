import { Response } from 'express';
import { AuthenticatedRequest } from "@interfaces/middleware.interfaces";
export declare class CertificateController {
    private certificateService;
    constructor();
    /**
     * Create a new certificate
     */
    createCertificate: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * List certificates with pagination and filtering
     */
    listCertificates: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get a certificate by ID
     */
    getCertificateById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Check certificate status
     */
    checkCertificateStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Download certificate
     */
    downloadCertificate: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Cancel certificate
     */
    cancelCertificate: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Suspend certificate
     */
    suspendCertificate: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Create bulk certificates
     */
    createBulkCertificates: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=certificate.controller.d.ts.map