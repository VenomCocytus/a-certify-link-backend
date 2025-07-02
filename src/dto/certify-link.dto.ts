import {
    IsString,
    IsOptional,
    IsArray,
    IsInt,
    IsEmail,
    IsNotEmpty,
    Min,
    Max,
    IsEnum,
    ArrayMinSize, ArrayMaxSize
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTO for searching ORASS policies
export class SearchOrassPoliciesDto {
    @IsString()
    @Transform(({ value }) => value?.trim())
    policyNumber?: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    applicantCode?: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    endorsementNumber?: string;

    @IsOptional()
    @IsString()
    organizationCode?: string;

    @IsOptional()
    @IsString()
    officeCode?: string;

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

/**
 * Response DTO for created edition request
 */
export class EditionRequestCreatedDto {
    requestId: string;
    status: string;
    message: string;
    processedPolicies: number;
    failedPolicies: number;
    errors?: string[];
    createdAt: Date;
}

export class GetCertificateDownloadLinkDto {
    @IsString()
    certificateReference!: string;
}

export class BatchGetCertificateDownloadLinksDto {
    @IsString({ each: true })
    @ArrayMaxSize(50, { message: 'Maximum 50 certificate references allowed' })
    @ArrayMinSize(1, { message: 'At least one certificate reference is required' })
    certificateReferences!: string[];
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