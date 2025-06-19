"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const models_1 = require("@/models");
const certificate_repository_1 = require("@/repositories/certificate.repository");
const orass_service_1 = require("./orass.service");
const ivoryAttestation_service_1 = require("./ivoryAttestation.service");
const audit_service_1 = require("./audit.service");
const idempotency_service_1 = require("./idempotency.service");
const certificate_mapper_1 = require("@/mappers/certificate.mapper");
const ivoryAttestation_mapper_1 = require("@/mappers/ivoryAttestation.mapper");
const notFound_exception_1 = require("@exceptions/notFound.exception");
const validation_exception_1 = require("@exceptions/validation.exception");
const externalApi_exception_1 = require("@exceptions/externalApi.exception");
const helpers_1 = require("@utils/helpers");
const logger_1 = require("@utils/logger");
const errorCodes_1 = require("@/constants/errorCodes");
class CertificateService {
    constructor() {
        this.certificateRepository = new certificate_repository_1.CertificateRepository();
        this.orassService = new orass_service_1.OrassService();
        this.ivoryAttestationService = new ivoryAttestation_service_1.IvoryAttestationService();
        this.auditService = new audit_service_1.AuditService();
        this.idempotencyService = new idempotency_service_1.IdempotencyService();
    }
    /**
     * Create a new digital certificate
     */
    async createCertificate(request, transaction, context) {
        const t = transaction || await models_1.sequelize.transaction();
        // Update certificate creation request
        request.update({
            metadata: request.metadata || {
                userAgent: context?.userAgent,
                ipAddress: context?.ipAddress,
            },
        });
        try {
            // Check for existing active certificates
            await this.checkForDuplicates(request, t);
            // Fetch policy and insured data from Orass
            const { policy, insured } = await this.fetchOrassData(request);
            // Create a certificate record
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
            await this.processCertificateAsync(certificate.id, policy, insured, request.companyCode, request.agentCode);
            if (!transaction) {
                await t.commit();
            }
            logger_1.logger.info('Certificate creation initiated', {
                certificateId: certificate.certificateId,
                referenceNumber: certificate.referenceNumber,
                userId: certificate.id,
                policyNumber: certificate.policyNumber,
            });
            return {
                certificateId: certificate.id,
                referenceNumber: certificate.reference_number,
                status: certificate.status,
                message: 'Certificate creation initiated successfully',
            };
        }
        catch (error) {
            if (!transaction) {
                await t.rollback();
            }
            throw error;
        }
    }
    /**
     * Get a certificate by ID
     */
    async getCertificateById(id) {
        const certificate = await this.certificateRepository.findById(id);
        if (!certificate) {
            return null;
        }
        const policy = await models_1.OrassPolicy.findByPk(certificate.policy_id);
        const insured = await models_1.OrassInsured.findByPk(certificate.insured_id);
        return certificate_mapper_1.CertificateMapper.toCertificateData(certificate, policy || undefined, insured || undefined);
    }
    /**
     * Get a certificate by reference number
     */
    async getCertificateByReferenceNumber(referenceNumber) {
        const certificate = await this.certificateRepository.findByReferenceNumber(referenceNumber);
        if (!certificate) {
            return null;
        }
        const policy = await models_1.OrassPolicy.findByPk(certificate.policy_id);
        const insured = await models_1.OrassInsured.findByPk(certificate.insured_id);
        return certificate_mapper_1.CertificateMapper.toCertificateData(certificate, policy || undefined, insured || undefined);
    }
    async listCertificates(user, query) {
        // Parse pagination params from query
        const pagination = helpers_1.Helpers.parsePaginationParams(query);
        // Build search criteria based on user role and query filters
        const criteria = {};
        if (user.role !== 'admin') {
            criteria.companyCode = user.companyCode;
        }
        if (query.status)
            criteria.status = query.status;
        if (query.companyCode && user.role === 'admin')
            criteria.companyCode = query.companyCode;
        if (query.policyNumber)
            criteria.policyNumber = query.policyNumber;
        if (query.registrationNumber)
            criteria.registrationNumber = query.registrationNumber;
        if (query.dateFrom)
            criteria.dateFrom = new Date(query.dateFrom);
        if (query.dateTo)
            criteria.dateTo = new Date(query.dateTo);
        if (user.role === 'agent') {
            criteria.requestedBy = user.id;
        }
        // Query repository with criteria and pagination
        const result = await this.searchCertificates(criteria, pagination);
        // Map entities to response DTOs
        const mappedData = result.data.map(cert => certificate_mapper_1.CertificateMapper.toResponseDto(cert));
        return {
            success: true,
            data: mappedData,
            meta: result.meta,
        };
    }
    /**
     * Search certificates with pagination
     */
    async searchCertificates(criteria, pagination) {
        const result = await this.certificateRepository.findAndCountAll({
            where: this.buildSearchWhere(criteria),
            pagination,
            include: [
                { model: models_1.OrassPolicy, as: 'policy' },
                { model: models_1.OrassInsured, as: 'insured' },
            ],
        });
        const mappedData = result.data.map(cert => {
            const policy = cert.policy;
            const insured = cert.insured;
            return certificate_mapper_1.CertificateMapper.toCertificateData(cert, policy, insured);
        });
        return {
            data: mappedData,
            meta: result.meta,
        };
    }
    /**
     * Update certificate status
     */
    async updateCertificateStatus(id, status, metadata, userId) {
        const certificate = await this.certificateRepository.findById(id);
        if (!certificate) {
            throw new notFound_exception_1.NotFoundException('Certificate', id);
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
        // Fetch updated policy and insured data
        const policy = await models_1.OrassPolicy.findByPk(updatedCertificate.policy_id);
        const insured = await models_1.OrassInsured.findByPk(updatedCertificate.insured_id);
        return certificate_mapper_1.CertificateMapper.toCertificateData(updatedCertificate, policy || undefined, insured || undefined);
    }
    /**
     * Cancel certificates
     */
    async cancelCertificates(request) {
        const result = {
            successful: [],
            failed: [],
        };
        for (const certificateId of request.certificateIds) {
            try {
                await this.performCertificateOperation(certificateId, 'cancel', request.requestedBy, request.reason);
                result.successful.push(certificateId);
            }
            catch (error) {
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
    async suspendCertificates(request) {
        const result = {
            successful: [],
            failed: [],
        };
        for (const certificateId of request.certificateIds) {
            try {
                await this.performCertificateOperation(certificateId, 'suspend', request.requestedBy, request.reason);
                result.successful.push(certificateId);
            }
            catch (error) {
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
    async checkCertificateStatus(referenceNumber) {
        const certificate = await this.certificateRepository.findByReferenceNumber(referenceNumber);
        if (!certificate) {
            throw new notFound_exception_1.NotFoundException('Certificate', referenceNumber);
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
            const mappedStatus = certificate_mapper_1.CertificateMapper.mapIvoryStatusToInternal(response.statut);
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
        }
        catch (error) {
            logger_1.logger.error('Failed to check certificate status:', error);
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
    async downloadCertificate(certificateId) {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new notFound_exception_1.NotFoundException('Certificate', certificateId);
        }
        if (certificate.status !== 'completed') {
            throw new validation_exception_1.ValidationException('Certificate is not ready for download', {
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
            const downloadInfo = await this.ivoryAttestationService.downloadAttestation(certificate.company_code, certificate.ivory_request_number);
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
            throw new externalApi_exception_1.ExternalApiException('IvoryAttestation', 'No download links available', errorCodes_1.ErrorCodes.IVORY_ATTESTATION_DOWNLOAD_FAILED);
        }
        catch (error) {
            logger_1.logger.error('Failed to get download URL:', error);
            throw new externalApi_exception_1.ExternalApiException('IvoryAttestation', 'Failed to get download URL', errorCodes_1.ErrorCodes.IVORY_ATTESTATION_DOWNLOAD_FAILED);
        }
    }
    /**
     * Process bulk certificates
     */
    async processBulkCertificates(request) {
        const startTime = Date.now();
        const results = [];
        let successful = 0;
        let failed = 0;
        for (const certRequest of request.requests) {
            try {
                const result = await this.createCertificate(certRequest);
                results.push({ request: certRequest, result });
                successful++;
            }
            catch (error) {
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
    async processIdempotentRequest(key, requestFn) {
        return this.idempotencyService.processIdempotentRequest(key, 'certificate-request', requestFn);
    }
    // Private helper methods
    async checkForDuplicates(request, transaction) {
        const existingCertificates = await this.certificateRepository.findDuplicates(request.policyNumber, request.registrationNumber, request.companyCode, transaction);
        const activeCertificates = existingCertificates.filter(cert => ['pending', 'processing', 'completed'].includes(cert.status));
        if (activeCertificates.length > 0) {
            throw new validation_exception_1.ValidationException('Active certificate already exists for this policy and vehicle', {
                existingCertificateId: activeCertificates[0].id,
                existingStatus: activeCertificates[0].status,
            });
        }
    }
    async fetchOrassData(request) {
        const policy = await this.orassService.getPolicyByNumber(request.policyNumber);
        if (!policy) {
            throw new notFound_exception_1.NotFoundException('Policy', request.policyNumber);
        }
        const insured = await this.orassService.getInsuredById(policy.insuredId);
        if (!insured) {
            throw new notFound_exception_1.NotFoundException('Insured', policy.insuredId);
        }
        return { policy, insured };
    }
    async createCertificateRecord(request, policy, insured, transaction) {
        const referenceNumber = helpers_1.Helpers.generateReferenceNumber();
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
    async processCertificateAsync(certificateId, policy, insured, companyCode, agentCode) {
        try {
            // Update status to processing
            await this.updateCertificateStatus(certificateId, 'processing', {
                processingStarted: new Date().toISOString(),
            });
            // Create IvoryAttestation request
            const ivoryRequest = ivoryAttestation_mapper_1.IvoryAttestationMapper.toIvoryEditionRequest({}, // The original request DTO - would need to be passed through
            policy, insured, companyCode, agentCode);
            // Submit to IvoryAttestation
            const response = await this.ivoryAttestationService.createAttestation(ivoryRequest);
            const mappedResponse = ivoryAttestation_mapper_1.IvoryAttestationMapper.fromIvoryEditionResponse(response);
            if (mappedResponse.success) {
                await this.updateCertificateStatus(certificateId, 'completed', {
                    ivoryRequestNumber: mappedResponse.requestNumber,
                    ivoryStatus: response.statut,
                    certificateInfo: mappedResponse.certificateInfo,
                    completedAt: new Date().toISOString(),
                });
            }
            else {
                await this.updateCertificateStatus(certificateId, 'failed', {
                    ivoryStatus: mappedResponse.errorCode,
                    errorMessage: mappedResponse.errorMessage,
                    failedAt: new Date().toISOString(),
                });
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to process certificate ${certificateId}:`, error);
            await this.updateCertificateStatus(certificateId, 'failed', {
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                failedAt: new Date().toISOString(),
            });
        }
    }
    async performCertificateOperation(certificateId, operation, userId, reason) {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new notFound_exception_1.NotFoundException('Certificate', certificateId);
        }
        if (certificate.status !== 'completed') {
            throw new validation_exception_1.ValidationException(`Cannot ${operation} certificate in ${certificate.status} status`);
        }
        if (!certificate.certificate_number) {
            throw new validation_exception_1.ValidationException(`Certificate number not available for ${operation} operation`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to ${operation} certificate ${certificateId}:`, error);
            throw new externalApi_exception_1.ExternalApiException('IvoryAttestation', `Failed to ${operation} certificate`, errorCodes_1.ErrorCodes.IVORY_ATTESTATION_OPERATION_ERROR);
        }
    }
    buildSearchWhere(criteria) {
        const where = {};
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
exports.CertificateService = CertificateService;
//# sourceMappingURL=certificate.service.js.map