"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const helpers_1 = require("@utils/helpers");
const logger_1 = require("@utils/logger");
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    /**
     * Find record by ID
     */
    async findById(id, transaction) {
        try {
            return await this.model.findByPk(id, {
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.model.name} by ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Find a single record by criteria
     */
    async findOne(where, transaction) {
        try {
            return await this.model.findOne({
                where,
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.model.name} with criteria:`, error);
            throw error;
        }
    }
    /**
     * Find all records
     */
    async findAll(where, transaction) {
        try {
            return await this.model.findAll({
                where,
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error finding all ${this.model.name} records:`, error);
            throw error;
        }
    }
    /**
     * Find and count all with pagination
     */
    async findAndCountAll(options) {
        try {
            const { where, order, include, pagination, transaction } = options;
            const { page, limit, offset } = pagination;
            const result = await this.model.findAndCountAll({
                where,
                order,
                include: include,
                limit,
                offset,
                transaction,
                distinct: true, // Important when using includes to avoid counting duplicates
            });
            const meta = helpers_1.Helpers.buildPaginationMeta(result.count, page, limit);
            return {
                data: result.rows,
                meta,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error finding and counting ${this.model.name} records:`, error);
            throw error;
        }
    }
    /**
     * Create a new record
     */
    async create(data, transaction) {
        try {
            return await this.model.create(data, {
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error creating ${this.model.name} record:`, error);
            throw error;
        }
    }
    /**
     * Update record by ID
     */
    async update(id, data, transaction) {
        try {
            const [updatedRowsCount] = await this.model.update(data, {
                where: { id },
                transaction,
            });
            if (updatedRowsCount === 0) {
                return null;
            }
            return this.findById(id, transaction);
        }
        catch (error) {
            logger_1.logger.error(`Error updating ${this.model.name} record with ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Delete record by ID
     */
    async delete(id, transaction) {
        try {
            const deletedRowsCount = await this.model.destroy({
                where: { id },
                transaction,
            });
            return deletedRowsCount > 0;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting ${this.model.name} record with ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Bulk create records
     */
    async bulkCreate(data, transaction) {
        try {
            return await this.model.bulkCreate(data, {
                transaction,
                validate: true,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error bulk creating ${this.model.name} records:`, error);
            throw error;
        }
    }
    /**
     * Bulk update records
     */
    async bulkUpdate(where, data, transaction) {
        try {
            const [updatedRowsCount] = await this.model.update(data, {
                where,
                transaction,
            });
            return updatedRowsCount;
        }
        catch (error) {
            logger_1.logger.error(`Error bulk updating ${this.model.name} records:`, error);
            throw error;
        }
    }
    /**
     * Count records
     */
    async count(where, transaction) {
        try {
            return await this.model.count({
                where,
                transaction,
            });
        }
        catch (error) {
            logger_1.logger.error(`Error counting ${this.model.name} records:`, error);
            throw error;
        }
    }
    /**
     * Check if a record exists
     */
    async exists(where, transaction) {
        try {
            const count = await this.count(where, transaction);
            return count > 0;
        }
        catch (error) {
            logger_1.logger.error(`Error checking existence of ${this.model.name} record:`, error);
            throw error;
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map