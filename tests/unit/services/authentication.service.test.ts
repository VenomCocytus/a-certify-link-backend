import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { AuthenticationService } from '@services/authentication.service';
import { UserModel } from '@models/user.model';
import { RoleModel } from '@models/role.model';
import {createMockUser, createMockRole, createMockCryptoHash, createMockJWT, createMockSpeakeasy, createMockQRCode, createValidLoginDto, createValidRegisterDto, createValidChangePasswordDto, TEST_DATA, setupTestEnvironment, expectValidationError, expectBaseError} from '../../utils/test.utils';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('@models/user.model');
jest.mock('@models/role.model');
jest.mock('@utils/logger');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>;
const mockedQrcode = qrcode as jest.Mocked<typeof qrcode>;
const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>& {
    findOne: jest.MockedFunction<any>;
    findByPk: jest.MockedFunction<any>;
    findByEmail: jest.MockedFunction<any>;
    createUser: jest.MockedFunction<any>;
};
const mockedRoleModel = RoleModel as jest.Mocked<typeof RoleModel>;

describe('AuthenticationService', () => {
    let authService: AuthenticationService;
    let mockUser: any;
    let mockRole: any;
    let mockJWT: any;
    let mockSpeakeasyImpl: any;
    let mockQRCodeImpl: any;

    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnvironment();

        authService = new AuthenticationService();
        mockUser = createMockUser();
        mockRole = createMockRole();
        mockJWT = createMockJWT();
        mockSpeakeasyImpl = createMockSpeakeasy();
        mockQRCodeImpl = createMockQRCode();

        // Setup mocked implementations
        Object.assign(mockedJwt, mockJWT);
        Object.assign(mockedSpeakeasy, mockSpeakeasyImpl);
        Object.assign(mockedQrcode, mockQRCodeImpl);
    });

    describe('login', () => {
        it('should successfully login a user with valid credentials', async () => {
            // Arrange
            const loginDto = createValidLoginDto();
            mockUser.validatePassword.mockResolvedValue(true);
            mockedUserModel.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await authService.login(loginDto);

            // Assert
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(result.user.email).toBe(loginDto.email);
            expect(mockUser.resetLoginAttempts).toHaveBeenCalled();
            expect(mockedUserModel.findOne).toHaveBeenCalledWith({
                where: { email: loginDto.email },
                include: [{
                    model: RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
            });
        });

        it('should throw ValidationException for non-existent user', async () => {
            // Arrange
            const loginDto = createValidLoginDto();
            mockedUserModel.findOne.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.login(loginDto).catch(e => e);
            expectValidationError(error, 'Invalid email or password');
        });

        it('should throw ValidationException for invalid password', async () => {
            // Arrange
            const loginDto = createValidLoginDto();
            mockUser.validatePassword.mockResolvedValue(false);
            mockedUserModel.findOne.mockResolvedValue(mockUser);

            // Act & Assert
            const error = await authService.login(loginDto).catch(e => e);
            expectValidationError(error, 'Invalid email or password');
            expect(mockUser.incrementLoginAttempts).toHaveBeenCalled();
        });

        it('should throw BaseException for inactive user', async () => {
            // Arrange
            const loginDto = createValidLoginDto();
            const inactiveUser = createMockUser({ isActive: false });
            inactiveUser.validatePassword.mockResolvedValue(true);
            mockedUserModel.findOne.mockResolvedValue(inactiveUser);

            // Act & Assert
            const error = await authService.login(loginDto).catch(e => e);
            expectBaseError(error, 403, 'Account is deactivated');
        });

        it('should generate tokens with remember me option', async () => {
            // Arrange
            const loginDto = createValidLoginDto({ rememberMe: true });
            mockUser.validatePassword.mockResolvedValue(true);
            mockedUserModel.findOne.mockResolvedValue(mockUser);

            // Act
            await authService.login(loginDto);

            // Assert
            expect(mockedJwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUser.id,
                    type: 'access'
                }),
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
        });
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            // Arrange
            const registerDto = createValidRegisterDto();
            mockedUserModel.findByEmail.mockResolvedValue(null);
            mockedRoleModel.getDefaultRole.mockResolvedValue(mockRole);
            mockedUserModel.createUser.mockResolvedValue(mockUser);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash());

            // Act
            const result = await authService.register(registerDto);

            // Assert
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(mockedUserModel.createUser).toHaveBeenCalledWith({
                email: registerDto.email,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                password: registerDto.password,
                phoneNumber: registerDto.phoneNumber,
                roleId: mockRole.id
            });
        });

        it('should throw ValidationException for mismatched passwords', async () => {
            // Arrange
            const registerDto = createValidRegisterDto({ confirmPassword: 'different' });

            // Act & Assert
            const error = await authService.register(registerDto).catch(e => e);
            expectValidationError(error, 'Password confirmation does not match');
        });

        it('should throw ValidationException for existing user', async () => {
            // Arrange
            const registerDto = createValidRegisterDto();
            mockedUserModel.findByEmail.mockResolvedValue(mockUser);

            // Act & Assert
            const error = await authService.register(registerDto).catch(e => e);
            expectValidationError(error, 'User with this email already exists');
        });

        it('should throw BaseException when no default role exists', async () => {
            // Arrange
            const registerDto = createValidRegisterDto();
            mockedUserModel.findByEmail.mockResolvedValue(null);
            mockedRoleModel.getDefaultRole.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.register(registerDto).catch(e => e);
            expectBaseError(error, 500);
        });

        it('should use provided roleId when specified', async () => {
            // Arrange
            const customRole = createMockRole({ id: 'custom-role-id', name: 'ADMIN' });
            const registerDto = createValidRegisterDto({ roleId: customRole.id });
            mockedUserModel.findByEmail.mockResolvedValue(null);
            mockedRoleModel.findByPk.mockResolvedValue(customRole);
            mockedUserModel.createUser.mockResolvedValue(mockUser);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash());

            // Act
            await authService.register(registerDto);

            // Assert
            expect(mockedRoleModel.findByPk).toHaveBeenCalledWith(customRole.id);
            expect(mockedUserModel.createUser).toHaveBeenCalledWith(
                expect.objectContaining({ roleId: customRole.id })
            );
        });
    });

    describe('changePassword', () => {
        it('should successfully change password', async () => {
            // Arrange
            const changePasswordDto = createValidChangePasswordDto();
            mockUser.validatePassword.mockResolvedValue(true);
            mockUser.canChangePassword.mockResolvedValue(true);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act
            await authService.changePassword(mockUser.id, changePasswordDto);

            // Assert
            expect(mockUser.validatePassword).toHaveBeenCalledWith(changePasswordDto.currentPassword);
            expect(mockUser.canChangePassword).toHaveBeenCalledWith(changePasswordDto.newPassword);
            expect(mockUser.updatePassword).toHaveBeenCalledWith(changePasswordDto.newPassword);
        });

        it('should throw ValidationException for mismatched new passwords', async () => {
            // Arrange
            const changePasswordDto = createValidChangePasswordDto({ confirmPassword: 'different' });

            // Act & Assert
            const error = await authService.changePassword(mockUser.id, changePasswordDto).catch(e => e);
            expectValidationError(error, 'Password confirmation does not match');
        });

        it('should throw ValidationException for incorrect current password', async () => {
            // Arrange
            const changePasswordDto = createValidChangePasswordDto();
            mockUser.validatePassword.mockResolvedValue(false);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act & Assert
            const error = await authService.changePassword(mockUser.id, changePasswordDto).catch(e => e);
            expectValidationError(error, 'Current password is incorrect');
        });

        it('should throw BaseException for non-existent user', async () => {
            // Arrange
            const changePasswordDto = createValidChangePasswordDto();
            mockedUserModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.changePassword('invalid-id', changePasswordDto).catch(e => e);
            expectBaseError(error, 404);
        });

        it('should throw ValidationException when password cannot be changed', async () => {
            // Arrange
            const changePasswordDto = createValidChangePasswordDto();
            mockUser.validatePassword.mockResolvedValue(true);
            mockUser.canChangePassword.mockResolvedValue(false);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act & Assert
            const error = await authService.changePassword(mockUser.id, changePasswordDto).catch(e => e);
            expectValidationError(error, 'Cannot reuse a recent password');
        });
    });

    describe('forgotPassword', () => {
        it('should return success message for existing user', async () => {
            // Arrange
            const forgotPasswordDto = { email: TEST_DATA.VALID_EMAIL };
            mockUser.generatePasswordResetToken.mockResolvedValue('reset-token');
            mockedUserModel.findByEmail.mockResolvedValue(mockUser);

            // Act
            const result = await authService.forgotPassword(forgotPasswordDto);

            // Assert
            expect(result.message).toContain('password reset link has been sent');
            expect(mockUser.generatePasswordResetToken).toHaveBeenCalled();
        });

        it('should return success message for non-existent user (security)', async () => {
            // Arrange
            const forgotPasswordDto = { email: 'nonexistent@example.com' };
            mockedUserModel.findByEmail.mockResolvedValue(null);

            // Act
            const result = await authService.forgotPassword(forgotPasswordDto);

            // Assert
            expect(result.message).toContain('password reset link has been sent');
        });
    });

    describe('resetPassword', () => {
        it('should successfully reset password', async () => {
            // Arrange
            const resetPasswordDto = {
                token: 'reset-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: TEST_DATA.VALID_PASSWORD
            };
            mockUser.canChangePassword.mockResolvedValue(true);
            mockUser.isAccountLocked = false;
            mockedUserModel.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await authService.resetPassword(resetPasswordDto);

            // Assert
            expect(result.message).toBe('Password has been reset successfully');
            expect(mockUser.updatePassword).toHaveBeenCalledWith(resetPasswordDto.newPassword);
        });

        it('should throw ValidationException for mismatched passwords', async () => {
            // Arrange
            const resetPasswordDto = {
                token: 'reset-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: 'different'
            };

            // Act & Assert
            const error = await authService.resetPassword(resetPasswordDto).catch(e => e);
            expectValidationError(error, 'Password confirmation does not match');
        });

        it('should throw ValidationException for invalid token', async () => {
            // Arrange
            const resetPasswordDto = {
                token: 'invalid-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: TEST_DATA.VALID_PASSWORD
            };
            mockedUserModel.findOne.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.resetPassword(resetPasswordDto).catch(e => e);
            expectValidationError(error, 'Invalid or expired reset token');
        });

        it('should reset login attempts if account was locked', async () => {
            // Arrange
            const resetPasswordDto = {
                token: 'reset-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: TEST_DATA.VALID_PASSWORD
            };
            const lockedUser = createMockUser({ isAccountLocked: true });
            lockedUser.canChangePassword.mockResolvedValue(true);
            mockedUserModel.findOne.mockResolvedValue(lockedUser);

            // Act
            await authService.resetPassword(resetPasswordDto);

            // Assert
            expect(lockedUser.resetLoginAttempts).toHaveBeenCalled();
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            // Arrange
            const verifyEmailDto = { token: 'verify-token', userId: mockUser.id };
            const unverifiedUser = createMockUser({ isEmailVerified: false });
            mockedUserModel.findByPk.mockResolvedValue(unverifiedUser);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash('verify-token'));

            // Act
            const result = await authService.verifyEmail(verifyEmailDto);

            // Assert
            expect(result.message).toBe('Email verified successfully');
            expect(unverifiedUser.update).toHaveBeenCalledWith({
                isEmailVerified: true,
                emailVerifiedAt: expect.any(Date)
            });
        });

        it('should return already verified message for verified user', async () => {
            // Arrange
            const verifyEmailDto = { token: 'verify-token', userId: mockUser.id };
            const verifiedUser = createMockUser({ isEmailVerified: true });
            mockedUserModel.findByPk.mockResolvedValue(verifiedUser);

            // Act
            const result = await authService.verifyEmail(verifyEmailDto);

            // Assert
            expect(result.message).toBe('Email is already verified');
        });

        it('should throw ValidationException for invalid token', async () => {
            // Arrange
            const verifyEmailDto = { token: 'invalid-token', userId: mockUser.id };
            const unverifiedUser = createMockUser({ isEmailVerified: false });
            mockedUserModel.findByPk.mockResolvedValue(unverifiedUser);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash('different-token'));

            // Act & Assert
            const error = await authService.verifyEmail(verifyEmailDto).catch(e => e);
            expectValidationError(error, 'Invalid verification link');
        });
    });

    describe('setupTwoFactor', () => {
        it('should setup two-factor authentication', async () => {
            // Arrange
            const userWithout2FA = createMockUser({ twoFactorEnabled: false });
            mockedUserModel.findByPk.mockResolvedValue(userWithout2FA);

            // Act
            const result = await authService.setupTwoFactor(userWithout2FA.id);

            // Assert
            expect(result.secret).toBe(mockSpeakeasyImpl.generateSecret().base32);
            expect(result.qrCodeUrl).toBe('data:image/png;base64,mock-qr');
            expect(userWithout2FA.update).toHaveBeenCalledWith({
                twoFactorSecret: mockSpeakeasyImpl.generateSecret().base32
            });
        });

        it('should throw ValidationException if 2FA already enabled', async () => {
            // Arrange
            const userWith2FA = createMockUser({ twoFactorEnabled: true });
            mockedUserModel.findByPk.mockResolvedValue(userWith2FA);

            // Act & Assert
            const error = await authService.setupTwoFactor(userWith2FA.id).catch(e => e);
            expectValidationError(error, 'Two-factor authentication is already enabled');
        });

        it('should throw BaseException for non-existent user', async () => {
            // Arrange
            mockedUserModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.setupTwoFactor('invalid-id').catch(e => e);
            expectBaseError(error, 404);
        });
    });

    describe('enableTwoFactor', () => {
        it('should enable two-factor authentication with valid code', async () => {
            // Arrange
            const twoFactorDto = { code: TEST_DATA.TWO_FACTOR_CODE };
            const userWithSecret = createMockUser({
                twoFactorSecret: 'JBSWY3DPEHPK3PXP',
                twoFactorEnabled: false
            });
            mockedUserModel.findByPk.mockResolvedValue(userWithSecret);

            // Act
            const result = await authService.enableTwoFactor(userWithSecret.id, twoFactorDto);

            // Assert
            expect(result.message).toBe('Two-factor authentication enabled successfully');
            expect(userWithSecret.update).toHaveBeenCalledWith({ twoFactorEnabled: true });
        });

        it('should throw ValidationException for invalid code', async () => {
            // Arrange
            const twoFactorDto = { code: TEST_DATA.INVALID_TWO_FACTOR_CODE };
            const userWithSecret = createMockUser({
                twoFactorSecret: 'JBSWY3DPEHPK3PXP',
                twoFactorEnabled: false
            });
            mockedUserModel.findByPk.mockResolvedValue(userWithSecret);
            mockSpeakeasyImpl.totp.verify.mockReturnValue(false);

            // Act & Assert
            const error = await authService.enableTwoFactor(userWithSecret.id, twoFactorDto).catch(e => e);
            expectValidationError(error, 'Invalid verification code');
        });

        it('should throw ValidationException for user without secret', async () => {
            // Arrange
            const twoFactorDto = { code: TEST_DATA.TWO_FACTOR_CODE };
            const userWithoutSecret = createMockUser({ twoFactorSecret: null });
            mockedUserModel.findByPk.mockResolvedValue(userWithoutSecret);

            // Act & Assert
            const error = await authService.enableTwoFactor(userWithoutSecret.id, twoFactorDto).catch(e => e);
            expectValidationError(error, 'Two-factor setup not initialized');
        });
    });

    describe('disableTwoFactor', () => {
        it('should disable two-factor authentication', async () => {
            // Arrange
            const disableDto = { password: TEST_DATA.VALID_PASSWORD, code: TEST_DATA.TWO_FACTOR_CODE };
            const userWith2FA = createMockUser({
                twoFactorEnabled: true,
                twoFactorSecret: 'JBSWY3DPEHPK3PXP'
            });
            userWith2FA.validatePassword.mockResolvedValue(true);
            mockedUserModel.findByPk.mockResolvedValue(userWith2FA);

            // Act
            const result = await authService.disableTwoFactor(userWith2FA.id, disableDto);

            // Assert
            expect(result.message).toBe('Two-factor authentication disabled successfully');
            expect(userWith2FA.update).toHaveBeenCalledWith({
                twoFactorEnabled: false,
                twoFactorSecret: null
            });
        });

        it('should throw ValidationException for invalid password', async () => {
            // Arrange
            const disableDto = { password: 'wrong-password', code: TEST_DATA.TWO_FACTOR_CODE };
            const userWith2FA = createMockUser({
                twoFactorEnabled: true,
                twoFactorSecret: 'JBSWY3DPEHPK3PXP'
            });
            userWith2FA.validatePassword.mockResolvedValue(false);
            mockedUserModel.findByPk.mockResolvedValue(userWith2FA);

            // Act & Assert
            const error = await authService.disableTwoFactor(userWith2FA.id, disableDto).catch(e => e);
            expectValidationError(error, 'Invalid password');
        });

        it('should throw ValidationException for invalid 2FA code', async () => {
            // Arrange
            const disableDto = { password: TEST_DATA.VALID_PASSWORD, code: TEST_DATA.INVALID_TWO_FACTOR_CODE };
            const userWith2FA = createMockUser({
                twoFactorEnabled: true,
                twoFactorSecret: 'JBSWY3DPEHPK3PXP'
            });
            userWith2FA.validatePassword.mockResolvedValue(true);
            mockedUserModel.findByPk.mockResolvedValue(userWith2FA);
            mockSpeakeasyImpl.totp.verify.mockReturnValue(false);

            // Act & Assert
            const error = await authService.disableTwoFactor(userWith2FA.id, disableDto).catch(e => e);
            expectValidationError(error, 'Invalid verification code');
        });

        it('should throw ValidationException when 2FA is not enabled', async () => {
            // Arrange
            const disableDto = { password: TEST_DATA.VALID_PASSWORD, code: TEST_DATA.TWO_FACTOR_CODE };
            const userWithout2FA = createMockUser({ twoFactorEnabled: false });
            mockedUserModel.findByPk.mockResolvedValue(userWithout2FA);

            // Act & Assert
            const error = await authService.disableTwoFactor(userWithout2FA.id, disableDto).catch(e => e);
            expectValidationError(error, 'Two-factor authentication is not enabled');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token';
            const mockDecoded = { userId: mockUser.id };
            mockedJwt.verify.mockReturnValue(mockDecoded as any);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act
            const result = await authService.refreshToken(refreshToken);

            // Assert
            expect(result).toBeDefined();
            expect(result.accessToken).toBeDefined();
            expect(mockedJwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
        });

        it('should throw ValidationException for inactive user', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token';
            const mockDecoded = { userId: mockUser.id };
            const inactiveUser = createMockUser({ isActive: false });
            mockedJwt.verify.mockReturnValue(mockDecoded as any);
            mockedUserModel.findByPk.mockResolvedValue(inactiveUser);

            // Act & Assert
            const error = await authService.refreshToken(refreshToken).catch(e => e);
            expectValidationError(error, 'Invalid refresh token');
        });

        it('should throw ValidationException for non-existent user', async () => {
            // Arrange
            const refreshToken = 'valid-refresh-token';
            const mockDecoded = { userId: 'non-existent-id' };
            mockedJwt.verify.mockReturnValue(mockDecoded as any);
            mockedUserModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.refreshToken(refreshToken).catch(e => e);
            expectValidationError(error, 'Invalid refresh token');
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            // Arrange
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act
            const result = await authService.getProfile(mockUser.id);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(mockUser.id);
            expect(result.email).toBe(mockUser.email);
            expect(result.role).toBeDefined();
        });

        it('should throw BaseException for non-existent user', async () => {
            // Arrange
            mockedUserModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.getProfile('invalid-id').catch(e => e);
            expectBaseError(error, 404);
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            // Arrange
            const updateDto = { firstName: 'UpdatedFirst', lastName: 'UpdatedLast' };
            mockedUserModel.findByPk.mockResolvedValue(mockUser);

            // Act
            const result = await authService.updateProfile(mockUser.id, updateDto);

            // Assert
            expect(result).toBeDefined();
            expect(mockUser.update).toHaveBeenCalledWith(updateDto);
        });

        it('should throw BaseException for non-existent user', async () => {
            // Arrange
            const updateDto = { firstName: 'UpdatedFirst' };
            mockedUserModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.updateProfile('invalid-id', updateDto).catch(e => e);
            expectBaseError(error, 404);
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            // Arrange
            const createUserDto = {
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                phoneNumber: TEST_DATA.VALID_PHONE,
                roleId: mockRole.id,
                isActive: true
            };
            mockedUserModel.findByEmail.mockResolvedValue(null);
            mockedRoleModel.findByPk.mockResolvedValue(mockRole);
            mockedUserModel.createUser.mockResolvedValue(mockUser);
            mockedUserModel.findByPk.mockResolvedValue(mockUser);
            mockedCrypto.randomBytes.mockReturnValue(Buffer.from('temppassword') as any);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash());

            // Act
            const result = await authService.createUser(createUserDto);

            // Assert
            expect(result).toBeDefined();
            expect(mockedUserModel.createUser).toHaveBeenCalled();
        });

        it('should throw ValidationException for existing user', async () => {
            // Arrange
            const createUserDto = {
                email: mockUser.email,
                firstName: 'Admin',
                lastName: 'User',
                roleId: mockRole.id
            };
            mockedUserModel.findByEmail.mockResolvedValue(mockUser);

            // Act & Assert
            const error = await authService.createUser(createUserDto).catch(e => e);
            expectValidationError(error, 'User with this email already exists');
        });

        it('should throw ValidationException for invalid role', async () => {
            // Arrange
            const createUserDto = {
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                roleId: 'invalid-role-id'
            };
            mockedUserModel.findByEmail.mockResolvedValue(null);
            mockedRoleModel.findByPk.mockResolvedValue(null);

            // Act & Assert
            const error = await authService.createUser(createUserDto).catch(e => e);
            expectValidationError(error, 'Invalid role specified');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            // Act
            const result = await authService.logout(mockUser.id, false);

            // Assert
            expect(result.message).toBe('Logged out successfully');
        });

        it('should logout from all devices', async () => {
            // Act
            const result = await authService.logout(mockUser.id, true);

            // Assert
            expect(result.message).toBe('Logged out successfully');
        });
    });

    describe('resendEmailVerification', () => {
        it('should resend verification for existing unverified user', async () => {
            // Arrange
            const resendDto = { email: TEST_DATA.VALID_EMAIL };
            const unverifiedUser = createMockUser({ isEmailVerified: false });
            mockedUserModel.findByEmail.mockResolvedValue(unverifiedUser);
            mockedCrypto.createHash.mockReturnValue(createMockCryptoHash());

            // Act
            const result = await authService.resendEmailVerification(resendDto);

            // Assert
            expect(result.message).toContain('verification email has been sent');
        });

        it('should return already verified message for verified user', async () => {
            // Arrange
            const resendDto = { email: TEST_DATA.VALID_EMAIL };
            const verifiedUser = createMockUser({ isEmailVerified: true });
            mockedUserModel.findByEmail.mockResolvedValue(verifiedUser);

            // Act
            const result = await authService.resendEmailVerification(resendDto);

            // Assert
            expect(result.message).toBe('Email is already verified');
        });

        it('should return success message for non-existent user (security)', async () => {
            // Arrange
            const resendDto = { email: 'nonexistent@example.com' };
            mockedUserModel.findByEmail.mockResolvedValue(null);

            // Act
            const result = await authService.resendEmailVerification(resendDto);

            // Assert
            expect(result.message).toContain('verification email has been sent');
        });
    });
});