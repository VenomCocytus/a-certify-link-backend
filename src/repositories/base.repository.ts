import {Includeable, Model, ModelStatic, Transaction, WhereOptions} from 'sequelize';
import {BaseRepositoryInterface, FindAndCountAllOptions} from '@interfaces/repositoryInterfaces';
import {PaginatedResponse} from '@interfaces/common.interfaces';
import {Helpers} from '@utils/helpers';
import {logger} from '@utils/logger';

export abstract class BaseRepository<T extends Model, K = string> implements BaseRepositoryInterface<T, K> {
    protected model: ModelStatic<T>;

    protected constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    /**
     * Find record by ID
     */
    async findById(id: K, transaction?: Transaction): Promise<T | null> {
        try {
            return await this.model.findByPk(id as any, {
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding ${this.model.name} by ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Find a single record by criteria
     */
    async findOne(where: WhereOptions<T>, transaction?: Transaction): Promise<T | null> {
        try {
            return await this.model.findOne({
                where,
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding ${this.model.name} with criteria:`, error);
            throw error;
        }
    }

    /**
     * Find all records
     */
    async findAll(where?: WhereOptions<T>, transaction?: Transaction): Promise<T[]> {
        try {
            return await this.model.findAll({
                where,
                transaction,
            });
        } catch (error) {
            logger.error(`Error finding all ${this.model.name} records:`, error);
            throw error;
        }
    }

    /**
     * Find and count all with pagination
     */
    async findAndCountAll(options: FindAndCountAllOptions<T>): Promise<PaginatedResponse<T>> {
        try {
            const { where, order, include, pagination, transaction } = options;
            const { page, limit, offset } = pagination;

            const result = await this.model.findAndCountAll({
                where,
                order,
                include: include as Includeable[],
                limit,
                offset,
                transaction,
                distinct: true, // Important when using includes to avoid counting duplicates
            });

            const meta = Helpers.buildPaginationMeta(result.count, page, limit);

            return {
                data: result.rows,
                meta,
            };
        } catch (error) {
            logger.error(`Error finding and counting ${this.model.name} records:`, error);
            throw error;
        }
    }

    /**
     * Create a new record
     */
    async create(data: Partial<T>, transaction?: Transaction): Promise<T> {
        try {
            return await this.model.create(data as any, {
                transaction,
            });
        } catch (error) {
            logger.error(`Error creating ${this.model.name} record:`, error);
            throw error;
        }
    }

    /**
     * Update record by ID
     */
    async update(id: K, data: Partial<T>, transaction?: Transaction): Promise<T | null> {
        try {
            const [updatedRowsCount] = await this.model.update(data as any, {
                where: { id } as any,
                transaction,
            });

            if (updatedRowsCount === 0) {
                return null;
            }

            return this.findById(id, transaction);
        } catch (error) {
            logger.error(`Error updating ${this.model.name} record with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete record by ID
     */
    async delete(id: K, transaction?: Transaction): Promise<boolean> {
        try {
            const deletedRowsCount = await this.model.destroy({
                where: { id } as any,
                transaction,
            });

            return deletedRowsCount > 0;
        } catch (error) {
            logger.error(`Error deleting ${this.model.name} record with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Bulk create records
     */
    async bulkCreate(data: Partial<T>[], transaction?: Transaction): Promise<T[]> {
        try {
            return await this.model.bulkCreate(data as any[], {
                transaction,
                validate: true,
            });
        } catch (error) {
            logger.error(`Error bulk creating ${this.model.name} records:`, error);
            throw error;
        }
    }

    /**
     * Bulk update records
     */
    async bulkUpdate(where: WhereOptions<T>, data: Partial<T>, transaction?: Transaction): Promise<number> {
        try {
            const [updatedRowsCount] = await this.model.update(data as any, {
                where,
                transaction,
            });

            return updatedRowsCount;
        } catch (error) {
            logger.error(`Error bulk updating ${this.model.name} records:`, error);
            throw error;
        }
    }

    /**
     * Count records
     */
    async count(where?: WhereOptions<T>, transaction?: Transaction): Promise<number> {
        try {
            return await this.model.count({
                where,
                transaction,
            });
        } catch (error) {
            logger.error(`Error counting ${this.model.name} records:`, error);
            throw error;
        }
    }

    /**
     * Check if a record exists
     */
    async exists(where: WhereOptions<T>, transaction?: Transaction): Promise<boolean> {
        try {
            const count = await this.count(where, transaction);
            return count > 0;
        } catch (error) {
            logger.error(`Error checking existence of ${this.model.name} record:`, error);
            throw error;
        }
    }
}