import {jest} from '@jest/globals';
import {AuthenticationController} from '@controllers/authentication.controller';
import {AuthenticationService} from '@services/authentication.service';
import {
    createMockAuthenticatedRequest,
    createMockRequest,
    createMockResponse,
    createMockTokens,
    createMockUserProfile,
    createValidChangePasswordDto,
    createValidLoginDto,
    createValidRegisterDto,
    setupTestEnvironment,
    TEST_DATA
} from '../../utils/test.utils';

// Mock the authentication service
jest.mock('@services/authentication.service');

const MockedAuthenticationService = AuthenticationService as jest.MockedClass<typeof AuthenticationService>;

describe('AuthenticationController', () => {
    let authController: AuthenticationController;
    let mockAuthService: jest.Mocked<AuthenticationService>;
    let mockRequest: any;
    let mockAuthenticatedRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnvironment();

        // Create a mocked service instance
        mockAuthService = new MockedAuthenticationService() as jest.Mocked<AuthenticationService>;
        authController = new AuthenticationController(mockAuthService);

        // Create mock objects using factory functions
        mockRequest = createMockRequest();
        mockResponse = createMockResponse();
        mockAuthenticatedRequest = createMockAuthenticatedRequest();
    });

    describe('login', () => {
        it('should login successfully and set cookies', async () => {
            // Arrange
            const loginData = createValidLoginDto();
            const mockUser = createMockUserProfile();
            const mockTokens = createMockTokens();
            const mockLoginResult = { user: mockUser, tokens: mockTokens };

            mockRequest.body = loginData;
            mockAuthService.login.mockResolvedValue(mockLoginResult);

            // Act
            await authController.login(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, {
                httpOnly: true,
                secure: false, // test environment
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Login successful',
                user: mockUser,
                accessToken: mockTokens.accessToken,
                expiresIn: mockTokens.expiresIn,
                tokenType: mockTokens.tokenType
            });
        });

        it('should set secure cookies in production', async () => {
            // Arrange
            process.env.NODE_ENV = 'production';
            const loginData = createValidLoginDto();
            const mockUser = createMockUserProfile();
            const mockTokens = createMockTokens();
            const mockLoginResult = { user: mockUser, tokens: mockTokens };

            mockRequest.body = loginData;
            mockAuthService.login.mockResolvedValue(mockLoginResult);

            // Act
            await authController.login(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, {
                httpOnly: true,
                secure: true, // production environment
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        });

        it('should handle login errors', async () => {
            // Arrange
            const loginData = createValidLoginDto();
            mockRequest.body = loginData;
            const error = new Error('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.login(mockRequest, mockResponse))
                .rejects.toThrow('Invalid credentials');
            expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
        });
    });

    describe('register', () => {
        it('should register successfully and set cookies', async () => {
            // Arrange
            const registerData = createValidRegisterDto();
            const mockUser = createMockUserProfile({
                email: registerData.email,
                firstName: registerData.firstName,
                lastName: registerData.lastName
            });
            const mockTokens = createMockTokens();
            const mockRegisterResult = { user: mockUser, tokens: mockTokens };

            mockRequest.body = registerData;
            mockAuthService.register.mockResolvedValue(mockRegisterResult);

            // Act
            await authController.register(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Registration successful',
                user: mockUser,
                accessToken: mockTokens.accessToken,
                expiresIn: mockTokens.expiresIn,
                tokenType: mockTokens.tokenType
            });
        });

        it('should handle registration errors', async () => {
            // Arrange
            mockRequest.body = createValidRegisterDto();
            const error = new Error('User already exists');
            mockAuthService.register.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.register(mockRequest, mockResponse))
                .rejects.toThrow('User already exists');
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            // Arrange
            const changePasswordData = createValidChangePasswordDto();
            mockAuthenticatedRequest.body = changePasswordData;
            mockAuthService.changePassword.mockResolvedValue();

            // Act
            await authController.changePassword(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.changePassword).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                changePasswordData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Password changed successfully'
            });
        });

        it('should handle password change errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = createValidChangePasswordDto();
            const error = new Error('Current password is incorrect');
            mockAuthService.changePassword.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.changePassword(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Current password is incorrect');
        });
    });

    describe('forgotPassword', () => {
        it('should handle forgot password request', async () => {
            // Arrange
            const forgotPasswordData = { email: TEST_DATA.VALID_EMAIL };
            const mockResult = { message: 'If an account with this email exists, a password reset link has been sent.' };
            mockRequest.body = forgotPasswordData;
            mockAuthService.forgotPassword.mockResolvedValue(mockResult);

            // Act
            await authController.forgotPassword(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle forgot password errors', async () => {
            // Arrange
            mockRequest.body = {email: TEST_DATA.VALID_EMAIL};
            const error = new Error('Service unavailable');
            mockAuthService.forgotPassword.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.forgotPassword(mockRequest, mockResponse))
                .rejects.toThrow('Service unavailable');
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            // Arrange
            const resetPasswordData = {
                token: 'reset-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: TEST_DATA.VALID_PASSWORD
            };
            const mockResult = { message: 'Password has been reset successfully' };
            mockRequest.body = resetPasswordData;
            mockAuthService.resetPassword.mockResolvedValue(mockResult);

            // Act
            await authController.resetPassword(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle reset password errors', async () => {
            // Arrange
            mockRequest.body = {
                token: 'invalid-token',
                newPassword: TEST_DATA.VALID_PASSWORD,
                confirmPassword: TEST_DATA.VALID_PASSWORD
            };
            const error = new Error('Invalid or expired reset token');
            mockAuthService.resetPassword.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.resetPassword(mockRequest, mockResponse))
                .rejects.toThrow('Invalid or expired reset token');
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            // Arrange
            const mockResult = { message: 'Email verified successfully' };
            mockRequest.params = { token: 'verify-token', userId: TEST_DATA.VALID_UUID };
            mockAuthService.verifyEmail.mockResolvedValue(mockResult);

            // Act
            await authController.verifyEmail(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.verifyEmail).toHaveBeenCalledWith({
                token: 'verify-token',
                userId: TEST_DATA.VALID_UUID
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle email verification errors', async () => {
            // Arrange
            mockRequest.params = { token: 'invalid-token', userId: TEST_DATA.VALID_UUID };
            const error = new Error('Invalid verification link');
            mockAuthService.verifyEmail.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.verifyEmail(mockRequest, mockResponse))
                .rejects.toThrow('Invalid verification link');
        });
    });

    describe('resendEmailVerification', () => {
        it('should resend verification email', async () => {
            // Arrange
            const resendData = { email: TEST_DATA.VALID_EMAIL };
            const mockResult = { message: 'If an account with this email exists, a verification email has been sent.' };
            mockRequest.body = resendData;
            mockAuthService.resendEmailVerification.mockResolvedValue(mockResult);

            // Act
            await authController.resendEmailVerification(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.resendEmailVerification).toHaveBeenCalledWith(resendData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle resend verification errors', async () => {
            // Arrange
            mockRequest.body = {email: TEST_DATA.VALID_EMAIL};
            const error = new Error('Service unavailable');
            mockAuthService.resendEmailVerification.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.resendEmailVerification(mockRequest, mockResponse))
                .rejects.toThrow('Service unavailable');
        });
    });

    describe('getProfile', () => {
        it('should get user profile successfully', async () => {
            // Arrange
            const mockProfile = createMockUserProfile();
            mockAuthService.getProfile.mockResolvedValue(mockProfile);

            // Act
            await authController.getProfile(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockAuthenticatedRequest.user.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockProfile
            });
        });

        it('should handle profile retrieval errors', async () => {
            // Arrange
            const error = new Error('User not found');
            mockAuthService.getProfile.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.getProfile(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('User not found');
        });
    });

    describe('updateProfile', () => {
        it('should update profile successfully', async () => {
            // Arrange
            const updateData = {
                firstName: 'UpdatedFirst',
                lastName: 'UpdatedLast',
                phoneNumber: '+1987654321'
            };
            const mockUpdatedProfile = createMockUserProfile({
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                phoneNumber: updateData.phoneNumber
            });

            mockAuthenticatedRequest.body = updateData;
            mockAuthService.updateProfile.mockResolvedValue(mockUpdatedProfile);

            // Act
            await authController.updateProfile(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                updateData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Profile updated successfully',
                user: mockUpdatedProfile
            });
        });

        it('should handle profile update errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {firstName: 'UpdatedFirst'};
            const error = new Error('Validation failed');
            mockAuthService.updateProfile.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.updateProfile(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Validation failed');
        });
    });

    describe('setupTwoFactor', () => {
        it('should setup two-factor authentication', async () => {
            // Arrange
            const mockSetupResult = {
                secret: 'JBSWY3DPEHPK3PXP',
                qrCodeUrl: 'data:image/png;base64,mock-qr'
            };
            mockAuthService.setupTwoFactor.mockResolvedValue(mockSetupResult);

            // Act
            await authController.setupTwoFactor(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.setupTwoFactor).toHaveBeenCalledWith(mockAuthenticatedRequest.user.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Two-factor authentication setup initiated',
                ...mockSetupResult
            });
        });

        it('should handle two-factor setup errors', async () => {
            // Arrange
            const error = new Error('Two-factor authentication is already enabled');
            mockAuthService.setupTwoFactor.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.setupTwoFactor(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Two-factor authentication is already enabled');
        });
    });

    describe('enableTwoFactor', () => {
        it('should enable two-factor authentication', async () => {
            // Arrange
            const enableData = { code: TEST_DATA.TWO_FACTOR_CODE };
            const mockResult = { message: 'Two-factor authentication enabled successfully' };
            mockAuthenticatedRequest.body = enableData;
            mockAuthService.enableTwoFactor.mockResolvedValue(mockResult);

            // Act
            await authController.enableTwoFactor(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.enableTwoFactor).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                enableData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle two-factor enable errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {code: TEST_DATA.INVALID_TWO_FACTOR_CODE};
            const error = new Error('Invalid verification code');
            mockAuthService.enableTwoFactor.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.enableTwoFactor(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Invalid verification code');
        });
    });

    describe('disableTwoFactor', () => {
        it('should disable two-factor authentication', async () => {
            // Arrange
            const disableData = {
                password: TEST_DATA.VALID_PASSWORD,
                code: TEST_DATA.TWO_FACTOR_CODE
            };
            const mockResult = { message: 'Two-factor authentication disabled successfully' };
            mockAuthenticatedRequest.body = disableData;
            mockAuthService.disableTwoFactor.mockResolvedValue(mockResult);

            // Act
            await authController.disableTwoFactor(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.disableTwoFactor).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                disableData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle two-factor disable errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {
                password: 'wrong-password',
                code: TEST_DATA.TWO_FACTOR_CODE
            };
            const error = new Error('Invalid password');
            mockAuthService.disableTwoFactor.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.disableTwoFactor(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Invalid password');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token from cookies', async () => {
            // Arrange
            const mockRefreshResult = createMockTokens({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            });
            mockRequest.cookies = { refreshToken: 'old-refresh-token' };
            mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-refresh-token');
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Token refreshed successfully',
                accessToken: mockRefreshResult.accessToken,
                expiresIn: mockRefreshResult.expiresIn,
                tokenType: mockRefreshResult.tokenType
            });
        });

        it('should refresh token from body', async () => {
            // Arrange
            const mockRefreshResult = createMockTokens();
            mockRequest.body = { refreshToken: 'body-refresh-token' };
            mockRequest.cookies = {};
            mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith('body-refresh-token');
        });

        it('should prioritize cookie over body', async () => {
            // Arrange
            const mockRefreshResult = createMockTokens();
            mockRequest.cookies = { refreshToken: 'cookie-token' };
            mockRequest.body = { refreshToken: 'body-token' };
            mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith('cookie-token');
        });

        it('should return 401 when no refresh token provided', async () => {
            // Arrange
            mockRequest.cookies = {};
            mockRequest.body = {};

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Required',
                status: 401,
                detail: 'Refresh token is required',
                instance: mockRequest.originalUrl,
            });
        });

        it('should handle refresh token errors', async () => {
            // Arrange
            mockRequest.cookies = { refreshToken: 'invalid-token' };
            const error = new Error('Invalid refresh token');
            mockAuthService.refreshToken.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.refreshToken(mockRequest, mockResponse))
                .rejects.toThrow('Invalid refresh token');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            // Arrange
            const logoutData = { logoutAll: false };
            const mockResult = { message: 'Logged out successfully' };
            mockAuthenticatedRequest.body = logoutData;
            mockAuthService.logout.mockResolvedValue(mockResult);

            // Act
            await authController.logout(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.logout).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                logoutData.logoutAll
            );
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should logout from all devices', async () => {
            // Arrange
            const logoutAllData = { logoutAll: true };
            const mockResult = { message: 'Logged out successfully' };
            mockAuthenticatedRequest.body = logoutAllData;
            mockAuthService.logout.mockResolvedValue(mockResult);

            // Act
            await authController.logout(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.logout).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                true
            );
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
        });

        it('should handle logout with empty body', async () => {
            // Arrange
            const mockResult = { message: 'Logged out successfully' };
            mockAuthenticatedRequest.body = {};
            mockAuthService.logout.mockResolvedValue(mockResult);

            // Act
            await authController.logout(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.logout).toHaveBeenCalledWith(
                mockAuthenticatedRequest.user.id,
                undefined
            );
        });

        it('should handle logout errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {logoutAll: false};
            const error = new Error('Logout failed');
            mockAuthService.logout.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.logout(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Logout failed');
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            // Arrange
            const createUserData = {
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                phoneNumber: TEST_DATA.VALID_PHONE,
                roleId: 'admin-role-id',
                isActive: true
            };
            const mockCreatedUser = createMockUserProfile({
                email: createUserData.email,
                firstName: createUserData.firstName,
                lastName: createUserData.lastName,
                phoneNumber: createUserData.phoneNumber
            });

            mockAuthenticatedRequest.body = createUserData;
            mockAuthService.createUser.mockResolvedValue(mockCreatedUser);

            // Act
            await authController.createUser(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockAuthService.createUser).toHaveBeenCalledWith(createUserData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'User created successfully',
                user: mockCreatedUser
            });
        });

        it('should handle user creation errors', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {
                email: 'existing@example.com',
                firstName: 'Admin',
                lastName: 'User',
                roleId: 'admin-role-id'
            };
            const error = new Error('User with this email already exists');
            mockAuthService.createUser.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.createUser(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('User with this email already exists');
        });
    });

    describe('healthCheck', () => {
        it('should return health status', async () => {
            // Act
            await authController.healthCheck(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'healthy',
                service: 'authentication',
                timestamp: expect.any(String)
            });
        });

        it('should return valid ISO timestamp', async () => {
            // Act
            await authController.healthCheck(mockRequest, mockResponse);

            // Assert
            const callArgs = mockResponse.json.mock.calls[0][0];
            expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
    });

    describe('Error Handling', () => {
        it('should handle service errors and let them bubble up', async () => {
            // Arrange
            mockRequest.body = createValidLoginDto();
            const error = new Error('Service error');
            mockAuthService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.login(mockRequest, mockResponse))
                .rejects.toThrow('Service error');
        });

        it('should handle missing user in authenticated requests', async () => {
            // Arrange
            const requestWithoutUser = createMockRequest();

            // Act & Assert
            await expect(authController.getProfile(requestWithoutUser as any, mockResponse))
                .rejects.toThrow();
        });

        it('should handle undefined user properties', async () => {
            // Arrange
            const requestWithNullUser = createMockAuthenticatedRequest({ user: null });

            // Act & Assert
            await expect(authController.getProfile(requestWithNullUser as any, mockResponse))
                .rejects.toThrow();
        });

        it('should handle async service errors properly', async () => {
            // Arrange
            mockAuthenticatedRequest.body = {firstName: 'Test'};
            const asyncError = Promise.reject(new Error('Async service error'));
            mockAuthService.updateProfile.mockReturnValue(asyncError);

            // Act & Assert
            await expect(authController.updateProfile(mockAuthenticatedRequest, mockResponse))
                .rejects.toThrow('Async service error');
        });

        it('should handle malformed request data', async () => {
            // Arrange
            mockRequest.body = null;
            const error = new Error('Invalid request data');
            mockAuthService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.login(mockRequest, mockResponse))
                .rejects.toThrow('Invalid request data');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty request body in login', async () => {
            // Arrange
            mockRequest.body = {};
            const error = new Error('Email is required');
            mockAuthService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.login(mockRequest, mockResponse))
                .rejects.toThrow('Email is required');
        });

        it('should handle missing params in verifyEmail', async () => {
            // Arrange
            mockRequest.params = {};
            const verifyEmailDto = { token: undefined, userId: undefined };
            const error = new Error('Invalid verification parameters');
            mockAuthService.verifyEmail.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.verifyEmail(mockRequest, mockResponse))
                .rejects.toThrow('Invalid verification parameters');
        });

        it('should handle empty cookies and body in refreshToken', async () => {
            // Arrange
            mockRequest.cookies = {};
            mockRequest.body = {};

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
        });

        it('should handle user ID as string in authenticated requests', async () => {
            // Arrange
            const requestWithStringId = createMockAuthenticatedRequest({
                user: { id: '123', email: 'test@example.com' }
            });
            const mockProfile = createMockUserProfile();
            mockAuthService.getProfile.mockResolvedValue(mockProfile);

            // Act
            await authController.getProfile(requestWithStringId, mockResponse);

            // Assert
            expect(mockAuthService.getProfile).toHaveBeenCalledWith('123');
        });
    });

    describe('Response Formatting', () => {
        it('should format login response correctly', async () => {
            // Arrange
            const loginData = createValidLoginDto();
            const mockUser = createMockUserProfile();
            const mockTokens = createMockTokens();
            const mockLoginResult = { user: mockUser, tokens: mockTokens };

            mockRequest.body = loginData;
            mockAuthService.login.mockResolvedValue(mockLoginResult);

            // Act
            await authController.login(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Login successful',
                user: mockUser,
                accessToken: mockTokens.accessToken,
                expiresIn: mockTokens.expiresIn,
                tokenType: mockTokens.tokenType
            });
        });

        it('should format profile response correctly', async () => {
            // Arrange
            const mockProfile = createMockUserProfile();
            mockAuthService.getProfile.mockResolvedValue(mockProfile);

            // Act
            await authController.getProfile(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                user: mockProfile
            });
        });

        it('should format health check response correctly', async () => {
            // Act
            await authController.healthCheck(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'healthy',
                service: 'authentication',
                timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });
        });
    });

    describe('Cookie Management', () => {
        it('should set cookies with correct attributes in development', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            const loginData = createValidLoginDto();
            const mockUser = createMockUserProfile();
            const mockTokens = createMockTokens();
            const mockLoginResult = { user: mockUser, tokens: mockTokens };

            mockRequest.body = loginData;
            mockAuthService.login.mockResolvedValue(mockLoginResult);

            // Act
            await authController.login(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        });

        it('should clear cookies on logout', async () => {
            // Arrange
            const logoutData = { logoutAll: false };
            const mockResult = { message: 'Logged out successfully' };
            mockAuthenticatedRequest.body = logoutData;
            mockAuthService.logout.mockResolvedValue(mockResult);

            // Act
            await authController.logout(mockAuthenticatedRequest, mockResponse);

            // Assert
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
        });

        it('should update refresh token cookie on token refresh', async () => {
            // Arrange
            const mockRefreshResult = createMockTokens({
                refreshToken: 'updated-refresh-token'
            });
            mockRequest.cookies = { refreshToken: 'old-refresh-token' };
            mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

            // Act
            await authController.refreshToken(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'updated-refresh-token',
                expect.any(Object)
            );
        });
    });
});