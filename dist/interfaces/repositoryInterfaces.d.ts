import { WhereOptions, Transaction, Order } from 'sequelize';
import { PaginationParams, PaginatedResponse } from './common.interfaces';
export interface BaseRepositoryInterface<T, K = string> {
    findById(id: K, transaction?: Transaction): Promise<T | null>;
    findOne(where: WhereOptions<T>, transaction?: Transaction): Promise<T | null>;
    findAll(where?: WhereOptions<T>, transaction?: Transaction): Promise<T[]>;
    findAndCountAll(options: FindAndCountAllOptions<T>): Promise<PaginatedResponse<T>>;
    create(data: Partial<T>, transaction?: Transaction): Promise<T>;
    update(id: K, data: Partial<T>, transaction?: Transaction): Promise<T | null>;
    delete(id: K, transaction?: Transaction): Promise<boolean>;
    bulkCreate(data: Partial<T>[], transaction?: Transaction): Promise<T[]>;
    bulkUpdate(where: WhereOptions<T>, data: Partial<T>, transaction?: Transaction): Promise<number>;
    count(where?: WhereOptions<T>, transaction?: Transaction): Promise<number>;
    exists(where: WhereOptions<T>, transaction?: Transaction): Promise<boolean>;
}
export interface FindAndCountAllOptions<T> {
    where?: WhereOptions<T>;
    order?: Order;
    include?: unknown[];
    pagination: PaginationParams;
    transaction?: Transaction;
}
export interface CertificateRepositoryInterface extends BaseRepositoryInterface<any> {
    findByReferenceNumber(referenceNumber: string, transaction?: Transaction): Promise<any | null>;
    findByPolicyNumber(policyNumber: string, transaction?: Transaction): Promise<any[]>;
    findByCompanyCode(companyCode: string, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    findByStatus(status: string, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    findPendingCertificates(limit?: number, transaction?: Transaction): Promise<any[]>;
    findExpiredRequests(beforeDate: Date, transaction?: Transaction): Promise<any[]>;
    updateStatus(id: string, status: string, metadata?: Record<string, unknown>, transaction?: Transaction): Promise<any | null>;
    findDuplicates(policyNumber: string, registrationNumber: string, companyCode: string, transaction?: Transaction): Promise<any[]>;
}
export interface AuditRepositoryInterface extends BaseRepositoryInterface<any> {
    findByResourceId(resourceId: string, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    findByUserId(userId: string, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    findByAction(action: string, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    findByDateRange(startDate: Date, endDate: Date, options?: FindAndCountAllOptions<any>): Promise<PaginatedResponse<any>>;
    createAuditLog(data: {
        userId: string;
        action: string;
        resourceType: string;
        resourceId: string;
        oldValues?: Record<string, unknown>;
        newValues?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }, transaction?: Transaction): Promise<any>;
}
export interface IdempotencyRepositoryInterface extends BaseRepositoryInterface<any> {
    findByKey(key: string, transaction?: Transaction): Promise<any | null>;
    createOrUpdate(data: {
        key: string;
        status: 'pending' | 'completed' | 'failed';
        requestHash: string;
        response?: unknown;
        expiresAt: Date;
    }, transaction?: Transaction): Promise<any>;
    deleteExpired(beforeDate: Date, transaction?: Transaction): Promise<number>;
    findExpired(beforeDate: Date, transaction?: Transaction): Promise<any[]>;
}
//# sourceMappingURL=repositoryInterfaces.d.ts.map