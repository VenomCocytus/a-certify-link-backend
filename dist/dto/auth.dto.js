"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockUserDto = exports.CreateUserDto = exports.LogoutDto = exports.RefreshTokenDto = exports.UpdateProfileDto = exports.TwoFactorDisableDto = exports.TwoFactorSetupDto = exports.ResendVerificationDto = exports.VerifyEmailDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.ChangePasswordDto = exports.RegisterDto = exports.LoginDto = void 0;
exports.ValidatePasswordConfirmation = ValidatePasswordConfirmation;
const class_validator_1 = require("class-validator");
// Login DTO
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoginDto.prototype, "rememberMe", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "twoFactorCode", void 0);
// Register DTO
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot exceed 100 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password confirmation is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "confirmPassword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Phone number must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Phone number cannot exceed 20 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { message: 'Invalid role ID format' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "roleId", void 0);
// Change Password DTO
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Current password is required' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'New password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot exceed 100 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password confirmation is required' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "confirmPassword", void 0);
// Forgot Password DTO
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
// Reset Password DTO
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reset token is required' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'New password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot exceed 100 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password confirmation is required' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "confirmPassword", void 0);
// Verify Email DTO
class VerifyEmailDto {
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Verification token is required' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: 'Invalid user ID format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID is required' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "userId", void 0);
// Resend Verification DTO
class ResendVerificationDto {
}
exports.ResendVerificationDto = ResendVerificationDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], ResendVerificationDto.prototype, "email", void 0);
// Two Factor Setup DTO
class TwoFactorSetupDto {
}
exports.TwoFactorSetupDto = TwoFactorSetupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Two-factor code is required' }),
    (0, class_validator_1.MinLength)(6, { message: 'Two-factor code must be 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'Two-factor code must be 6 digits' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'Two-factor code must be 6 digits' }),
    __metadata("design:type", String)
], TwoFactorSetupDto.prototype, "code", void 0);
// Two Factor Disable DTO
class TwoFactorDisableDto {
}
exports.TwoFactorDisableDto = TwoFactorDisableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required to disable two-factor authentication' }),
    __metadata("design:type", String)
], TwoFactorDisableDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Two-factor code is required' }),
    (0, class_validator_1.MinLength)(6, { message: 'Two-factor code must be 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'Two-factor code must be 6 digits' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'Two-factor code must be 6 digits' }),
    __metadata("design:type", String)
], TwoFactorDisableDto.prototype, "code", void 0);
// Update Profile DTO
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Phone number must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Phone number cannot exceed 20 characters' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phoneNumber", void 0);
// Refresh Token DTO
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Refresh token is required' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
// Logout DTO
class LogoutDto {
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LogoutDto.prototype, "logoutAll", void 0);
// Admin User Creation DTO
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Phone number must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Phone number cannot exceed 20 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: 'Invalid role ID format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Role ID is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "sendWelcomeEmail", void 0);
// Block/Unblock User DTO
class BlockUserDto {
}
exports.BlockUserDto = BlockUserDto;
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: 'Invalid user ID format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID is required' }),
    __metadata("design:type", String)
], BlockUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Reason cannot exceed 500 characters' }),
    __metadata("design:type", String)
], BlockUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "blockDuration", void 0);
// Custom validation for password confirmation
function ValidatePasswordConfirmation(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.ValidateIf)(o => o.password !== undefined)(object, propertyName);
        (0, class_validator_1.Matches)(/.*/, {
            message: 'Password confirmation must match the password',
            ...validationOptions
        })(object, propertyName);
    };
}
//# sourceMappingURL=auth.dto.js.map