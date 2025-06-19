"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const certificate_service_1 = require("@services/certificate.service");
const certificate_mapper_1 = require("@/mappers/certificate.mapper");
const notFound_exception_1 = require("@exceptions/notFound.exception");
const validation_exception_1 = require("@exceptions/validation.exception");
const helpers_1 = require("@utils/helpers");
const logger_1 = require("@utils/logger");
const certificate_dto_1 = require("@dto/certificate.dto");
class CertificateController {
    constructor() {
        /**
         * Create a new certificate
         */
        this.createCertificate = async (req, res) => {
            // Skip processing if this is an idempotent replay
            if (req.isIdempotentReplay) {
                return;
            }
            const requestData = req.body;
            const user = req.user;
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
        this.listCertificates = async (req, res) => {
            const user = req.user;
            const query = req.query;
            const result = await this.certificateService.listCertificates(user, query);
            // Return the service response directly
            res.json(result);
        };
        /**
         * Get a certificate by ID
         */
        this.getCertificateById = async (req, res) => {
            const { id } = req.params;
            const user = req.user;
            const certificate = await this.certificateService.getCertificateById(id);
            if (!certificate) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            // Check access permissions
            if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            if (user.role === 'agent' && certificate.requestedBy !== user.id) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            const responseData = certificate_mapper_1.CertificateMapper.toResponseDto(certificate);
            res.json({
                success: true,
                data: responseData,
            });
        };
        /**
         * Check certificate status
         */
        this.checkCertificateStatus = async (req, res) => {
            const { id } = req.params;
            const user = req.user;
            const certificate = await this.certificateService.getCertificateById(id);
            if (!certificate) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            // Check access permissions
            if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            const statusInfo = await this.certificateService.checkCertificateStatus(certificate.referenceNumber);
            logger_1.logger.info('Certificate status checked', {
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
        this.downloadCertificate = async (req, res) => {
            const { id } = req.params;
            const { type = 'PDF' } = req.query;
            const user = req.user;
            const certificate = await this.certificateService.getCertificateById(id);
            if (!certificate) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            // Check access permissions
            if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            const downloadInfo = await this.certificateService.downloadCertificate(id);
            logger_1.logger.info('Certificate download requested', {
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
        this.cancelCertificate = async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            const user = req.user;
            const certificate = await this.certificateService.getCertificateById(id);
            if (!certificate) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            // Check access permissions
            if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            const operationRequest = {
                certificateIds: [id],
                operation: 'cancel',
                reason,
                requestedBy: user.id,
            };
            const result = await this.certificateService.cancelCertificates(operationRequest);
            if (result.failed.length > 0) {
                throw new validation_exception_1.ValidationException(`Failed to cancel certificate: ${result.failed[0].error}`);
            }
            logger_1.logger.info('Certificate cancelled', {
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
        this.suspendCertificate = async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            const user = req.user;
            const certificate = await this.certificateService.getCertificateById(id);
            if (!certificate) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            // Check access permissions
            if (user.role !== 'admin' && certificate.companyCode !== user.companyCode) {
                throw new notFound_exception_1.NotFoundException('Certificate', id);
            }
            const operationRequest = {
                certificateIds: [id],
                operation: 'suspend',
                reason,
                requestedBy: user.id,
            };
            const result = await this.certificateService.suspendCertificates(operationRequest);
            if (result.failed.length > 0) {
                throw new validation_exception_1.ValidationException(`Failed to suspend certificate: ${result.failed[0].error}`);
            }
            logger_1.logger.info('Certificate suspended', {
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
        this.createBulkCertificates = async (req, res) => {
            const { certificates } = req.body;
            const user = req.user;
            if (!Array.isArray(certificates) || certificates.length === 0) {
                throw new validation_exception_1.ValidationException('Certificates array is required and cannot be empty');
            }
            if (certificates.length > 100) {
                throw new validation_exception_1.ValidationException('Maximum 100 certificates can be created in a single batch');
            }
            const batchId = `batch_${helpers_1.Helpers.generateReferenceNumber()}`;
            // Convert each certificate request
            const certificateRequests = certificates.map((cert) => new certificate_dto_1.CertificateCreationRequest({
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
                idempotencyKey: req.idempotencyKey,
            };
            const result = await this.certificateService.processBulkCertificates(bulkRequest);
            logger_1.logger.info('Bulk certificate creation initiated', {
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
        this.certificateService = new certificate_service_1.CertificateService();
    }
}
exports.CertificateController = CertificateController;
//# sourceMappingURL=certificate.controller.js.map