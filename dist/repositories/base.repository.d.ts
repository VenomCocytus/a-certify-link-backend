import { Model, ModelStatic, Transaction, WhereOptions } from 'sequelize';
import { BaseRepositoryInterface, FindAndCountAllOptions } from '@interfaces/repositoryInterfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
export declare abstract class BaseRepository<T extends Model, K = string> implements BaseRepositoryInterface<T, K> {
    protected model: ModelStatic<T>;
    protected constructor(model: ModelStatic<T>);
    /**
     * Find record by ID
     */
    findById(id: K, transaction?: Transaction): Promise<T | null>;
    /**
     * Find a single record by criteria
     */
    findOne(where: WhereOptions<T>, transaction?: Transaction): Promise<T | null>;
    /**
     * Find all records
     */
    findAll(where?: WhereOptions<T>, transaction?: Transaction): Promise<T[]>;
    /**
     * Find and count all with pagination
     */
    findAndCountAll(options: FindAndCountAllOptions<T>): Promise<PaginatedResponse<T>>;
    /**
     * Create a new record
     */
    create(data: Partial<T>, transaction?: Transaction): Promise<T>;
    /**
     * Update record by ID
     */
    update(id: K, data: Partial<T>, transaction?: Transaction): Promise<T | null>;
    /**
     * Delete record by ID
     */
    delete(id: K, transaction?: Transaction): Promise<boolean>;
    /**
     * Bulk create records
     */
    bulkCreate(data: Partial<T>[], transaction?: Transaction): Promise<T[]>;
    /**
     * Bulk update records
     */
    bulkUpdate(where: WhereOptions<T>, data: Partial<T>, transaction?: Transaction): Promise<number>;
    /**
     * Count records
     */
    count(where?: WhereOptions<T>, transaction?: Transaction): Promise<number>;
    /**
     * Check if a record exists
     */
    exists(where: WhereOptions<T>, transaction?: Transaction): Promise<boolean>;
}
//# sourceMappingURL=base.repository.d.ts.map