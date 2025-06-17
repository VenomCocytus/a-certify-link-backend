import { IsOptional, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
    @IsOptional()
    @IsNumberString()
    @Transform(({ value }) => parseInt(value, 10))
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumberString()
    @Transform(({ value }) => parseInt(value, 10))
    @Min(1)
    @Max(100)
    limit?: number = 10;
}

export class CertificateListQueryDto extends PaginationQueryDto {
    @IsOptional()
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'suspended';

    @IsOptional()
    companyCode?: string;

    @IsOptional()
    policyNumber?: string;

    @IsOptional()
    registrationNumber?: string;

    @IsOptional()
    dateFrom?: string;

    @IsOptional()
    dateTo?: string;
}

export class AuditLogQueryDto extends PaginationQueryDto {
    @IsOptional()
    userId?: string;

    @IsOptional()
    action?: string;

    @IsOptional()
    resourceType?: string;

    @IsOptional()
    resourceId?: string;

    @IsOptional()
    dateFrom?: string;

    @IsOptional()
    dateTo?: string;
}