import { Transaction } from 'sequelize';
import { Certificate, OrassPolicy, OrassInsured, sequelize } from '../models';
import { CertificateRepository } from '../repositories/certificateRepository';
import { OrassService } from './orassService';
import { IvoryAttestationService } from './ivoryAttestationService';
import { AuditService } from './auditService';
import { IdempotencyService } from './idempotencyService';
import {
    CertificateCreationRequest,
    CertificateCreationResult,
    CertificateOperationRequest,
    CertificateOperationResult,
    CertificateData,
    CertificateSearchCriteria,
    BulkCertificateRequest,
    BulkCertificateResult
} from '../interfaces/certificateInterfaces';
import { CertificateServiceInterface } from '../interfaces/serviceInterfaces';
import { PaginatedResponse, PaginationParams } from '../interfaces/common';
import { CertificateMapper } from '../mappers/certificateMapper';
import { IvoryAttestationMapper } from '../mappers/ivoryAttestationMapper';
import { OrassMapper } from '../mappers/orassMapper';
import { NotFoundException } from '../exceptions/notFoundException';
import { ValidationException } from '../exceptions/validationException';
import { ExternalApiException } from '../exceptions/externalApiException';
import { Helpers } from '../utils/helpers';
import { logger } from '../utils/logger';

export class CertificateService implements CertificateServiceInterface {
    private certificateRepository: CertificateRepository;
    private orassService: OrassService;
    private ivoryAttestationService: IvoryAttestationService;
    private auditService: AuditService;
    private idempotencyService: IdempotencyService;

    constructor() {
        this.certificateRepository = new CertificateRepository();
        this.orassService = new OrassService();
        this.ivoryAttestationService = new IvoryAttestationService();
        this.auditService = new AuditService();
        this.idempotencyService = new IdempotencyService();
    }

    /**
     * Create a new digital certificate
     */
    async createCertificate(
        request: CertificateCreationRequest,
        transaction?: Transaction
    ): Promise<CertificateCreationResult> {
        const t = transaction || await sequelize.transaction();

        try {
            // Validate request
            await this.validateCertificateRequest(request);

            // Check for existing active certificates
            await this.checkForDuplicates(request, t);

            // Fetch policy and insured data from Orass
            const { policy, insured } = await this.fetchOrassData(request);

            // Create certificate record
            const certificate = await this.createCertificateRecord(request, policy, insured, t);

            // Create audit log
            await this.auditService.logAction({
                userId: request.requestedBy,
                action: 'created',
                resourceType: 'certificate',
                resourceId: certificate.id,
                newValues: {
                    referenceNumber: certificate.reference_number,
                    policyNumber: certificate.policy_number,
                    registrationNumber: certificate.registration_number,
                    status: certificate.status,
                },
                metadata: request.metadata,
            }, t);

            // Start async processing (don't wait for completion)
            this.processCertificateAsync(certificate.id, policy, insured, request.companyCode, request.agentCode);

            if (!transaction) {
                await t.commit();
            }

            return {
                certificateId: certificate.id,
                referenceNumber: certificate.reference_number,
                status: certificate.status,
                message: 'Certificate creation initiated successfully',
            };
        } catch (error) {
            if (!transaction) {
                await t.rollback();
            }
            throw error;
        }
    }

    /**
     * Get certificate by ID
     */
    async getCertificateById(id: string): Promise<CertificateData | null> {
        const certificate = await this.certificateRepository.findById(id);
        if (!certificate) {
            return null;
        }

        const policy = await OrassPolicy.findByPk(certificate.policy_id);
        const insured = await OrassInsured.findByPk(certificate.insured_id);

        return CertificateMapper.toCertificateData(certificate, policy || undefined, insured || undefined);
    }

    /**
     * Get certificate by reference number
     */
    async getCertificateByReferenceNumber(referenceNumber: string): Promise<CertificateData | null> {
        const certificate = await this.certificateRepository.findByReferenceNumber(referenceNumber);
        if (!certificate) {
            return null;
        }

        const policy = await OrassPolicy.findByPk(certificate.policy_id);
        const insured = await OrassInsured.findByPk(certificate.insured_id);

        return CertificateMapper.toCertificateData(certificate, policy || undefined, insured || undefined);
    }

    /**
     * Search certificates with pagination
     */
    async searchCertificates(
        criteria: CertificateSearchCriteria,
        pagination: PaginationParams
    ): Promise<PaginatedResponse<CertificateData>> {
        const result = await this.certificateRepository.findAndCountAll({
            where: this.buildSearchWhere(criteria),
            pagination,
            include: [
                { model: OrassPolicy, as: 'policy' },
                { model: OrassInsured, as: 'insured' },
            ],
        });

        const mappedData = result.data.map(cert => {
            const policy = (cert as any).policy;
            const insured = (cert as any).insured;
            return CertificateMapper.toCertificateData(cert, policy, insured);
        });

        return {
            data: mappedData,
            meta: result.meta,
        };
    }

    /**
     * Update certificate status
     */
    async updateCertificateStatus(
        id: string,
        status: string,
        metadata?: Record<string, unknown>,
        userId?: string
    ): Promise<CertificateData> {
        const certificate = await this.certificateRepository.findById(id);
        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        const oldStatus = certificate.status;
        const updatedCertificate = await this.certificateRepository.update(id, {
            status,
            metadata: { ...certificate.metadata, ...metadata },
            updated_at: new Date(),
        });

        if (!updatedCertificate) {
            throw new Error('Failed to update certificate status');
        }

        // Create audit log
        if (userId) {
            await this.auditService.logAction({
                userId,
                action: 'updated',
                resourceType: 'certificate',
                resourceId: id,
                oldValues: { status: oldStatus },
                newValues: { status },
                metadata,
            });
        }

        const policy = await OrassPolicy.findByPk(updatedCertificate.policy_id);
        const insured = await OrassInsure
        const policy = await OrassPolicy.findByPk(updatedCertificate.policy_id);
        const insured = await OrassInsured.findByPk(updatedCertificate.insured_id);

        return CertificateMapper.toCertificateData(updatedCertificate, policy || undefined, insured || undefined);
    }

    /**
     * Cancel certificates
     */
    async cancelCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult> {
        const result: CertificateOperationResult = {
            successful: [],
            failed: [],
        };

        for (const certificateId of request.certificateIds) {
            try {
                await this.performCertificateOperation(certificateId, 'cancel', request.requestedBy, request.reason);
                result.successful.push(certificateId);
            } catch (error) {
                result.failed.push({
                    certificateId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return result;
    }

    /**
     * Suspend certificates
     */
    async suspendCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult> {
        const result: CertificateOperationResult = {
            successful: [],
            failed: [],
        };

        for (const certificateId of request.certificateIds) {
            try {
                await this.performCertificateOperation(certificateId, 'suspend', request.requestedBy, request.reason);
                result.successful.push(certificateId);
            } catch (error) {
                result.failed.push({
                    certificateId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return result;
    }

    /**
     * Check certificate status from IvoryAttestation
     */
    async checkCertificateStatus(referenceNumber: string): Promise<{ status: string; details?: unknown }> {
        const certificate = await this.certificateRepository.findByReferenceNumber(referenceNumber);
        if (!certificate) {
            throw new NotFoundException('Certificate', referenceNumber);
        }

        if (!certificate.ivory_request_number) {
            return {
                status: certificate.status,
                details: { message: 'Certificate not yet submitted to IvoryAttestation' },
            };
        }

        try {
            const response = await this.ivoryAttestationService.checkAttestationStatus({
                code_demandeur: 'SYSTEM', // Should be configurable
                reference_demande: certificate.ivory_request_number,
            });

            const mappedStatus = CertificateMapper.mapIvoryStatusToInternal(response.statut);

            // Update local status if different
            if (mappedStatus !== certificate.status) {
                await this.updateCertificateStatus(certificate.id, mappedStatus, {
                    ivoryStatus: response.statut,
                    lastStatusCheck: new Date().toISOString(),
                });
            }

            return {
                status: mappedStatus,
                details: {
                    ivoryStatus: response.statut,
                    ivoryMessage: this.ivoryAttestationService.getStatusCodeDescription(response.statut),
                    lastUpdated: new Date().toISOString(),
                },
            };
        } catch (error) {
            logger.error('Failed to check certificate status:', error);
            return {
                status: certificate.status,
                details: {
                    error: 'Failed to check status from IvoryAttestation',
                    lastKnownStatus: certificate.status,
                },
            };
        }
    }

    /**
     * Download certificate
     */
    async downloadCertificate(certificateId: string): Promise<{ url: string; type: string }> {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundException('Certificate', certificateId);
        }

        if (certificate.status !== 'completed') {
            throw new ValidationException('Certificate is not ready for download', {
                status: certificate.status,
            });
        }

        if (certificate.download_url && certificate.download_expires_at && certificate.download_expires_at > new Date()) {
            return {
                url: certificate.download_url,
                type: 'PDF',
            };
        }

        // Fetch fresh download URL from IvoryAttestation
        try {
            const downloadInfo = await this.ivoryAttestationService.downloadAttestation(
                certificate.company_code,
                certificate.ivory_request_number!
            );

            if (downloadInfo && downloadInfo.length > 0) {
                const pdfDownload = downloadInfo.find(info => info.type === 'PDF') || downloadInfo[0];

                // Update certificate with new download URL
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

                await this.certificateRepository.update(certificateId, {
                    download_url: pdfDownload.url,
                    download_expires_at: expiresAt,
                });

                return {
                    url: pdfDownload.url,
                    type: pdfDownload.type,
                };
            }

            throw new ExternalApiException('IvoryAttestation', 'No download links available', 'IVORY_ATTESTATION_NO_DOWNLOAD');
        } catch (error) {
            logger.error('Failed to get download URL:', error);
            throw new ExternalApiException('IvoryAttestation', 'Failed to get download URL', 'IVORY_ATTESTATION_DOWNLOAD_ERROR');
        }
    }

    /**
     * Process bulk certificates
     */
    async processBulkCertificates(request: BulkCertificateRequest): Promise<BulkCertificateResult> {
        const startTime = Date.now();
        const results: BulkCertificateResult['results'] = [];

        let successful = 0;
        let failed = 0;

        for (const certRequest of request.requests) {
            try {
                const result = await this.createCertificate(certRequest);
                results.push({ request: certRequest, result });
                successful++;
            } catch (error) {
                results.push({
                    request: certRequest,
                    result: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
                failed++;
            }
        }

        const processingTime = Date.now() - startTime;

        return {
            batchId: request.batchId,
            totalRequests: request.requests.length,
            successful,
            failed,
            results,
            processingTime,
        };
    }

    /**
     * Process idempotent request
     */
    async processIdempotentRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
        return this.idempotencyService.processIdempotentRequest(key, 'certificate-request', requestFn);
    }

    // Private helper methods

    private async validateCertificateRequest(request: CertificateCreationRequest): Promise<void> {
        if (!request.policyNumber) {
            throw new ValidationException('Policy number is required');
        }

        if (!request.registrationNumber) {
            throw new ValidationException('Registration number is required');
        }

        if (!request.companyCode) {
            throw new ValidationException('Company code is required');
        }

        if (!request.requestedBy) {
            throw new ValidationException('Requested by user ID is required');
        }
    }

    private async checkForDuplicates(request: CertificateCreationRequest, transaction: Transaction): Promise<void> {
        const existingCertificates = await this.certificateRepository.findDuplicates(
            request.policyNumber,
            request.registrationNumber,
            request.companyCode,
            transaction
        );

        const activeCertificates = existingCertificates.filter(cert =>
            ['pending', 'processing', 'completed'].includes(cert.status)
        );

        if (activeCertificates.length > 0) {
            throw new ValidationException('Active certificate already exists for this policy and vehicle', {
                existingCertificateId: activeCertificates[0].id,
                existingStatus: activeCertificates[0].status,
            });
        }
    }

    private async fetchOrassData(request: CertificateCreationRequest): Promise<{
        policy: any;
        insured: any;
    }> {
        const policy = await this.orassService.getPolicyByNumber(request.policyNumber);
        if (!policy) {
            throw new NotFoundException('Policy', request.policyNumber);
        }

        const insured = await this.orassService.getInsuredById(policy.insuredId);
        if (!insured) {
            throw new NotFoundException('Insured', policy.insuredId);
        }

        return { policy, insured };
    }

    private async createCertificateRecord(
        request: CertificateCreationRequest,
        policy: any,
        insured: any,
        transaction: Transaction
    ): Promise<any> {
        const referenceNumber = Helpers.generateReferenceNumber();

        const certificateData = {
            reference_number: referenceNumber,
            status: 'pending',
            policy_id: policy.id,
            insured_id: insured.id,
            policy_number: request.policyNumber,
            registration_number: request.registrationNumber,
            company_code: request.companyCode,
            agent_code: request.agentCode || null,
            created_by: request.requestedBy,
            metadata: request.metadata || null,
            idempotency_key: request.idempotencyKey || null,
        };

        return this.certificateRepository.create(certificateData, transaction);
    }

    private async processCertificateAsync(
        certificateId: string,
        policy: any,
        insured: any,
        companyCode: string,
        agentCode?: string
    ): Promise<void> {
        try {
            // Update status to processing
            await this.updateCertificateStatus(certificateId, 'processing', {
                processingStarted: new Date().toISOString(),
            });

            // Create IvoryAttestation request
            const ivoryRequest = IvoryAttestationMapper.toIvoryEditionRequest(
                {} as any, // The original request DTO - would need to be passed through
                policy,
                insured,
                companyCode,
                agentCode
            );

            // Submit to IvoryAttestation
            const response = await this.ivoryAttestationService.createAttestation(ivoryRequest);
            const mappedResponse = IvoryAttestationMapper.fromIvoryEditionResponse(response);

            if (mappedResponse.success) {
                await this.updateCertificateStatus(certificateId, 'completed', {
                    ivoryRequestNumber: mappedResponse.requestNumber,
                    ivoryStatus: response.statut,
                    certificateInfo: mappedResponse.certificateInfo,
                    completedAt: new Date().toISOString(),
                });
            } else {
                await this.updateCertificateStatus(certificateId, 'failed', {
                    ivoryStatus: mappedResponse.errorCode,
                    errorMessage: mappedResponse.errorMessage,
                    failedAt: new Date().toISOString(),
                });
            }
        } catch (error) {
            logger.error(`Failed to process certificate ${certificateId}:`, error);
            await this.updateCertificateStatus(certificateId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                failedAt: new Date().toISOString(),
            });
        }
    }

    private async performCertificateOperation(
        certificateId: string,
        operation: 'cancel' | 'suspend',
        userId: string,
        reason?: string
    ): Promise<void> {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundException('Certificate', certificateId);
        }

        if (certificate.status !== 'completed') {
            throw new ValidationException(`Cannot ${operation} certificate in ${certificate.status} status`);
        }

        if (!certificate.certificate_number) {
            throw new ValidationException(`Certificate number not available for ${operation} operation`);
        }

        try {
            // Update status in IvoryAttestation
            const operationCode = operation === 'cancel' ? '109' : '120';
            await this.ivoryAttestationService.updateAttestationStatus({
                code_demandeur: 'SYSTEM', // Should be configurable
                numero_attestation: [certificate.certificate_number],
                code_operation: operationCode,
            });

            // Update local status
            const newStatus = operation === 'cancel' ? 'cancelled' : 'suspended';
            await this.updateCertificateStatus(certificateId, newStatus, {
                operationReason: reason,
                operationDate: new Date().toISOString(),
            }, userId);

            // Create audit log
            await this.auditService.logAction({
                userId,
                action: operation === 'cancel' ? 'cancelled' : 'suspended',
                resourceType: 'certificate',
                resourceId: certificateId,
                oldValues: { status: certificate.status },
                newValues: { status: newStatus },
                metadata: { reason, operationCode },
            });
        } catch (error) {
            logger.error(`Failed to ${operation} certificate ${certificateId}:`, error);
            throw new ExternalApiException(
                'IvoryAttestation',
                `Failed to ${operation} certificate`,
                'IVORY_ATTESTATION_OPERATION_ERROR'
            );
        }
    }

    private buildSearchWhere(criteria: CertificateSearchCriteria): Record<string, any> {
        const where: Record<string, any> = {};

        if (criteria.policyNumber) {
            where.policy_number = criteria.policyNumber;
        }

        if (criteria.registrationNumber) {
            where.registration_number = criteria.registrationNumber;
        }

        if (criteria.companyCode) {
            where.company_code = criteria.companyCode;
        }

        if (criteria.agentCode) {
            where.agent_code = criteria.agentCode;
        }

        if (criteria.status) {
            where.status = criteria.status;
        }

        if (criteria.certificateNumber) {
            where.certificate_number = criteria.certificateNumber;
        }

        if (criteria.requestedBy) {
            where.created_by = criteria.requestedBy;
        }

        if (criteria.dateFrom || criteria.dateTo) {
            where.created_at = {};
            if (criteria.dateFrom) {
                where.created_at.gte = criteria.dateFrom;
            }
            if (criteria.dateTo) {
                where.created_at.lte = criteria.dateTo;
            }
        }

        return where;
    }
}