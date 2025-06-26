import {Request} from "express";

export interface JwtPayload {
    userId: string;
    type: string;
    iat: number;
    exp: number;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
        role?: {
            id: string;
            name: string;
            permissions: string[];
        };
        isActive: boolean;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
    };
}