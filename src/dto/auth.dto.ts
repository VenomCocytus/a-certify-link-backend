import {
    IsEmail,
    IsString,
    IsOptional,
    IsUUID,
    IsBoolean,
    MinLength,
    MaxLength,
    Matches,
    IsNotEmpty,
    ValidateIf
} from 'class-validator';

// Login DTO
export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;

    @IsOptional()
    @IsString()
    twoFactorCode?: string;
}

// Register DTO
export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    lastName: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Password confirmation is required' })
    confirmPassword: string;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
    phoneNumber?: string;

    @IsOptional()
    @IsUUID(4, { message: 'Invalid role ID format' })
    roleId?: string;
}

// Change Password DTO
export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Current password is required' })
    currentPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Password confirmation is required' })
    confirmPassword: string;
}

// Forgot Password DTO
export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

// Reset Password DTO
export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Reset token is required' })
    token: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Password confirmation is required' })
    confirmPassword: string;
}

// Verify Email DTO
export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty({ message: 'Verification token is required' })
    token: string;

    @IsUUID(4, { message: 'Invalid user ID format' })
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;
}

// Resend Verification DTO
export class ResendVerificationDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

// Two Factor Setup DTO
export class TwoFactorSetupDto {
    @IsString()
    @IsNotEmpty({ message: 'Two-factor code is required' })
    @MinLength(6, { message: 'Two-factor code must be 6 digits' })
    @MaxLength(6, { message: 'Two-factor code must be 6 digits' })
    @Matches(/^\d{6}$/, { message: 'Two-factor code must be 6 digits' })
    code: string;
}

// Two Factor Disable DTO
export class TwoFactorDisableDto {
    @IsString()
    @IsNotEmpty({ message: 'Password is required to disable two-factor authentication' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Two-factor code is required' })
    @MinLength(6, { message: 'Two-factor code must be 6 digits' })
    @MaxLength(6, { message: 'Two-factor code must be 6 digits' })
    @Matches(/^\d{6}$/, { message: 'Two-factor code must be 6 digits' })
    code: string;
}

// Update Profile DTO
export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    lastName?: string;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
    phoneNumber?: string;
}

// Refresh Token DTO
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}

// Logout DTO
export class LogoutDto {
    @IsOptional()
    @IsBoolean()
    logoutAll?: boolean; // Logout from all devices
}

// Admin User Creation DTO
export class CreateUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    lastName: string;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
    phoneNumber?: string;

    @IsUUID(4, { message: 'Invalid role ID format' })
    @IsNotEmpty({ message: 'Role ID is required' })
    roleId: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    sendWelcomeEmail?: boolean;
}

// Block/Unblock User DTO
export class BlockUserDto {
    @IsUUID(4, { message: 'Invalid user ID format' })
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
    reason?: string;

    @IsOptional()
    @IsString()
    blockDuration?: string; // e.g., "1h", "1d", "permanent"
}

// Custom validation for password confirmation
export function ValidatePasswordConfirmation(validationOptions?: any) {
    return function (object: any, propertyName: string) {
        ValidateIf(o => o.password !== undefined)(object, propertyName);
        Matches(/.*/, {
            message: 'Password confirmation must match the password',
            ...validationOptions
        })(object, propertyName);
    };
}