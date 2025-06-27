import { Model, Optional, Sequelize } from 'sequelize';
export declare enum OperationType {
    ORASS_FETCH = "ORASS_FETCH",
    ASACI_REQUEST = "ASACI_REQUEST",
    ASACI_DOWNLOAD = "ASACI_DOWNLOAD",
    ASACI_AUTH = "ASACI_AUTH",
    CERTIFICATE_VALIDATE = "CERTIFICATE_VALIDATE",
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION"
}
export declare enum OperationStatus {
    STARTED = "STARTED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT",
    CANCELLED = "CANCELLED"
}
export interface OperationLogAttributes {
    id: string;
    userId?: string;
    asaciRequestId?: string;
    operation: OperationType;
    status: OperationStatus;
    method?: string;
    endpoint?: string;
    requestData?: object;
    responseData?: object;
    responseStatus?: number;
    errorMessage?: string;
    errorCode?: string;
    errorDetails?: object;
    executionTimeMs?: number;
    memoryUsageMb?: number;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
    metadata?: object;
    createdAt: Date;
}
export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'userId' | 'asaciRequestId' | 'method' | 'endpoint' | 'requestData' | 'responseData' | 'responseStatus' | 'errorMessage' | 'errorCode' | 'errorDetails' | 'executionTimeMs' | 'memoryUsageMb' | 'ipAddress' | 'userAgent' | 'sessionId' | 'correlationId' | 'metadata' | 'createdAt'> {
}
export declare class OperationLogModel extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
    id: string;
    userId?: string;
    asaciRequestId?: string;
    operation: OperationType;
    status: OperationStatus;
    method?: string;
    endpoint?: string;
    requestData?: object;
    responseData?: object;
    responseStatus?: number;
    errorMessage?: string;
    errorCode?: string;
    errorDetails?: object;
    executionTimeMs?: number;
    memoryUsageMb?: number;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
    metadata?: object;
    readonly createdAt: Date;
    get isSuccess(): boolean;
    get isFailed(): boolean;
    get executionTimeSeconds(): number | null;
    static logOrassOperation(userId: string, asaciRequestId: string, status: OperationStatus, executionTime?: number, requestData?: object, responseData?: object, error?: Error): Promise<OperationLogModel>;
    static logAsaciOperation(userId: string, asaciRequestId: string, operation: OperationType.ASACI_REQUEST | OperationType.ASACI_DOWNLOAD, status: OperationStatus, method: string, endpoint: string, executionTime?: number, requestData?: object, responseData?: object, responseStatus?: number, error?: Error): Promise<OperationLogModel>;
    static logUserOperation(userId: string, operation: OperationType, status: OperationStatus, ipAddress?: string, userAgent?: string, sessionId?: string, metadata?: object, error?: Error): Promise<OperationLogModel>;
    static getOperationStats(sequelize: Sequelize, operation?: OperationType, startDate?: Date, endDate?: Date): Promise<any>;
    static getErrorAnalysis(sequelize: Sequelize, operation?: OperationType, days?: number): Promise<any>;
    static cleanupOldLogs(daysToKeep?: number): Promise<number>;
}
export declare function initOperationLogModel(sequelize: Sequelize): typeof OperationLogModel;
export default OperationLogModel;
//# sourceMappingURL=operation-log.model.d.ts.map