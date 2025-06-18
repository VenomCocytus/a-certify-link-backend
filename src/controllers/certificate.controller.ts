import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '@services/certificate.service';
import { AsaciAttestationEditionRequest } from '@dto/asaci.dto';
import { CertificateMapper } from '@/mappers/certificate.mapper';
import { NotFoundException } from '@exceptions/notFound.exception';
import { ValidationException } from '@exceptions/validation.exception';
import { Helpers } from '@utils/helpers';
import { logger } from '@utils/logger';
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";
import {CertificateCreationRequest} from "@dto/certificate.dto";

export class CertificateController {
    private certificateService: CertificateService;

    constructor() {
        this.certificateService = new CertificateService();
    }

    /**
     * Create a new certificate
     */
    createCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        // Skip processing if this is an idempotent replay
        if (req.isIdempotentReplay) {
            return;
        }

        const requestData: CertificateCreationRequest = req.body;
        const user = req.user!;
        requestData.update({
            requestedBy: user.id,
            agentCode: user.agentCode,
            idempotencyKey: req.idempotencyKey,
            metadata: { originalRequest: requestData },
        });

        res.status(201).json({
            success: true,
            data: await this.certificateService.createCertificate(requestData),
            message: req.t('certificate_created'),
        });
    };

    /**
     * List certificates with pagination and filtering
     */
    listCertificates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const query = req.query as any;
        const user = req.user!;
        const pagination = Helpers.parsePaginationParams(query);

        // Build search criteria
        const criteria: any = {};

        // Apply company-level filtering for non-admin users
        if (user.role !== 'admin') {
            criteria.companyCode = user.companyCode;
        }

        // Apply query filters
        if (query.status) criteria.status = query.status;
        if (query.companyCode && user.role === 'admin') criteria.companyCode = query.companyCode;
        if (query.policyNumber) criteria.policyNumber = query.policyNumber;
        if (query.registrationNumber) criteria.registrationNumber = query.registrationNumber;
        if (query.dateFrom) criteria.dateFrom = new Date(query.dateFrom);
        if (query.dateTo) criteria.dateTo = new Date(query.dateTo);

        // For agents, only show their own certificates
        if (user.role === 'agent') {
            criteria.requestedBy = user.id;
        }

        const result = await this.certificateService.searchCertificates(criteria, pagination);

        // Map to response DTOs
        const mappedData = result.data.map(cert => CertificateMapper.toResponseDto(cert as any));

        res.json({
            success: true,
            data: mappedData,
            meta: result.meta,
        });
    };

    /**
     * Get certificate by ID
     */
    getCertificateById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const user = req.user!;

        const certificate = await this.certificateService.getCertificateById(id);

        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        // Check access permissions
        if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
            throw new NotFoundException('Certificate', id);
        }

        if (user.role === 'agent' && certificate.requestedBy !== user.id) {
            throw new NotFoundException('Certificate', id);
        }

        const responseData = CertificateMapper.toResponseDto(certificate as any);

        res.json({
            success: true,
            data: responseData,
        });
    };

    /**
     * Check certificate status
     */
    checkCertificateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const user = req.user!;

        const certificate = await this.certificateService.getCertificateById(id);

        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        // Check access permissions
        if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
            throw new NotFoundException('Certificate', id);
        }

        const statusInfo = await this.certificateService.checkCertificateStatus(certificate.referenceNumber);

        logger.info('Certificate status checked', {
            certificateId: id,
            userId: user.id,
            status: statusInfo.status,
        });

        res.json({
            success: true,
            data: statusInfo,
        });
    };

    /**
     * Download certificate
     */
    downloadCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { type = 'PDF' } = req.query;
        const user = req.user!;

        const certificate = await this.certificateService.getCertificateById(id);

        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        // Check access permissions
        if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
            throw new NotFoundException('Certificate', id);
        }

        const downloadInfo = await this.certificateService.downloadCertificate(id);

        logger.info('Certificate download requested', {
            certificateId: id,
            userId: user.id,
            type,
        });

        res.json({
            success: true,
            data: {
                downloadUrl: downloadInfo.url,
                fileType: downloadInfo.type,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });
    };

    /**
     * Cancel certificate
     */
    cancelCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { reason } = req.body;
        const user = req.user!;

        const certificate = await this.certificateService.getCertificateById(id);

        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        // Check access permissions
        if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
            throw new NotFoundException('Certificate', id);
        }

        const operationRequest = {
            certificateIds: [id],
            operation: 'cancel' as const,
            reason,
            requestedBy: user.id,
        };

        const result = await this.certificateService.cancelCertificates(operationRequest);

        if (result.failed.length > 0) {
            throw new ValidationException(`Failed to cancel certificate: ${result.failed[0].error}`);
        }

        logger.info('Certificate cancelled', {
            certificateId: id,
            userId: user.id,
            reason,
        });

        res.json({
            success: true,
            message: req.t('certificate_cancelled'),
        });
    };

    /**
     * Suspend certificate
     */
    suspendCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { reason } = req.body;
        const user = req.user!;

        const certificate = await this.certificateService.getCertificateById(id);

        if (!certificate) {
            throw new NotFoundException('Certificate', id);
        }

        // Check access permissions
        if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
            throw new NotFoundException('Certificate', id);
        }

        const operationRequest = {
            certificateIds: [id],
            operation: 'suspend' as const,
            reason,
            requestedBy: user.id,
        };

        const result = await this.certificateService.suspendCertificates(operationRequest);

        if (result.failed.length > 0) {
            throw new ValidationException(`Failed to suspend certificate: ${result.failed[0].error}`);
        }

        logger.info('Certificate suspended', {
            certificateId: id,
            userId: user.id,
            reason,
        });

        res.json({
            success: true,
            message: req.t('certificate_suspended'),
        });
    };

    /**
     * Create bulk certificates
     */
    createBulkCertificates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { certificates } = req.body;
        const user = req.user!;

        if (!Array.isArray(certificates) || certificates.length === 0) {
            throw new ValidationException('Certificates array is required and cannot be empty');
        }

        if (certificates.length > 100) {
            throw new ValidationException('Maximum 100 certificates can be created in a single batch');
        }

        const batchId = `batch_${Helpers.generateReferenceNumber()}`;

        // Convert each certificate request
        const certificateRequests = certificates.map((cert: AsaciAttestationEditionRequest) =>
            new CertificateCreationRequest({
            policyNumber: cert.numero_police,
            registrationNumber: cert.numero_immatriculation,
            companyCode: cert.code_compagnie,
            agentCode: user.agentCode,
            requestedBy: user.id,
            metadata: {
                batchId,
                originalRequest: cert,
            },
        }));

        const bulkRequest = {
            batchId,
            requests: certificateRequests,
            requestedBy: user.id,
            idempotencyKey: req.idempotencyKey!,
        };

        const result = await this.certificateService.processBulkCertificates(bulkRequest);

        logger.info('Bulk certificate creation initiated', {
            batchId,
            totalRequests: result.totalRequests,
            successful: result.successful,
            failed: result.failed,
            userId: user.id,
        });

        res.status(202).json({
            success: true,
            data: {
                batchId: result.batchId,
                totalRequests: result.totalRequests,
                successful: result.successful,
                failed: result.failed,
                processingTime: result.processingTime,
            },
            message: req.t('bulk_certificate_creation_initiated'),
        });
    };
}