import { Model, Optional, Sequelize } from 'sequelize';
import { CertificateType } from "@dto/asaci.dto";
export declare enum AsaciRequestStatus {
    ORASS_FETCHING = "ORASS_FETCHING",
    ORASS_FETCHED = "ORASS_FETCHED",
    ASACI_PENDING = "ASACI_PENDING",
    ASACI_PROCESSING = "ASACI_PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
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
    channel: 'api' | 'web';
    status: AsaciRequestStatus;
    statusMessage?: string;
    vehicleData?: VehicleData;
    insuredData?: PersonData;
    subscriberData?: SubscriberData;
    contractData?: ContractData;
    certificateUrl?: string;
    certificateData?: object;
    downloadCount: number;
    lastDownloadAt?: Date;
    errorMessage?: string;
    errorDetails?: object;
    retryCount: number;
    maxRetries: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
export interface AsaciRequestCreationAttributes extends Optional<AsaciRequestAttributes, 'id' | 'orassReference' | 'orassData' | 'orassFetchedAt' | 'asaciReference' | 'asaciRequestPayload' | 'asaciResponsePayload' | 'asaciSubmittedAt' | 'asaciCompletedAt' | 'emailNotification' | 'generatedBy' | 'status' | 'statusMessage' | 'vehicleData' | 'insuredData' | 'subscriberData' | 'contractData' | 'certificateUrl' | 'certificateData' | 'downloadCount' | 'lastDownloadAt' | 'errorMessage' | 'errorDetails' | 'retryCount' | 'maxRetries' | 'createdAt' | 'updatedAt' | 'completedAt'> {
}
export declare class AsaciRequestModel extends Model<AsaciRequestAttributes, AsaciRequestCreationAttributes> implements AsaciRequestAttributes {
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
    channel: 'api' | 'web';
    status: AsaciRequestStatus;
    statusMessage?: string;
    vehicleData?: VehicleData;
    insuredData?: PersonData;
    subscriberData?: SubscriberData;
    contractData?: ContractData;
    certificateUrl?: string;
    certificateData?: object;
    downloadCount: number;
    lastDownloadAt?: Date;
    errorMessage?: string;
    errorDetails?: object;
    retryCount: number;
    maxRetries: number;
    readonly createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    get isCompleted(): boolean;
    get isFailed(): boolean;
    get canRetry(): boolean;
    get totalProcessingTime(): number | null;
    updateStatus(status: AsaciRequestStatus, message?: string, additionalData?: Partial<AsaciRequestAttributes>): Promise<void>;
    markAsCompleted(certificateUrl: string, certificateData?: object): Promise<void>;
    markAsFailed(errorMessage: string, errorDetails?: object): Promise<void>;
    incrementDownloadCount(): Promise<void>;
    setOrassData(orassReference: string, data: object): Promise<void>;
    setAsaciRequest(requestPayload: object): Promise<void>;
    setAsaciResponse(asaciReference: string, responsePayload: object): Promise<void>;
    static findByStatus(status: AsaciRequestStatus): Promise<AsaciRequestModel[]>;
    static findByUser(userId: string, limit?: number): Promise<AsaciRequestModel[]>;
    static findPendingRetries(sequelize: Sequelize): Promise<AsaciRequestModel[]>;
    static getStatsByUser(userId: string, sequelize: Sequelize): Promise<any>;
}
export declare function initAsaciRequestModel(sequelize: Sequelize): typeof AsaciRequestModel;
export default AsaciRequestModel;
//# sourceMappingURL=asaci-request.model.d.ts.map