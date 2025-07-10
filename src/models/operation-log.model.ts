import { DataTypes, Model, Op, Optional, Sequelize } from 'sequelize';

// Operation types enum
export enum OperationType {
    ORASS_FETCH = 'ORASS_FETCH',
    ASACI_REQUEST = 'ASACI_REQUEST',
    ASACI_DOWNLOAD = 'ASACI_DOWNLOAD',
    ASACI_AUTH = 'ASACI_AUTH',
    CERTIFICATE_VALIDATE = 'CERTIFICATE_VALIDATE',
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION'
}

// Operation status enum
export enum OperationStatus {
    STARTED = 'STARTED',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    TIMEOUT = 'TIMEOUT',
    CANCELLED = 'CANCELLED'
}

// Operation Log attributes interface
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

// Optional attributes for creation
export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes,
    'id' | 'userId' | 'asaciRequestId' | 'method' | 'endpoint' | 'requestData' |
    'responseData' | 'responseStatus' | 'errorMessage' | 'errorCode' | 'errorDetails' |
    'executionTimeMs' | 'memoryUsageMb' | 'ipAddress' | 'userAgent' | 'sessionId' |
    'correlationId' | 'metadata' | 'createdAt'> {}

export class OperationLogModel extends Model<OperationLogAttributes, OperationLogCreationAttributes>
    implements OperationLogAttributes {

    public id!: string;
    public userId?: string;
    public asaciRequestId?: string;
    public operation!: OperationType;
    public status!: OperationStatus;
    public method?: string;
    public endpoint?: string;
    public requestData?: object;
    public responseData?: object;
    public responseStatus?: number;
    public errorMessage?: string;
    public errorCode?: string;
    public errorDetails?: object;
    public executionTimeMs?: number;
    public memoryUsageMb?: number;
    public ipAddress?: string;
    public userAgent?: string;
    public sessionId?: string;
    public correlationId?: string;
    public metadata?: object;
    public readonly createdAt!: Date;

    // Virtual fields
    public get isSuccess(): boolean {
        return this.status === OperationStatus.SUCCESS;
    }

    public get isFailed(): boolean {
        return this.status === OperationStatus.FAILED;
    }

    public get executionTimeSeconds(): number | null {
        return this.executionTimeMs ? this.executionTimeMs / 1000 : null;
    }

    // Static methods for logging different operations
    public static async logOrassOperation(
        userId: string,
        asaciRequestId: string,
        status: OperationStatus,
        executionTime?: number,
        requestData?: object,
        responseData?: object,
        error?: Error
    ): Promise<OperationLogModel> {
        return this.create({
            userId,
            asaciRequestId,
            operation: OperationType.ORASS_FETCH,
            status,
            requestData,
            responseData,
            executionTimeMs: executionTime,
            errorMessage: error?.message,
            errorDetails: error ? { stack: error.stack } : undefined,
            memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024
        });
    }

    public static async logAsaciOperation(
        userId: string,
        asaciRequestId: string,
        operation: OperationType.ASACI_REQUEST | OperationType.ASACI_DOWNLOAD,
        status: OperationStatus,
        method: string,
        endpoint: string,
        executionTime?: number,
        requestData?: object,
        responseData?: object,
        responseStatus?: number,
        error?: Error
    ): Promise<OperationLogModel> {
        return this.create({
            userId,
            asaciRequestId,
            operation,
            status,
            method,
            endpoint,
            requestData,
            responseData,
            responseStatus,
            executionTimeMs: executionTime,
            errorMessage: error?.message,
            errorDetails: error ? { stack: error.stack } : undefined,
            memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024
        });
    }

    public static async logUserOperation(
        userId: string,
        operation: OperationType,
        status: OperationStatus,
        ipAddress?: string,
        userAgent?: string,
        sessionId?: string,
        metadata?: object,
        error?: Error
    ): Promise<OperationLogModel> {
        return this.create({
            userId,
            operation,
            status,
            ipAddress,
            userAgent,
            sessionId,
            metadata,
            errorMessage: error?.message,
            errorDetails: error ? { stack: error.stack } : undefined
        });
    }

    public static async getOperationStats(
        sequelize: Sequelize,
        operation?: OperationType,
        startDate?: Date,
        endDate?: Date
    ): Promise<any> {
        const whereClause: any = {};

        if (operation) whereClause.operation = operation;
        if (startDate) whereClause.createdAt = { [Op.gte]: startDate };
        if (endDate) {
            whereClause.createdAt = whereClause.createdAt || {};
            whereClause.createdAt[Op.lte] = endDate;
        }

        return await this.findAll({
            where: whereClause,
            attributes: [
                'operation',
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avgExecutionTime'],
                [sequelize.fn('MAX', sequelize.col('execution_time_ms')), 'maxExecutionTime'],
                [sequelize.fn('MIN', sequelize.col('execution_time_ms')), 'minExecutionTime']
            ],
            group: ['operation', 'status'],
            raw: true
        });
    }

    public static async getErrorAnalysis(
        sequelize: Sequelize,
        operation?: OperationType,
        days: number = 7
    ): Promise<any> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const whereClause: any = {
            status: OperationStatus.FAILED,
            createdAt: { [Op.gte]: startDate }
        };

        if (operation) whereClause.operation = operation;

        return await this.findAll({
            where: whereClause,
            attributes: [
                'operation',
                'errorMessage',
                'errorCode',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['operation', 'errorMessage', 'errorCode'],
            order: [[sequelize.literal('count'), 'DESC']],
            raw: true
        });
    }

    public static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return await this.destroy({
            where: {
                createdAt: { [Op.lt]: cutoffDate }
            }
        });
    }
}

// Helper function to serialize JSON for MSSQL
function serializeJsonLog(value: any): string | null {
    if (value === null || value === undefined) return null;
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('Error serializing JSON:', error);
        return null;
    }
}

// Helper function to deserialize JSON for MSSQL
function deserializeJsonLog(value: string | null): any {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('Error deserializing JSON:', error);
        return null;
    }
}

// Model initialization function
export function initOperationLogModel(sequelize: Sequelize): typeof OperationLogModel {
    OperationLogModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            field: 'user_id',
            allowNull: true
        },
        asaciRequestId: {
            type: DataTypes.UUID,
            field: 'asaci_request_id',
            allowNull: true
        },
        operation: {
            type: DataTypes.STRING(50), // Changed from ENUM to STRING for MSSQL
            allowNull: false,
            validate: {
                isIn: [Object.values(OperationType)]
            }
        },
        status: {
            type: DataTypes.STRING(20), // Changed from ENUM to STRING for MSSQL
            allowNull: false,
            validate: {
                isIn: [Object.values(OperationStatus)]
            }
        },
        method: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        endpoint: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        requestData: {
            type: DataTypes.TEXT,
            field: 'request_data',
            allowNull: true,
            get() {
                const value = this.getDataValue('requestData') as unknown as string;
                return deserializeJsonLog(value);
            },
            set(value: any) {
                this.setDataValue('requestData', serializeJsonLog(value) as any);
            }
        },
        responseData: {
            type: DataTypes.TEXT,
            field: 'response_data',
            allowNull: true,
            get() {
                const value = this.getDataValue('responseData') as unknown as string;
                return deserializeJsonLog(value);
            },
            set(value: any) {
                this.setDataValue('responseData', serializeJsonLog(value) as any);
            }
        },
        responseStatus: {
            type: DataTypes.INTEGER,
            field: 'response_status',
            allowNull: true
        },
        errorMessage: {
            type: DataTypes.TEXT,
            field: 'error_message',
            allowNull: true
        },
        errorCode: {
            type: DataTypes.STRING(50),
            field: 'error_code',
            allowNull: true
        },
        errorDetails: {
            type: DataTypes.TEXT,
            field: 'error_details',
            allowNull: true,
            get() {
                const value = this.getDataValue('errorDetails') as unknown as string;
                return deserializeJsonLog(value);
            },
            set(value: any) {
                this.setDataValue('errorDetails', serializeJsonLog(value) as any);
            }
        },
        executionTimeMs: {
            type: DataTypes.INTEGER,
            field: 'execution_time_ms',
            allowNull: true
        },
        memoryUsageMb: {
            type: DataTypes.FLOAT,
            field: 'memory_usage_mb',
            allowNull: true
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            field: 'ip_address',
            allowNull: true
        },
        userAgent: {
            type: DataTypes.TEXT,
            field: 'user_agent',
            allowNull: true
        },
        sessionId: {
            type: DataTypes.STRING(255),
            field: 'session_id',
            allowNull: true
        },
        correlationId: {
            type: DataTypes.STRING(255),
            field: 'correlation_id',
            allowNull: true
        },
        metadata: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('metadata') as unknown as string;
                return deserializeJsonLog(value);
            },
            set(value: any) {
                this.setDataValue('metadata', serializeJsonLog(value) as any);
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'OperationLog',
        tableName: 'operation_logs',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                name: 'idx_operation_logs_user_id',
                fields: ['user_id']
            },
            {
                name: 'idx_operation_logs_asaci_request_id',
                fields: ['asaci_request_id']
            },
            {
                name: 'idx_operation_logs_operation',
                fields: ['operation']
            },
            {
                name: 'idx_operation_logs_status',
                fields: ['status']
            },
            {
                name: 'idx_operation_logs_created_at',
                fields: ['created_at']
            },
            {
                name: 'idx_operation_logs_operation_status',
                fields: ['operation', 'status']
            },
            {
                name: 'idx_operation_logs_operation_created_at',
                fields: ['operation', 'created_at']
            },
            {
                name: 'idx_operation_logs_user_operation',
                fields: ['user_id', 'operation']
            },
            {
                name: 'idx_operation_logs_correlation_id',
                fields: ['correlation_id']
            }
        ]
    });

    return OperationLogModel;
}

export default OperationLogModel;