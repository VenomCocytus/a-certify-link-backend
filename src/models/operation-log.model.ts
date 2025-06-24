import {DataTypes, Model, Op, Optional, WhereAttributeHash} from 'sequelize';
import {sequelize} from '@config/database';

// Add TypeScript interface for the return type
interface PerformanceMetrics {
    avgTime?: number;
    maxTime?: number;
    minTime?: number;
    totalRequests?: number;
}

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
    productionRequestId?: string;
    operation: OperationType;
    status: OperationStatus;

    // Request/Response tracking
    method?: string;
    endpoint?: string;
    requestData?: object;
    responseData?: object;
    responseStatus?: number;

    // Error tracking
    errorMessage?: string;
    errorCode?: string;
    errorDetails?: object;

    // Performance tracking
    executionTimeMs?: number;
    memoryUsageMb?: number;

    // Context
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;

    // Metadata
    metadata?: object;

    createdAt: Date;
}

// Optional attributes for creation
export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes,
    'id' | 'userId' | 'productionRequestId' | 'method' | 'endpoint' | 'requestData' |
    'responseData' | 'responseStatus' | 'errorMessage' | 'errorCode' | 'errorDetails' |
    'executionTimeMs' | 'memoryUsageMb' | 'ipAddress' | 'userAgent' | 'sessionId' |
    'correlationId' | 'metadata' | 'createdAt'> {}

export class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes>
    implements OperationLogAttributes {

    public id!: string;
    public userId?: string;
    public productionRequestId?: string;
    public operation!: OperationType;
    public status!: OperationStatus;

    // Request/Response tracking
    public method?: string;
    public endpoint?: string;
    public requestData?: object;
    public responseData?: object;
    public responseStatus?: number;

    // Error tracking
    public errorMessage?: string;
    public errorCode?: string;
    public errorDetails?: object;

    // Performance tracking
    public executionTimeMs?: number;
    public memoryUsageMb?: number;

    // Context
    public ipAddress?: string;
    public userAgent?: string;
    public sessionId?: string;
    public correlationId?: string;

    // Metadata
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
        productionRequestId: string,
        status: OperationStatus,
        executionTime?: number,
        requestData?: object,
        responseData?: object,
        error?: Error
    ): Promise<OperationLog> {
        return OperationLog.create({
            userId,
            productionRequestId,
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
        productionRequestId: string,
        operation: OperationType.ASACI_REQUEST | OperationType.ASACI_DOWNLOAD,
        status: OperationStatus,
        method: string,
        endpoint: string,
        executionTime?: number,
        requestData?: object,
        responseData?: object,
        responseStatus?: number,
        error?: Error
    ): Promise<OperationLog> {
        return OperationLog.create({
            userId,
            productionRequestId,
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
    ): Promise<OperationLog> {
        return OperationLog.create({
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

        return await OperationLog.findAll({
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

        return await OperationLog.findAll({
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

    public static async getPerformanceMetrics(
        operation: OperationType,
        hours: number = 24
    ): Promise<PerformanceMetrics> {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        const metrics = await OperationLog.findAll({
            where: {
                operation,
                status: OperationStatus.SUCCESS,
                createdAt: { [Op.gte]: startDate },
                executionTimeMs: {
                    [Op.ne]: null,
                    [Op.gt]: 0  // Additional filter to ensure positive numbers
                } as unknown as WhereAttributeHash<number>  // Type assertion
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avgTime'],
                [sequelize.fn('MAX', sequelize.col('execution_time_ms')), 'maxTime'],
                [sequelize.fn('MIN', sequelize.col('execution_time_ms')), 'minTime'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalRequests']
            ],
            raw: true
        });

        // For percentile calculations (database-specific)
        // Note: PERCENTILE_CONT might need database-specific implementation
        const result = metrics[0] || {};

        return result as PerformanceMetrics;
    }

    public static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return await OperationLog.destroy({
            where: {
                createdAt: {[Op.lt]: cutoffDate}
            }
        });
    }
}

OperationLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productionRequestId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'production_requests',
            key: 'id'
        }
    },
    operation: {
        type: DataTypes.ENUM(...Object.values(OperationType)),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(...Object.values(OperationStatus)),
        allowNull: false
    },

    // Request/Response tracking
    method: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    endpoint: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    requestData: {
        type: DataTypes.JSON,
        allowNull: true
    },
    responseData: {
        type: DataTypes.JSON,
        allowNull: true
    },
    responseStatus: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Error tracking
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    errorCode: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    errorDetails: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // Performance tracking
    executionTimeMs: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    memoryUsageMb: {
        type: DataTypes.FLOAT,
        allowNull: true
    },

    // Context
    ipAddress: {
        type: DataTypes.STRING(45), // IPv6 max length
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sessionId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    correlationId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    // Metadata
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: false, // Only createdAt, no updatedAt
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['productionRequestId']
        },
        {
            fields: ['operation']
        },
        {
            fields: ['status']
        },
        {
            fields: ['createdAt']
        },
        {
            fields: ['operation', 'status']
        },
        {
            fields: ['operation', 'createdAt']
        },
        {
            fields: ['userId', 'operation']
        },
        {
            fields: ['correlationId']
        }
    ]
});

export default OperationLog;