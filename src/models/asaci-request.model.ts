import { DataTypes, Model, Op, Optional, Sequelize } from 'sequelize';
import {CertificateType} from "@interfaces/common.enum";

// Enums for better type safety
export enum AsaciRequestStatus {
    ORASS_FETCHING = 'ORASS_FETCHING',
    ORASS_FETCHED = 'ORASS_FETCHED',
    ASACI_PENDING = 'ASACI_PENDING',
    ASACI_PROCESSING = 'ASACI_PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface AsaciCertificate {
    production: {
        reference: string;
    };
    reference: string;
    state: {
        name: string;
        label: string;
    };
    download_link: string;
    licence_plate: string;
    chassis_number: string;
    police_number: string;
    insured_name: string;
    starts_at: string;
    ends_at: string;
    printed_at: string;
}

export interface AsaciOrganization {
    id: string;
    code: string;
    name: string;
    address: string;
    email: string;
    telephone: string;
    logo_url: string;
    disabled_at: string | null;
    is_disabled: boolean;
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    formatted_updated_at: string;
}

export interface AsaciResponsePayload {
    status: number;
    message: string;
    data: {
        id: string;
        reference: string;
        sent_to_storage: string | null;
        channel: string;
        download_link: string;
        created_at: string;
        quantity: number;
        formatted_created_at: string;
        organization: AsaciOrganization;
        certificates: AsaciCertificate[];
    };
}

// Vehicle data interface
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

// Person data interface
export interface PersonData {
    name: string;
    email: string;
    phone: string;
    postalBox: string;
}

// Subscriber data interface (extends PersonData)
export interface SubscriberData extends PersonData {
    type: string;
}

// Contract data interface
export interface ContractData {
    policyNumber: string;
    effectiveDate: string;
    expirationDate: string;
    rcPremium: number;
    fleetReduction?: number;
    opAtd?: string;
}

// Production Request attributes interface
export interface AsaciRequestAttributes {
    id: string;
    userId: string;

    // Orass Integration
    orassReference?: string;
    orassData?: object;
    orassFetchedAt?: Date;

    // Asaci Integration
    asaciReference?: string;
    asaciRequestPayload?: object;
    asaciResponsePayload?: object;
    asaciSubmittedAt?: Date;
    asaciCompletedAt?: Date;

    // Request Details
    officeCode: string;
    organizationCode: string;
    certificateType: CertificateType;
    emailNotification?: string;
    generatedBy?: string;
    channel: 'api' | 'web';

    // Status Tracking
    status: AsaciRequestStatus;
    statusMessage?: string;

    // Vehicle/Insurance Data
    vehicleData?: VehicleData;
    insuredData?: PersonData;
    subscriberData?: SubscriberData;
    contractData?: ContractData;

    // Results
    certificateUrl?: string;
    certificateData?: object;
    downloadCount: number;
    lastDownloadAt?: Date;

    // Error Handling
    errorMessage?: string;
    errorDetails?: object;
    retryCount: number;
    maxRetries: number;

    // Audit
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

// Optional attributes for creation
export interface AsaciRequestCreationAttributes extends Optional<AsaciRequestAttributes,
    'id' | 'orassReference' | 'orassData' | 'orassFetchedAt' | 'asaciReference' |
    'asaciRequestPayload' | 'asaciResponsePayload' | 'asaciSubmittedAt' | 'asaciCompletedAt' |
    'emailNotification' | 'generatedBy' | 'status' | 'statusMessage' | 'vehicleData' |
    'insuredData' | 'subscriberData' | 'contractData' | 'certificateUrl' | 'certificateData' |
    'downloadCount' | 'lastDownloadAt' | 'errorMessage' | 'errorDetails' | 'retryCount' |
    'maxRetries' | 'createdAt' | 'updatedAt' | 'completedAt'> {}

export class AsaciRequestModel extends Model<AsaciRequestAttributes, AsaciRequestCreationAttributes>
    implements AsaciRequestAttributes {

    public id!: string;
    public userId!: string;

    // Orass Integration
    public orassReference?: string;
    public orassData?: object;
    public orassFetchedAt?: Date;

    // Asaci Integration
    public asaciReference?: string;
    public asaciRequestPayload?: object;
    public asaciResponsePayload?: AsaciResponsePayload;
    public asaciSubmittedAt?: Date;
    public asaciCompletedAt?: Date;

    // Request Details
    public officeCode!: string;
    public organizationCode!: string;
    public certificateType!: CertificateType;
    public emailNotification?: string;
    public generatedBy?: string;
    public channel!: 'api' | 'web';

    // Status Tracking
    public status!: AsaciRequestStatus;
    public statusMessage?: string;

    // Vehicle/Insurance Data
    public vehicleData?: VehicleData;
    public insuredData?: PersonData;
    public subscriberData?: SubscriberData;
    public contractData?: ContractData;

    // Results
    public certificateUrl?: string;
    public certificateData?: object;
    public downloadCount!: number;
    public lastDownloadAt?: Date;

    // Error Handling
    public errorMessage?: string;
    public errorDetails?: object;
    public retryCount!: number;
    public maxRetries!: number;

    // Audit
    public readonly createdAt!: Date;
    public updatedAt!: Date;
    public completedAt?: Date;

    // Virtual fields
    public get isCompleted(): boolean {
        return this.status === AsaciRequestStatus.COMPLETED;
    }

    public get isFailed(): boolean {
        return this.status === AsaciRequestStatus.FAILED;
    }

    public get canRetry(): boolean {
        return this.isFailed && this.retryCount < this.maxRetries;
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
            retryCount: this.retryCount + 1
        });
    }

    public async incrementDownloadCount(): Promise<void> {
        await this.update({
            downloadCount: this.downloadCount + 1,
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
            include: ['user'],
            order: [['created_at', 'DESC']]
        });
    }

    public static async findByUser(userId: string, limit: number = 10): Promise<AsaciRequestModel[]> {
        return this.findAll({
            where: { userId: userId }, // Fixed: use snake_case
            order: [['created_at', 'DESC']], // Fixed: use snake_case
            limit
        });
    }

    public static async findPendingRetries(sequelize: Sequelize): Promise<AsaciRequestModel[]> {
        return this.findAll({
            where: {
                status: AsaciRequestStatus.FAILED,
                retryCount: { // Fixed: use snake_case
                    [Op.lt]: sequelize.literal('max_retries')
                }
            },
            order: [['updated_at', 'ASC']] // Fixed: use snake_case
        });
    }

    public static async getStatsByUser(userId: string, sequelize: Sequelize): Promise<any> {
        const stats = await this.findAll({
            where: { userId: userId }, // Fixed: use snake_case
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
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // Orass Integration
        orassReference: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        orassData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        orassFetchedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Asaci Integration
        asaciReference: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        asaciRequestPayload: {
            type: DataTypes.JSON,
            allowNull: true
        },
        asaciResponsePayload: {
            type: DataTypes.JSON,
            allowNull: true
        },
        asaciSubmittedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        asaciCompletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Request Details
        officeCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        organizationCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        certificateType: {
            type: DataTypes.ENUM(...Object.values(CertificateType)),
            allowNull: false
        },
        emailNotification: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        generatedBy: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        channel: {
            type: DataTypes.ENUM('api', 'web'),
            allowNull: false,
            defaultValue: 'web'
        },

        // Status Tracking
        status: {
            type: DataTypes.ENUM(...Object.values(AsaciRequestStatus)),
            allowNull: false,
            defaultValue: AsaciRequestStatus.ORASS_FETCHING
        },
        statusMessage: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        // Vehicle/Insurance Data
        vehicleData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        insuredData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        subscriberData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        contractData: {
            type: DataTypes.JSON,
            allowNull: true
        },

        // Results
        certificateUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        certificateData: {
            type: DataTypes.JSON,
            allowNull: true
        },
        downloadCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastDownloadAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Error Handling
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        errorDetails: {
            type: DataTypes.JSON,
            allowNull: true
        },
        retryCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        maxRetries: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
        },

        // Audit
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        completedAt: {
            type: DataTypes.DATE,
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
            beforeUpdate: (asaciRequest: AsaciRequestModel) => {
                asaciRequest.updatedAt = new Date();
            }
        }
    });

    return AsaciRequestModel;
}

export default AsaciRequestModel;