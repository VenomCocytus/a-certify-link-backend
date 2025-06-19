import { Transaction } from 'sequelize';
import { BulkCertificateRequest, BulkCertificateResult, CertificateCreationResult, CertificateData, CertificateOperationRequest, CertificateOperationResult, CertificateSearchCriteria, CertificateStatus } from '@interfaces/certificate.interfaces';
import { CertificateServiceInterface } from '@interfaces/serviceInterfaces';
import { PaginatedResponse, PaginationParams } from '@interfaces/common.interfaces';
import { CertificateCreationRequest } from "@dto/certificate.dto";
export declare class CertificateService implements CertificateServiceInterface {
    private certificateRepository;
    private orassService;
    private ivoryAttestationService;
    private auditService;
    private idempotencyService;
    constructor();
    /**
     * Create a new digital certificate
     */
    createCertificate(request: CertificateCreationRequest, transaction?: Transaction, context?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<CertificateCreationResult>;
    /**
     * Get a certificate by ID
     */
    getCertificateById(id: string): Promise<CertificateData | null>;
    /**
     * Get a certificate by reference number
     */
    getCertificateByReferenceNumber(referenceNumber: string): Promise<CertificateData | null>;
    listCertificates(user: {
        role: string;
        companyCode?: string;
        id: string;
    }, query: any): Promise<{
        success: boolean;
        data: import("../dto/asaci.dto").AsaciAttestationEditionResponse[];
        meta: import("@interfaces/common.interfaces").PaginationMeta;
    }>;
    /**
     * Search certificates with pagination
     */
    searchCertificates(criteria: CertificateSearchCriteria, pagination: PaginationParams): Promise<PaginatedResponse<CertificateData>>;
    /**
     * Update certificate status
     */
    updateCertificateStatus(id: string, status: CertificateStatus, metadata?: Record<string, unknown>, userId?: string): Promise<CertificateData>;
    /**
     * Cancel certificates
     */
    cancelCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult>;
    /**
     * Suspend certificates
     */
    suspendCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult>;
    /**
     * Check certificate status from IvoryAttestation
     */
    checkCertificateStatus(referenceNumber: string): Promise<{
        status: string;
        details?: unknown;
    }>;
    /**
     * Download certificate
     */
    downloadCertificate(certificateId: string): Promise<{
        url: string;
        type: string;
    }>;
    /**
     * Process bulk certificates
     */
    processBulkCertificates(request: BulkCertificateRequest): Promise<BulkCertificateResult>;
    /**
     * Process idempotent request
     */
    processIdempotentRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T>;
    private checkForDuplicates;
    private fetchOrassData;
    private createCertificateRecord;
    private processCertificateAsync;
    private performCertificateOperation;
    private buildSearchWhere;
}
//# sourceMappingURL=certificate.service.d.ts.map