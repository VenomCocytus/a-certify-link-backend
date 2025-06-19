"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateRepository = void 0;
const sequelize_1 = require("sequelize");
const base_repository_1 = require("./base.repository");
const models_1 = require("@/models");
const logger_1 = require("@utils/logger");
class CertificateRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.Certificate);
    }
    /**
     * Find the certificate by reference number
     */
    async findByReferenceNumber(referenceNumber, transaction) {
        try {
            return await this.model.findOne({
                where: { reference_number: referenceNumber },
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding certificate by reference number ${referenceNumber}:`, error);
            throw error;
        }
    }
    /**
     * Find certificates by policy number
     */
    async findByPolicyNumber(policyNumber, transaction) {
        try {
            return await this.model.findAll({
                where: { policy_number: policyNumber },
                order: [['created_at', 'DESC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding certificates by policy number ${policyNumber}:`, error);
            throw error;
        }
    }
    /**
     * Find certificates by company code with pagination
     */
    async findByCompanyCode(companyCode, options) {
        try {
            const searchOptions = {
                where: { company_code: companyCode },
                pagination: options?.pagination || { page: 1, limit: 10, offset: 0 },
                order: options?.order || [['created_at', 'DESC']],
                include: options?.include,
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error(`Error finding certificates by company code ${companyCode}:`, error);
            throw error;
        }
    }
    /**
     * Find certificates by status with pagination
     */
    async findByStatus(status, options) {
        try {
            const searchOptions = {
                where: { status },
                pagination: options?.pagination || { page: 1, limit: 10, offset: 0 },
                order: options?.order || [['created_at', 'DESC']],
                include: options?.include,
                transaction: options?.transaction,
            };
            return this.findAndCountAll(searchOptions);
        }
        catch (error) {
            logger_1.logger.error(`Error finding certificates by status ${status}:`, error);
            throw error;
        }
    }
    /**
     * Find pending certificates for processing
     */
    async findPendingCertificates(limit = 50, transaction) {
        try {
            return await this.model.findAll({
                where: {
                    status: 'pending',
                    retry_count: { [sequelize_1.Op.lt]: 3 }, // Max 3 retries
                },
                order: [['created_at', 'ASC']],
                limit,
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding pending certificates:', error);
            throw error;
        }
    }
    /**
     * Find expired certificate requests
     */
    async findExpiredRequests(beforeDate, transaction) {
        try {
            return await this.model.findAll({
                where: {
                    status: ['pending', 'processing'],
                    created_at: { [sequelize_1.Op.lt]: beforeDate },
                },
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding expired certificate requests:', error);
            throw error;
        }
    }
    /**
     * Update certificate status with metadata
     */
    async updateStatus(id, status, metadata, transaction) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date(),
            };
            if (metadata) {
                // Merge with existing metadata
                const existing = await this.findById(id, transaction);
                if (existing) {
                    updateData.metadata = {
                        ...existing.metadata,
                        ...metadata,
                    };
                }
                else {
                    updateData.metadata = metadata;
                }
            }
            return this.update(id, updateData, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error updating certificate status for ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Find duplicate certificates
     */
    async findDuplicates(policyNumber, registrationNumber, companyCode, transaction) {
        try {
            return await this.model.findAll({
                where: {
                    policy_number: policyNumber,
                    registration_number: registrationNumber,
                    company_code: companyCode,
                    status: {
                        [sequelize_1.Op.in]: ['pending', 'processing', 'completed'],
                    },
                },
                order: [['created_at', 'DESC']],
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding duplicate certificates:', error);
            throw error;
        }
    }
    /**
     * Find certificates ready for retry
     */
    async findRetryableCertificates(transaction) {
        try {
            const retryAfter = new Date();
            retryAfter.setMinutes(retryAfter.getMinutes() - 30); // Retry after 30 minutes
            return await this.model.findAll({
                where: {
                    status: 'failed',
                    retry_count: { [sequelize_1.Op.lt]: 3 },
                    [sequelize_1.Op.or]: [
                        { last_retry_at: null },
                        { last_retry_at: { [sequelize_1.Op.lt]: retryAfter } },
                    ],
                },
                order: [['created_at', 'ASC']],
                limit: 20,
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding retryable certificates:', error);
            throw error;
        }
    }
    /**
     * Increment retry count
     */
    async incrementRetryCount(id, transaction) {
        try {
            const certificate = await this.findById(id, transaction);
            if (!certificate) {
                return null;
            }
            return this.update(id, {
                retry_count: certificate.retry_count + 1,
                last_retry_at: new Date(),
            }, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error incrementing retry count for certificate ${id}:`, error);
            throw error;
        }
    }
    /**
     * Find certificates with expired download URLs
     */
    async findExpiredDownloadUrls(transaction) {
        try {
            return await this.model.findAll({
                where: {
                    status: 'completed',
                    download_expires_at: { [sequelize_1.Op.lt]: new Date() },
                    download_url: { [sequelize_1.Op.not]: null },
                },
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding certificates with expired download URLs:', error);
            throw error;
        }
    }
    /**
     * Get certificate statistics
     */
    async getStatistics(companyCode, dateFrom, dateTo) {
        try {
            const whereClause = {};
            if (companyCode) {
                whereClause.company_code = companyCode;
            }
            if (dateFrom || dateTo) {
                whereClause.created_at = {};
                if (dateFrom) {
                    whereClause.created_at[sequelize_1.Op.gte] = dateFrom;
                }
                if (dateTo) {
                    whereClause.created_at[sequelize_1.Op.lte] = dateTo;
                }
            }
            // Get total count
            const total = await this.count(whereClause);
            // Get to count by status
            const statusCounts = await this.model.findAll({
                attributes: [
                    'status',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count'],
                ],
                where: whereClause,
                group: ['status'],
                raw: true,
            });
            const byStatus = {};
            statusCounts.forEach((row) => {
                byStatus[row.status] = parseInt(row.count, 10);
            });
            // Get recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const activityCounts = await this.model.findAll({
                attributes: [
                    [this.model.sequelize.fn('DATE', this.model.sequelize.col('created_at')), 'date'],
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count'],
                ],
                where: {
                    ...whereClause,
                    created_at: { [sequelize_1.Op.gte]: sevenDaysAgo },
                },
                group: [this.model.sequelize.fn('DATE', this.model.sequelize.col('created_at'))],
                order: [[this.model.sequelize.fn('DATE', this.model.sequelize.col('created_at')), 'ASC']],
                raw: true,
            });
            const recentActivity = activityCounts.map((row) => ({
                date: row.date,
                count: parseInt(row.count, 10),
            }));
            return {
                total,
                byStatus,
                recentActivity,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting certificate statistics:', error);
            throw error;
        }
    }
}
exports.CertificateRepository = CertificateRepository;
//# sourceMappingURL=certificate.repository.js.map