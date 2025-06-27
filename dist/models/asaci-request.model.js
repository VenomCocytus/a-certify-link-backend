"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciRequestModel = exports.CertificateType = exports.AsaciRequestStatus = void 0;
exports.initAsaciRequestModel = initAsaciRequestModel;
const sequelize_1 = require("sequelize");
// Enums for better type safety
var AsaciRequestStatus;
(function (AsaciRequestStatus) {
    AsaciRequestStatus["ORASS_FETCHING"] = "ORASS_FETCHING";
    AsaciRequestStatus["ORASS_FETCHED"] = "ORASS_FETCHED";
    AsaciRequestStatus["ASACI_PENDING"] = "ASACI_PENDING";
    AsaciRequestStatus["ASACI_PROCESSING"] = "ASACI_PROCESSING";
    AsaciRequestStatus["COMPLETED"] = "COMPLETED";
    AsaciRequestStatus["FAILED"] = "FAILED";
    AsaciRequestStatus["CANCELLED"] = "CANCELLED";
})(AsaciRequestStatus || (exports.AsaciRequestStatus = AsaciRequestStatus = {}));
var CertificateType;
(function (CertificateType) {
    CertificateType["CIMA"] = "cima";
    CertificateType["POOLTPV"] = "pooltpv";
    CertificateType["MATCA"] = "matca";
    CertificateType["POOLTPVBLEU"] = "pooltpvbleu";
})(CertificateType || (exports.CertificateType = CertificateType = {}));
class AsaciRequestModel extends sequelize_1.Model {
    // Virtual fields
    get isCompleted() {
        return this.status === AsaciRequestStatus.COMPLETED;
    }
    get isFailed() {
        return this.status === AsaciRequestStatus.FAILED;
    }
    get canRetry() {
        return this.isFailed && this.retryCount < this.maxRetries;
    }
    get totalProcessingTime() {
        if (!this.completedAt)
            return null;
        return this.completedAt.getTime() - this.createdAt.getTime();
    }
    // Instance methods
    async updateStatus(status, message, additionalData) {
        const updateData = {
            status,
            statusMessage: message,
            ...additionalData
        };
        if (status === AsaciRequestStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        await this.update(updateData);
    }
    async markAsCompleted(certificateUrl, certificateData) {
        await this.update({
            status: AsaciRequestStatus.COMPLETED,
            certificateUrl,
            certificateData,
            completedAt: new Date(),
            statusMessage: 'Certificate generated successfully'
        });
    }
    async markAsFailed(errorMessage, errorDetails) {
        await this.update({
            status: AsaciRequestStatus.FAILED,
            errorMessage,
            errorDetails,
            retryCount: this.retryCount + 1
        });
    }
    async incrementDownloadCount() {
        await this.update({
            downloadCount: this.downloadCount + 1,
            lastDownloadAt: new Date()
        });
    }
    async setOrassData(orassReference, data) {
        await this.update({
            status: AsaciRequestStatus.ORASS_FETCHED,
            orassReference,
            orassData: data,
            orassFetchedAt: new Date(),
            statusMessage: 'Data fetched from Orass successfully'
        });
    }
    async setAsaciRequest(requestPayload) {
        await this.update({
            status: AsaciRequestStatus.ASACI_PENDING,
            asaciRequestPayload: requestPayload,
            asaciSubmittedAt: new Date(),
            statusMessage: 'Request submitted to Asaci'
        });
    }
    async setAsaciResponse(asaciReference, responsePayload) {
        await this.update({
            status: AsaciRequestStatus.ASACI_PROCESSING,
            asaciReference,
            asaciResponsePayload: responsePayload,
            asaciCompletedAt: new Date(),
            statusMessage: 'Response received from Asaci'
        });
    }
    // Static methods
    static async findByStatus(status) {
        return this.findAll({
            where: { status },
            include: ['user'],
            order: [['created_at', 'DESC']]
        });
    }
    static async findByUser(userId, limit = 10) {
        return this.findAll({
            where: { userId: userId }, // Fixed: use snake_case
            order: [['created_at', 'DESC']], // Fixed: use snake_case
            limit
        });
    }
    static async findPendingRetries(sequelize) {
        return this.findAll({
            where: {
                status: AsaciRequestStatus.FAILED,
                retryCount: {
                    [sequelize_1.Op.lt]: sequelize.literal('max_retries')
                }
            },
            order: [['updated_at', 'ASC']] // Fixed: use snake_case
        });
    }
    static async getStatsByUser(userId, sequelize) {
        const stats = await this.findAll({
            where: { userId: userId }, // Fixed: use snake_case
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });
        return stats.reduce((acc, stat) => {
            acc[stat.status] = parseInt(stat.count);
            return acc;
        }, {});
    }
}
exports.AsaciRequestModel = AsaciRequestModel;
// Model initialization function
function initAsaciRequestModel(sequelize) {
    AsaciRequestModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // Orass Integration
        orassReference: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true
        },
        orassData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        orassFetchedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        // Asaci Integration
        asaciReference: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true
        },
        asaciRequestPayload: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        asaciResponsePayload: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        asaciSubmittedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        asaciCompletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        // Request Details
        officeCode: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        organizationCode: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        certificateType: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(CertificateType)),
            allowNull: false
        },
        emailNotification: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        generatedBy: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true
        },
        channel: {
            type: sequelize_1.DataTypes.ENUM('api', 'web'),
            allowNull: false,
            defaultValue: 'web'
        },
        // Status Tracking
        status: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(AsaciRequestStatus)),
            allowNull: false,
            defaultValue: AsaciRequestStatus.ORASS_FETCHING
        },
        statusMessage: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        // Vehicle/Insurance Data
        vehicleData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        insuredData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        subscriberData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        contractData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        // Results
        certificateUrl: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        certificateData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        downloadCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastDownloadAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        // Error Handling
        errorMessage: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        errorDetails: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        retryCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        maxRetries: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
        },
        // Audit
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        completedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'AsaciRequest',
        tableName: 'asaci_requests',
        timestamps: true,
        underscored: true, // This converts camelCase to snake_case
        indexes: [
            {
                // ✅ Fixed: Use snake_case column names for indexes
                fields: ['user_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['certificate_type']
            },
            {
                fields: ['orass_reference']
            },
            {
                fields: ['asaci_reference']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['status', 'retry_count']
            }
        ],
        hooks: {
            beforeUpdate: (asaciRequest) => {
                asaciRequest.updatedAt = new Date();
            }
        }
    });
    return AsaciRequestModel;
}
exports.default = AsaciRequestModel;
//# sourceMappingURL=asaci-request.model.js.map