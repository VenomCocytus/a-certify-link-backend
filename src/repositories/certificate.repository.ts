import {Op, Transaction} from 'sequelize';
import {BaseRepository} from './base.repository';
import {CertificateRepositoryInterface, FindAndCountAllOptions} from '@interfaces/repository.interfaces';
import {PaginatedResponse} from '@interfaces/common.interfaces';
import {Certificate, CertificateModel} from '@/models';
import {logger} from '@utils/logger';

export class CertificateRepository extends BaseRepository<CertificateModel> implements CertificateRepositoryInterface {
    constructor() {
        super(Certificate);
    }

    /**
     * Find the certificate by reference number
     */
    async findByReferenceNumber(referenceNumber: string, transaction?: Transaction): Promise<CertificateModel | null> {
        try {
            return await this.model.findOne({
                where: {reference_number: referenceNumber},
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding certificate by reference number ${referenceNumber}:`, error);
            throw error;
        }
    }

    /**
     * Find certificates by policy number
     */
    async findByPolicyNumber(policyNumber: string, transaction?: Transaction): Promise<CertificateModel[]> {
        try {
            return await this.model.findAll({
                where: {policy_number: policyNumber},
                order: [['created_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding certificates by policy number ${policyNumber}:`, error);
            throw error;
        }
    }

    /**
     * Find certificates by company code with pagination
     */
    async findByCompanyCode(
        companyCode: string,
        options?: FindAndCountAllOptions<CertificateModel>
    ): Promise<PaginatedResponse<CertificateModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateModel> = {
                where: { company_code: companyCode },
                pagination: options?.pagination || { page: 1, limit: 10, offset: 0 },
                order: options?.order || [['created_at', 'DESC']],
                include: options?.include,
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error(`Error finding certificates by company code ${companyCode}:`, error);
            throw error;
        }
    }

    /**
     * Find certificates by status with pagination
     */
    async findByStatus(
        status: string,
        options?: FindAndCountAllOptions<CertificateModel>
    ): Promise<PaginatedResponse<CertificateModel>> {
        try {
            const searchOptions: FindAndCountAllOptions<CertificateModel> = {
                where: { status },
                pagination: options?.pagination || { page: 1, limit: 10, offset: 0 },
                order: options?.order || [['created_at', 'DESC']],
                include: options?.include,
                transaction: options?.transaction,
            };

            return this.findAndCountAll(searchOptions);
        } catch (error) {
            logger.error(`Error finding certificates by status ${status}:`, error);
            throw error;
        }
    }

    /**
     * Find pending certificates for processing
     */
    async findPendingCertificates(limit: number = 50, transaction?: Transaction): Promise<CertificateModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    status: 'pending',
                    retry_count: {[Op.lt]: 3}, // Max 3 retries
                },
                order: [['created_at', 'ASC']],
                limit,
                transaction,
            });
        } catch (error) {
            logger.error('Error finding pending certificates:', error);
            throw error;
        }
    }

    /**
     * Find expired certificate requests
     */
    async findExpiredRequests(beforeDate: Date, transaction?: Transaction): Promise<CertificateModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    status: ['pending', 'processing'],
                    created_at: {[Op.lt]: beforeDate},
                },
                transaction,
            });
        } catch (error) {
            logger.error('Error finding expired certificate requests:', error);
            throw error;
        }
    }

    /**
     * Update certificate status with metadata
     */
    async updateStatus(
        id: string,
        status: string,
        metadata?: Record<string, unknown>,
        transaction?: Transaction
    ): Promise<CertificateModel | null> {
        try {
            const updateData: Partial<CertificateModel> = {
                status: status as any,
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
                } else {
                    updateData.metadata = metadata;
                }
            }

            return this.update(id, updateData, transaction);
        } catch (error) {
            logger.error(`Error updating certificate status for ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Find duplicate certificates
     */
    async findDuplicates(
        policyNumber: string,
        registrationNumber: string,
        companyCode: string,
        transaction?: Transaction
    ): Promise<CertificateModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    policy_number: policyNumber,
                    registration_number: registrationNumber,
                    company_code: companyCode,
                    status: {
                        [Op.in]: ['pending', 'processing', 'completed'],
                    },
                },
                order: [['created_at', 'DESC']],
                transaction,
            });
        } catch (error) {
            logger.error('Error finding duplicate certificates:', error);
            throw error;
        }
    }

    /**
     * Find certificates ready for retry
     */
    async findRetryableCertificates(transaction?: Transaction): Promise<CertificateModel[]> {
        try {
            const retryAfter = new Date();
            retryAfter.setMinutes(retryAfter.getMinutes() - 30); // Retry after 30 minutes

            return await this.model.findAll({
                where: {
                    status: 'failed',
                    retry_count: {[Op.lt]: 3},
                    [Op.or]: [
                        {last_retry_at: null},
                        {last_retry_at: {[Op.lt]: retryAfter}},
                    ],
                },
                order: [['created_at', 'ASC']],
                limit: 20,
                transaction,
            });
        } catch (error) {
            logger.error('Error finding retryable certificates:', error);
            throw error;
        }
    }

    /**
     * Increment retry count
     */
    async incrementRetryCount(id: string, transaction?: Transaction): Promise<CertificateModel | null> {
        try {
            const certificate = await this.findById(id, transaction);
            if (!certificate) {
                return null;
            }

            return this.update(id, {
                retry_count: certificate.retry_count + 1,
                last_retry_at: new Date(),
            }, transaction);
        } catch (error) {
            logger.error(`Error incrementing retry count for certificate ${id}:`, error);
            throw error;
        }
    }

    /**
     * Find certificates with expired download URLs
     */
    async findExpiredDownloadUrls(transaction?: Transaction): Promise<CertificateModel[]> {
        try {
            return await this.model.findAll({
                where: {
                    status: 'completed',
                    download_expires_at: {[Op.lt]: new Date()},
                    download_url: {[Op.not]: null},
                },
                transaction,
            });
        } catch (error) {
            logger.error('Error finding certificates with expired download URLs:', error);
            throw error;
        }
    }

    /**
     * Get certificate statistics
     */
    async getStatistics(
        companyCode?: string,
        dateFrom?: Date,
        dateTo?: Date
    ): Promise<{
        total: number;
        byStatus: Record<string, number>;
        recentActivity: Array<{ date: string; count: number }>;
    }> {
        try {
            const whereClause: any = {};

            if (companyCode) {
                whereClause.company_code = companyCode;
            }

            if (dateFrom || dateTo) {
                whereClause.created_at = {};
                if (dateFrom) {
                    whereClause.created_at[Op.gte] = dateFrom;
                }
                if (dateTo) {
                    whereClause.created_at[Op.lte] = dateTo;
                }
            }

            // Get total count
            const total = await this.count(whereClause);

            // Get to count by status
            const statusCounts = await this.model.findAll({
                attributes: [
                    'status',
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
                ],
                where: whereClause,
                group: ['status'],
                raw: true,
            }) as any[];

            const byStatus: Record<string, number> = {};
            statusCounts.forEach((row: any) => {
                byStatus[row.status] = parseInt(row.count, 10);
            });

            // Get recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activityCounts = await this.model.findAll({
                attributes: [
                    [this.model.sequelize!.fn('DATE', this.model.sequelize!.col('created_at')), 'date'],
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
                ],
                where: {
                    ...whereClause,
                    created_at: { [Op.gte]: sevenDaysAgo },
                },
                group: [this.model.sequelize!.fn('DATE', this.model.sequelize!.col('created_at'))],
                order: [[this.model.sequelize!.fn('DATE', this.model.sequelize!.col('created_at')), 'ASC']],
                raw: true,
            }) as any[];

            const recentActivity = activityCounts.map((row: any) => ({
                date: row.date,
                count: parseInt(row.count, 10),
            }));

            return {
                total,
                byStatus,
                recentActivity,
            };
        } catch (error) {
            logger.error('Error getting certificate statistics:', error);
            throw error;
        }
    }
}