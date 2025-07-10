import {DataTypes, Model, Op, Optional, Sequelize} from 'sequelize';
import {CertificateType, ChannelType} from "@interfaces/common.enum";

export enum AsaciRequestStatus {
    ORASS_FETCHING = 'ORASS_FETCHING',
    ORASS_FETCHED = 'ORASS_FETCHED',
    ASACI_PENDING = 'ASACI_PENDING',
    ASACI_PROCESSING = 'ASACI_PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface VehicleData {
    chassisNumber: string;
    model: string;
    brand: string;
    registrationNumber?: string;
    vehicleType: string;
    category: string;
    usage: string;
    energy: string;
    numberOfSeats: number;
    fiscalPower?: number;
    usefulLoad?: number;
    fleetReduction?: number;
}

export interface PersonData {
    name: string;
    email: string;
    phone: string;
    postalBox: string;
}

export interface SubscriberData extends PersonData {
    type: string;
}

export interface ContractData {
    policyNumber: string;
    effectiveDate: string;
    expirationDate: string;
    rcPremium: number;
    fleetReduction?: number;
    opAtd?: string;
}

export interface AsaciRequestAttributes {
    id: string;
    userId: string;

    orassReference?: string;
    orassData?: object;
    orassFetchedAt?: Date;

    asaciReference?: string;
    asaciRequestPayload?: object;
    asaciResponsePayload?: object;
    asaciSubmittedAt?: Date;
    asaciCompletedAt?: Date;

    officeCode: string;
    organizationCode: string;
    certificateType: CertificateType;
    emailNotification?: string;
    generatedBy?: string;
    channel: ChannelType;

    status: AsaciRequestStatus;
    statusMessage?: string;

    insuredData?: PersonData;
    subscriberData?: SubscriberData;
    contractData?: ContractData;

    certificateUrl?: string;
    certificateData?: object;
    downloadCount?: number;
    lastDownloadAt?: Date;

    errorMessage?: string;
    errorDetails?: object;
    retryCount?: number;
    maxRetries?: number;

    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface AsaciRequestCreationAttributes extends Optional<AsaciRequestAttributes,
    'id' | 'orassReference' | 'orassData' | 'orassFetchedAt' | 'asaciReference' |
    'asaciRequestPayload' | 'asaciResponsePayload' | 'asaciSubmittedAt' | 'asaciCompletedAt' |
    'emailNotification' | 'generatedBy' | 'status' | 'statusMessage' |
    'insuredData' | 'subscriberData' | 'contractData' | 'certificateUrl' | 'certificateData' |
    'downloadCount' | 'lastDownloadAt' | 'errorMessage' | 'errorDetails' | 'retryCount' |
    'maxRetries' | 'createdAt' | 'updatedAt' | 'completedAt'> {}

export class AsaciRequestModel extends Model<AsaciRequestAttributes, AsaciRequestCreationAttributes>
    implements AsaciRequestAttributes {

    public id!: string;
    public userId!: string;

    public orassReference?: string;
    public orassData?: object;
    public orassFetchedAt?: Date;

    public asaciReference?: string;
    public asaciRequestPayload?: object;
    public asaciResponsePayload?: object;
    public asaciSubmittedAt?: Date;
    public asaciCompletedAt?: Date;

    public officeCode!: string;
    public organizationCode!: string;
    public certificateType!: CertificateType;
    public emailNotification?: string;
    public generatedBy?: string;
    public channel!: ChannelType;

    public status!: AsaciRequestStatus;
    public statusMessage?: string;

    public insuredData?: PersonData;
    public subscriberData?: SubscriberData;
    public contractData?: ContractData;

    public certificateUrl?: string;
    public certificateData?: object;
    public downloadCount?: number;
    public lastDownloadAt?: Date;

    public errorMessage?: string;
    public errorDetails?: object;
    public retryCount?: number;
    public maxRetries?: number;

    public readonly createdAt!: Date;
    public updatedAt!: Date;
    public completedAt?: Date;

    public get isCompleted(): boolean {
        return this.status === AsaciRequestStatus.COMPLETED;
    }

    public get isFailed(): boolean {
        return this.status === AsaciRequestStatus.FAILED;
    }

    public get canRetry(): boolean {
        return this.isFailed && (this.retryCount || 0) < (this.maxRetries || 3);
    }

    public get totalProcessingTime(): number | null {
        if (!this.completedAt) return null;
        return this.completedAt.getTime() - this.createdAt.getTime();
    }

    // Instance methods
    public async updateStatus(
        status: AsaciRequestStatus,
        message?: string,
        additionalData?: Partial<AsaciRequestAttributes>
    ): Promise<void> {
        const updateData: any = {
            status,
            statusMessage: message,
            ...additionalData
        };

        if (status === AsaciRequestStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }

        await this.update(updateData);
    }

    public async markAsCompleted(certificateUrl: string, certificateData?: object): Promise<void> {
        await this.update({
            status: AsaciRequestStatus.COMPLETED,
            certificateUrl,
            certificateData,
            completedAt: new Date(),
            statusMessage: 'Certificate generated successfully'
        });
    }

    public async markAsFailed(errorMessage: string, errorDetails?: object): Promise<void> {
        await this.update({
            status: AsaciRequestStatus.FAILED,
            errorMessage,
            errorDetails,
            retryCount: this.retryCount ? + this.retryCount + 1 : 0
        });
    }

    public async incrementDownloadCount(): Promise<void> {
        await this.update({
            downloadCount: this.downloadCount ?  this.downloadCount + 1 : 0,
            lastDownloadAt: new Date()
        });
    }

    public async setOrassData(orassReference: string, data: object): Promise<void> {
        await this.update({
            status: AsaciRequestStatus.ORASS_FETCHED,
            orassReference,
            orassData: data,
            orassFetchedAt: new Date(),
            statusMessage: 'Data fetched from Orass successfully'
        });
    }

    public async setAsaciRequest(requestPayload: object): Promise<void> {
        await this.update({
            status: AsaciRequestStatus.ASACI_PENDING,
            asaciRequestPayload: requestPayload,
            asaciSubmittedAt: new Date(),
            statusMessage: 'Request submitted to Asaci'
        });
    }

    public async setAsaciResponse(asaciReference: string, responsePayload: object): Promise<void> {
        await this.update({
            status: AsaciRequestStatus.ASACI_PROCESSING,
            asaciReference,
            asaciResponsePayload: responsePayload,
            asaciCompletedAt: new Date(),
            statusMessage: 'Response received from Asaci'
        });
    }

    // Static methods
    public static async findByStatus(status: AsaciRequestStatus): Promise<AsaciRequestModel[]> {
        return this.findAll({
            where: { status },
            order: [['createdAt', 'DESC']]
        });
    }

    public static async findByUser(userId: string, limit: number = 10): Promise<AsaciRequestModel[]> {
        return this.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit
        });
    }

    public static async findPendingRetries(sequelize: Sequelize): Promise<AsaciRequestModel[]> {
        return this.findAll({
            where: {
                status: AsaciRequestStatus.FAILED,
                retryCount: {
                    [Op.lt]: sequelize.col('maxRetries')
                }
            },
            order: [['updatedAt', 'ASC']]
        });
    }

    public static async getStatsByUser(userId: string, sequelize: Sequelize): Promise<any> {
        const stats = await this.findAll({
            where: { userId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        return stats.reduce((acc: any, stat: any) => {
            acc[stat.status] = parseInt(stat.count);
            return acc;
        }, {});
    }
}

// Helper function to serialize JSON for MSSQL
function serializeJson(value: any): string | null {
    if (value === null || value === undefined) return null;
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('Error serializing JSON:', error);
        return null;
    }
}

// Helper function to deserialize JSON for MSSQL
function deserializeJson(value: string | null): any {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('Error deserializing JSON:', error);
        return null;
    }
}

// Model initialization function
export function initAsaciRequestModel(sequelize: Sequelize): typeof AsaciRequestModel {
    AsaciRequestModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // Orass Integration
        orassReference: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'orass_reference'
        },
        orassData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'orass_data',
            get() {
                const value = this.getDataValue('orassData') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('orassData', serializeJson(value) as any);
            }
        },
        orassFetchedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'orass_fetched_at'
        },

        // Asaci Integration
        asaciReference: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'asaci_reference'
        },
        asaciRequestPayload: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'asaci_request_payload',
            get() {
                const value = this.getDataValue('asaciRequestPayload') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('asaciRequestPayload', serializeJson(value) as any);
            }
        },
        asaciResponsePayload: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'asaci_response_payload',
            get() {
                const value = this.getDataValue('asaciResponsePayload') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('asaciResponsePayload', serializeJson(value) as any);
            }
        },
        asaciSubmittedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'asaci_submitted_at'
        },
        asaciCompletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'asaci_completed_at'
        },

        // Request Details
        officeCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'office_code',
            validate: {
                notEmpty: true
            }
        },
        organizationCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'organization_code',
            validate: {
                notEmpty: true
            }
        },
        certificateType: {
            type: DataTypes.STRING(50), // Changed from ENUM to STRING for MSSQL
            allowNull: false,
            field: 'certificate_type',
            validate: {
                isIn: [Object.values(CertificateType)]
            }
        },
        emailNotification: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'email_notification',
            validate: {
                isEmail: true
            }
        },
        generatedBy: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'generated_by'
        },
        channel: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: [['api', 'web']]
            }
        },

        // Status Tracking
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: [Object.values(AsaciRequestStatus)]
            }
        },
        statusMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'status_message'
        },

        insuredData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'insured_data',
            get() {
                const value = this.getDataValue('insuredData') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('insuredData', serializeJson(value) as any);
            }
        },
        subscriberData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'subscriber_data',
            get() {
                const value = this.getDataValue('subscriberData') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('subscriberData', serializeJson(value) as any);
            }
        },
        contractData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'contract_data',
            get() {
                const value = this.getDataValue('contractData') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('contractData', serializeJson(value) as any);
            }
        },

        // Results
        certificateUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'certificate_url'
        },
        certificateData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'certificate_data',
            get() {
                const value = this.getDataValue('certificateData') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('certificateData', serializeJson(value) as any);
            }
        },
        downloadCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'download_count'
        },
        lastDownloadAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_download_at'
        },

        // Error Handling
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'error_message'
        },
        errorDetails: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'error_details',
            get() {
                const value = this.getDataValue('errorDetails') as unknown as string;
                return deserializeJson(value);
            },
            set(value: any) {
                this.setDataValue('errorDetails', serializeJson(value) as any);
            }
        },
        retryCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'retry_count'
        },
        maxRetries: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_retries'
        },

        // Audit
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
        }
    }, {
        sequelize,
        modelName: 'AsaciRequest',
        tableName: 'asaci_requests',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_asaci_requests_user_id',
                fields: ['user_id']
            },
            {
                name: 'idx_asaci_requests_status',
                fields: ['status']
            },
            {
                name: 'idx_asaci_requests_certificate_type',
                fields: ['certificate_type']
            },
            {
                name: 'idx_asaci_requests_orass_reference',
                fields: ['orass_reference']
            },
            {
                name: 'idx_asaci_requests_asaci_reference',
                fields: ['asaci_reference']
            },
            {
                name: 'idx_asaci_requests_created_at',
                fields: ['created_at']
            },
            {
                name: 'idx_asaci_requests_status_retry_count',
                fields: ['status', 'retry_count']
            }
        ],
        hooks: {
            beforeCreate: (asaciRequest: AsaciRequestModel) => {
                if (asaciRequest.channel === undefined) asaciRequest.setDataValue('channel', ChannelType.WEB);
                if (asaciRequest.status === undefined) asaciRequest.setDataValue('status', AsaciRequestStatus.ORASS_FETCHING);
                if (asaciRequest.downloadCount === undefined) asaciRequest.setDataValue('downloadCount', 0);
                if (asaciRequest.retryCount === undefined) asaciRequest.setDataValue('retryCount', 0);
                if (asaciRequest.maxRetries === undefined) asaciRequest.setDataValue('maxRetries', 3);
            },
            beforeUpdate: (asaciRequest: AsaciRequestModel) => {
                asaciRequest.updatedAt = new Date();
            }
        }
    });

    return AsaciRequestModel;
}

export default AsaciRequestModel;