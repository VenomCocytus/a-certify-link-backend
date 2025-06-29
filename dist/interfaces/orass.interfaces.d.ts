import { CertificateType, ChannelType, ProductionDataDto } from "@dto/asaci.dto";
export interface OrassConnectionConfig {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout?: number;
    requestTimeout?: number;
}
export interface OrassPolicy {
    policyNumber: string;
    organizationCode: string;
    officeCode: string;
    subscriberName: string;
    subscriberPhone: string;
    subscriberEmail: string;
    subscriberAddress: string;
    insuredName: string;
    insuredPhone: string;
    insuredEmail: string;
    insuredAddress: string;
    vehicleRegistration: string;
    vehicleChassisNumber: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleType: string;
    vehicleCategory: string;
    vehicleUsage: string;
    vehicleGenre: string;
    vehicleEnergy: string;
    vehicleSeats: number;
    vehicleFiscalPower: number;
    vehicleUsefulLoad: number;
    fleetReduction: number;
    subscriberType: string;
    premiumRC: number;
    contractStartDate: Date;
    contractEndDate: Date;
    opATD?: string;
    certificateColor: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface OrassPolicySearchCriteria {
    policyNumber?: string;
    vehicleRegistration?: string;
    vehicleChassisNumber?: string;
    subscriberName?: string;
    insuredName?: string;
    organizationCode?: string;
    officeCode?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    certificateColor?: string;
}
export interface OrassQueryResult {
    policies: OrassPolicy[];
    totalCount: number;
    hasMore: boolean;
}
export interface OrassConnectionStatus {
    connected: boolean;
    lastChecked: Date;
    error?: string;
    connectionInfo: {
        host: string;
        port: number;
        sid: string;
        username: string;
    };
}
export interface AsaciProductionData {
    office_code: string;
    organization_code: string;
    certificate_type: CertificateType;
    email_notification: string;
    generated_by: string;
    channel?: ChannelType;
    productions: ProductionDataDto[];
}
export type CertificateColorMapping = {
    [key: string]: string;
};
export declare const CERTIFICATE_COLOR_MAP: CertificateColorMapping;
export declare const VEHICLE_TYPE_MAP: {
    [key: string]: string;
};
//# sourceMappingURL=orass.interfaces.d.ts.map