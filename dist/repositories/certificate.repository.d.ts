import { Transaction } from 'sequelize';
import { BaseRepository } from './base.repository';
import { CertificateRepositoryInterface, FindAndCountAllOptions } from '@interfaces/repositoryInterfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
import { CertificateModel } from '@/models';
export declare class CertificateRepository extends BaseRepository<CertificateModel> implements CertificateRepositoryInterface {
    constructor();
    /**
     * Find the certificate by reference number
     */
    findByReferenceNumber(referenceNumber: string, transaction?: Transaction): Promise<CertificateModel | null>;
    /**
     * Find certificates by policy number
     */
    findByPolicyNumber(policyNumber: string, transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Find certificates by company code with pagination
     */
    findByCompanyCode(companyCode: string, options?: FindAndCountAllOptions<CertificateModel>): Promise<PaginatedResponse<CertificateModel>>;
    /**
     * Find certificates by status with pagination
     */
    findByStatus(status: string, options?: FindAndCountAllOptions<CertificateModel>): Promise<PaginatedResponse<CertificateModel>>;
    /**
     * Find pending certificates for processing
     */
    findPendingCertificates(limit?: number, transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Find expired certificate requests
     */
    findExpiredRequests(beforeDate: Date, transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Update certificate status with metadata
     */
    updateStatus(id: string, status: string, metadata?: Record<string, unknown>, transaction?: Transaction): Promise<CertificateModel | null>;
    /**
     * Find duplicate certificates
     */
    findDuplicates(policyNumber: string, registrationNumber: string, companyCode: string, transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Find certificates ready for retry
     */
    findRetryableCertificates(transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Increment retry count
     */
    incrementRetryCount(id: string, transaction?: Transaction): Promise<CertificateModel | null>;
    /**
     * Find certificates with expired download URLs
     */
    findExpiredDownloadUrls(transaction?: Transaction): Promise<CertificateModel[]>;
    /**
     * Get certificate statistics
     */
    getStatistics(companyCode?: string, dateFrom?: Date, dateTo?: Date): Promise<{
        total: number;
        byStatus: Record<string, number>;
        recentActivity: Array<{
            date: string;
            count: number;
        }>;
    }>;
}
//# sourceMappingURL=certificate.repository.d.ts.map