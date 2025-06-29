import { CertificateType, ChannelType } from "@dto/asaci.dto";
export declare class SearchOrassPoliciesDto {
    policyNumber?: string;
    vehicleRegistration?: string;
    vehicleChassisNumber?: string;
    subscriberName?: string;
    insuredName?: string;
    organizationCode?: string;
    officeCode?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    certificateColor?: string;
    limit?: number;
    offset?: number;
}
export declare class CreateCertificateFromOrassDto {
    policyNumber: string;
    certificateType: CertificateType;
    emailNotification: string;
    generatedBy: string;
    channel?: ChannelType;
    certificateColor?: string;
}
export declare class BulkCreateCertificatesFromOrassDto {
    policyNumbers: string[];
    certificateType: 'cima' | 'pooltpv' | 'matca' | 'pooltpvbleu';
    emailNotification: string;
    generatedBy: string;
    channel?: 'api' | 'web';
    defaultCertificateColor?: string;
}
export declare class ValidateOrassPolicyDto {
    policyNumber: string;
    expectedVehicleRegistration?: string;
    expectedChassisNumber?: string;
}
export declare class OrassPolicyResponseDto {
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
//# sourceMappingURL=certify-link.dto.d.ts.map