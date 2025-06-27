import {AttestationColor, CertificateType, ChannelType, ProductionDataDto, VehicleCode} from "@dto/asaci.dto";

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

// ORASS to ASACI mapping types
export interface AsaciProductionData {
    office_code: string;
    organization_code: string;
    certificate_type: CertificateType;
    email_notification: string;
    generated_by: string;
    channel?: ChannelType;
    productions: ProductionDataDto[];
}

// Certificate color mapping
export type CertificateColorMapping = {
    [key: string]: string;
};

export const CERTIFICATE_COLOR_MAP: CertificateColorMapping = {
    'CIMA_YELLOW': 'cima-jaune',
    'CIMA_GREEN': 'cima-verte',
    'POOLTPV_RED': 'pooltpv-rouge',
    'POOLTPV_BLUE': 'pooltpv-bleu',
    'POOLTPV_BROWN': 'pooltpv-marron',
    'MATCA_BLUE': 'matca-bleu'
};

// Vehicle type mapping for ASACI compliance
export const VEHICLE_TYPE_MAP: { [key: string]: string } = {
    // UV - Urban Vehicles
    'UV01': 'UV01', 'UV02': 'UV02', 'UV03': 'UV03', 'UV04': 'UV04', 'UV05': 'UV05',
    'UV06': 'UV06', 'UV07': 'UV07', 'UV08': 'UV08', 'UV09': 'UV09', 'UV10': 'UV10',

    // ST - Special Transport
    'ST01': 'ST01', 'ST02': 'ST02', 'ST03': 'ST03', 'ST04': 'ST04', 'ST05': 'ST05',
    'ST06': 'ST06', 'ST07': 'ST07', 'ST08': 'ST08', 'ST09': 'ST09', 'ST10': 'ST10',
    'ST11': 'ST11', 'ST12': 'ST12',

    // TA - Transport Agriculture
    'TAPP': 'TAPP', 'TAPM': 'TAPM', 'TSPP': 'TSPP', 'TSPM': 'TSPM',

    // TV - Transport Vehicles
    'TV01': 'TV01', 'TV02': 'TV02', 'TV03': 'TV03', 'TV04': 'TV04', 'TV05': 'TV05',
    'TV06': 'TV06', 'TV07': 'TV07', 'TV08': 'TV08', 'TV09': 'TV09', 'TV10': 'TV10',
    'TV11': 'TV11', 'TV12': 'TV12', 'TV13': 'TV13',

    // GV - Good Vehicles
    'GV01': 'GV01', 'GV02': 'GV02', 'GV03': 'GV03', 'GV04': 'GV04', 'GV05': 'GV05',
    'GV06': 'GV06', 'GV07': 'GV07', 'GV08': 'GV08', 'GV09': 'GV09', 'GV10': 'GV10',
    'GV11': 'GV11', 'GV12': 'GV12',

    // Numeric codes
    '01': '01', '02': '02', '03': '03', '04': '04', '05': '05', '06': '06',
    '07': '07', '08': '08', '09': '09', '10': '10', '11': '11', '12': '12',

    // SE - Special Energy
    'SEES': 'SEES', 'SEDI': 'SEDI', 'SEHY': 'SEHY', 'SEEL': 'SEEL'
};