export declare class LoginRequest {
    email: string;
    password: string;
}
export declare class RefreshTokenRequest {
    refreshToken: string;
}
export declare class ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export declare class ResetPasswordRequest {
    userId: string;
    newPassword: string;
}
export declare class VerifyTokenRequest {
    token: string;
}
export declare class UnlockAccountRequest {
    userId: string;
}
export declare class UserProfileRequest {
    token: string;
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
//# sourceMappingURL=auth.dto.d.ts.map