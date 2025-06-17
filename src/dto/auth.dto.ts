import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    IsUUID,
    IsOptional,
    IsArray,
    IsBoolean,
    IsDate
} from 'class-validator';

export class LoginRequest {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}

export class RefreshTokenRequest {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}

export class ChangePasswordRequest {
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword!: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword!: string;
}

export class VerifyTokenRequest {
    @IsString()
    @IsNotEmpty()
    token!: string;
}

export class UnlockAccountRequest {
    @IsUUID()
    @IsNotEmpty()
    userId!: string;
}

export class UserProfileRequest {
    @IsUUID()
    id!: string;

    @IsEmail()
    email!: string;

    @IsString()
    firstName!: string;

    @IsString()
    lastName!: string;

    @IsString()
    role!: string;

    @IsOptional()
    @IsString()
    companyCode?: string | null;

    @IsOptional()
    @IsString()
    agentCode?: string | null;

    @IsArray()
    @IsString({ each: true })
    permissions!: string[];

    @IsBoolean()
    isActive!: boolean;

    @IsOptional()
    @IsDate()
    lastLoginAt?: Date | null;

    @IsDate()
    createdAt!: Date;
}