import {
    IsString,
    IsOptional,
    IsArray,
    IsInt,
    IsEmail,
    IsDateString,
    IsNotEmpty,
    Min,
    Max,
    IsEnum,
    ArrayMinSize
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {CertificateType, ChannelType} from "@dto/asaci.dto";

// DTO for searching ORASS policies
export class SearchOrassPoliciesDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    policyNumber?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim()?.toUpperCase())
    vehicleRegistration?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim()?.toUpperCase())
    vehicleChassisNumber?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    subscriberName?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    insuredName?: string;

    @IsOptional()
    @IsString()
    organizationCode?: string;

    @IsOptional()
    @IsString()
    officeCode?: string;

    @IsOptional()
    @IsDateString()
    contractStartDate?: string;

    @IsOptional()
    @IsDateString()
    contractEndDate?: string;

    @IsOptional()
    @IsString()
    certificateColor?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1000)
    @Type(() => Number)
    limit?: number = 100;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    offset?: number = 0;
}

// DTO for creating certificate production from ORASS policy
export class CreateCertificateFromOrassDto {
    @IsString()
    @IsNotEmpty()
    policyNumber: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(CertificateType)
    certificateType: CertificateType;

    @IsEmail()
    @IsNotEmpty()
    emailNotification: string;

    @IsString()
    @IsNotEmpty()
    generatedBy: string;

    @IsOptional()
    @IsEnum(ChannelType)
    channel?: ChannelType;

    @IsOptional()
    @IsString()
    certificateColor?: string; // Override policy certificate color if needed
}

// DTO for bulk certificate creation from multiple ORASS policies
export class BulkCreateCertificatesFromOrassDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one policy number is required' })
    @IsString({ each: true })
    policyNumbers: string[];

    @IsString()
    @IsNotEmpty()
    certificateType: 'cima' | 'pooltpv' | 'matca' | 'pooltpvbleu';

    @IsEmail()
    @IsNotEmpty()
    emailNotification: string;

    @IsString()
    @IsNotEmpty()
    generatedBy: string;

    @IsOptional()
    @IsEnum(['api', 'web'])
    channel?: 'api' | 'web' = 'api';

    @IsOptional()
    @IsString()
    defaultCertificateColor?: string; // Default color for policies without specific color
}

// DTO for validating ORASS policy before certificate creation
export class ValidateOrassPolicyDto {
    @IsString()
    @IsNotEmpty()
    policyNumber: string;

    @IsOptional()
    @IsString()
    expectedVehicleRegistration?: string;

    @IsOptional()
    @IsString()
    expectedChassisNumber?: string;
}

// Response DTO for ORASS policy search
export class OrassPolicyResponseDto {
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