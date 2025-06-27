export declare class LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
    twoFactorCode?: string;
}
export declare class RegisterDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    roleId?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
    userId: string;
}
export declare class ResendVerificationDto {
    email: string;
}
export declare class TwoFactorSetupDto {
    code: string;
}
export declare class TwoFactorDisableDto {
    password: string;
    code: string;
}
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class LogoutDto {
    logoutAll?: boolean;
}
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roleId: string;
    isActive?: boolean;
    sendWelcomeEmail?: boolean;
}
export declare class BlockUserDto {
    userId: string;
    reason?: string;
    blockDuration?: string;
}
export declare function ValidatePasswordConfirmation(validationOptions?: any): (object: any, propertyName: string) => void;
//# sourceMappingURL=auth.dto.d.ts.map