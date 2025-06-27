"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationLogModel = exports.OperationStatus = exports.OperationType = void 0;
exports.initOperationLogModel = initOperationLogModel;
const sequelize_1 = require("sequelize");
// Operation types enum
var OperationType;
(function (OperationType) {
    OperationType["ORASS_FETCH"] = "ORASS_FETCH";
    OperationType["ASACI_REQUEST"] = "ASACI_REQUEST";
    OperationType["ASACI_DOWNLOAD"] = "ASACI_DOWNLOAD";
    OperationType["ASACI_AUTH"] = "ASACI_AUTH";
    OperationType["CERTIFICATE_VALIDATE"] = "CERTIFICATE_VALIDATE";
    OperationType["USER_LOGIN"] = "USER_LOGIN";
    OperationType["USER_LOGOUT"] = "USER_LOGOUT";
    OperationType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    OperationType["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
})(OperationType || (exports.OperationType = OperationType = {}));
// Operation status enum
var OperationStatus;
(function (OperationStatus) {
    OperationStatus["STARTED"] = "STARTED";
    OperationStatus["SUCCESS"] = "SUCCESS";
    OperationStatus["FAILED"] = "FAILED";
    OperationStatus["TIMEOUT"] = "TIMEOUT";
    OperationStatus["CANCELLED"] = "CANCELLED";
})(OperationStatus || (exports.OperationStatus = OperationStatus = {}));
class OperationLogModel extends sequelize_1.Model {
    // Virtual fields
    get isSuccess() {
        return this.status === OperationStatus.SUCCESS;
    }
    get isFailed() {
        return this.status === OperationStatus.FAILED;
    }
    get executionTimeSeconds() {
        return this.executionTimeMs ? this.executionTimeMs / 1000 : null;
    }
    // Static methods for logging different operations
    static async logOrassOperation(userId, asaciRequestId, status, executionTime, requestData, responseData, error) {
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
    static async logAsaciOperation(userId, asaciRequestId, operation, status, method, endpoint, executionTime, requestData, responseData, responseStatus, error) {
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
    static async logUserOperation(userId, operation, status, ipAddress, userAgent, sessionId, metadata, error) {
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
    static async getOperationStats(sequelize, operation, startDate, endDate) {
        const whereClause = {};
        if (operation)
            whereClause.operation = operation;
        if (startDate)
            whereClause.createdAt = { [sequelize_1.Op.gte]: startDate };
        if (endDate) {
            whereClause.createdAt = whereClause.createdAt || {};
            whereClause.createdAt[sequelize_1.Op.lte] = endDate;
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
    static async getErrorAnalysis(sequelize, operation, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const whereClause = {
            status: OperationStatus.FAILED,
            createdAt: { [sequelize_1.Op.gte]: startDate }
        };
        if (operation)
            whereClause.operation = operation;
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
    static async cleanupOldLogs(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        return await this.destroy({
            where: {
                createdAt: { [sequelize_1.Op.lt]: cutoffDate }
            }
        });
    }
}
exports.OperationLogModel = OperationLogModel;
// Model initialization function
function initOperationLogModel(sequelize) {
    OperationLogModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            field: 'user_id',
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        asaciRequestId: {
            type: sequelize_1.DataTypes.UUID,
            field: 'asaci_request_id',
            allowNull: true,
            references: {
                model: 'asaci_requests',
                key: 'id'
            }
        },
        operation: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(OperationType)),
            allowNull: false
        },
        status: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(OperationStatus)),
            allowNull: false
        },
        method: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true
        },
        endpoint: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true
        },
        requestData: {
            type: sequelize_1.DataTypes.JSON,
            field: 'request_data',
            allowNull: true
        },
        responseData: {
            type: sequelize_1.DataTypes.JSON,
            field: 'response_data',
            allowNull: true
        },
        responseStatus: {
            type: sequelize_1.DataTypes.INTEGER,
            field: 'response_status',
            allowNull: true
        },
        errorMessage: {
            type: sequelize_1.DataTypes.TEXT,
            field: 'error_message',
            allowNull: true
        },
        errorCode: {
            type: sequelize_1.DataTypes.STRING(50),
            field: 'error_code',
            allowNull: true
        },
        errorDetails: {
            type: sequelize_1.DataTypes.JSON,
            field: 'error_details',
            allowNull: true
        },
        executionTimeMs: {
            type: sequelize_1.DataTypes.INTEGER,
            field: 'execution_time_ms',
            allowNull: true
        },
        memoryUsageMb: {
            type: sequelize_1.DataTypes.FLOAT,
            field: 'memory_usage_mb',
            allowNull: true
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING(45),
            field: 'ip_address',
            allowNull: true
        },
        userAgent: {
            type: sequelize_1.DataTypes.TEXT,
            field: 'user_agent',
            allowNull: true
        },
        sessionId: {
            type: sequelize_1.DataTypes.STRING(255),
            field: 'session_id',
            allowNull: true
        },
        correlationId: {
            type: sequelize_1.DataTypes.STRING(255),
            field: 'correlation_id',
            allowNull: true
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'OperationLog',
        tableName: 'operation_logs',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['asaci_request_id']
            },
            {
                fields: ['operation']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['operation', 'status']
            },
            {
                fields: ['operation', 'created_at']
            },
            {
                fields: ['user_id', 'operation']
            },
            {
                fields: ['correlation_id']
            }
        ]
    });
    return OperationLogModel;
}
exports.default = OperationLogModel;
//# sourceMappingURL=operation-log.model.js.map