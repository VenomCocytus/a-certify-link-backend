import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '@services/certificateService';
import {
    CreateCertificateRequestDto,
    CertificateListQueryDto,
    UpdateCertificateStatusDto
} from '@/dto/certificateDto';
import { CertificateMapper } from '@/mappers/certificateMapper';
import { NotFoundException } from '@exceptions/notFoundException';
import { ValidationException } from '@exceptions/validationException';
import { Helpers } from '../utils/helpers';
import { logger } from '@utils/logger';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        companyCode?: string;
        agentCode?: string;
        permissions: string[];
    };
    idempotencyKey?: string;
    isIdempotentReplay?: boolean;
}

export class CertificateController {
    private certificateService: CertificateService;

    constructor() {
        this.certificateService = new CertificateService();
    }

    /**
     * Create a new certificate
     */
    createCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Skip processing if this is an idempotent replay
            if (req.isIdempotentReplay) {
                return;
            }

            const requestData: CreateCertificateRequestDto = req.body;
            const user = req.user!;

            // Build certificate creation request
            const certificateRequest = {
                policyNumber: requestData.numero_police,
                registrationNumber: requestData.numero_immatriculation,
                companyCode: requestData.code_compagnie,
                agentCode: user.agentCode,
                requestedBy: user.id,
                idempotencyKey: req.idempotencyKey,
                metadata: {
                    originalRequest: requestData,
                    userAgent: req.get('User-Agent'),
                    ipAddress: req.ip,
                },
            };

            const result = await this.certificateService.createCertificate(certificateRequest);

            logger.info('Certificate creation initiated', {
                certificateId: result.certificateId,
                referenceNumber: result.referenceNumber,
                userId: user.id,
                policyNumber: certificateRequest.policyNumber,
            });

            res.status(201).json({
                success: true,
                data: {
                    id: result.certificateId,
                    referenceNumber: result.referenceNumber,
                    status: result.status,
                    message: result.message,
                },
                message: req.t('certificate_created'),
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * List certificates with pagination and filtering
     */
    listCertificates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get certificate by ID
     */
    getCertificateById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Check certificate status
     */
    checkCertificateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Download certificate
     */
    downloadCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cancel certificate
     */
    cancelCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Suspend certificate
     */
    suspendCertificate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create bulk certificates
     */
    createBulkCertificates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
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
            const certificateRequests = certificates.map((cert: CreateCertificateRequestDto) => ({
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
        } catch (error) {
            next(error);
        }
    };
}