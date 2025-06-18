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

export class ResetPasswordRequest {
    @IsUUID()
    @IsNotEmpty()
    userId!: string;

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
    @IsString()
    @IsNotEmpty()
    token!: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        companyCode?: string;
        agentCode?: string;
        permissions: string[];
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    id: string;
    email: string;
    role: string;
    companyCode?: string;
    agentCode?: string;
    permissions: string[];
    type?: 'access' | 'refresh';
    iat: number;
    exp: number;
}