import { Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { UserRepository } from '@/repositories/user.repository';
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";
import {UserMapper} from "@/mappers/user.mapper";

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
    }

    login = async (req: Request, res: Response): Promise<void> => {
        res.json({
            success: true,
            data: await this.authService.login(req.body),
            message: req.t('login_successful'),
        });
    };

    refreshToken = async (req: Request, res: Response): Promise<void> => {
        res.json({
            success: true,
            data: await this.authService.refreshToken(req.body),
            message: req.t('token_refreshed'),
        });
    };

    logout = async (req: Request, res: Response): Promise<void> => {
        await this.authService.logout(req.body.userId);

        res.json({
            success: true,
            message: req.t('logout_successful'),
        });
    };

    getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userProfile = await this.authService.getUserByToken(req.body);

        res.json({
            success: true,
            data: userProfile ? UserMapper.toProfile(userProfile) : null,
        });
    };

    changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const user = req.user!;
        await this.authService.changePassword(user.id, req.body);

        res.json({
            success: true,
            message: req.t
                ? req.t('password_changed')
                : 'Password changed successfully',
        });
    };

    verifyToken = async (req: Request, res: Response): Promise<void> => {
        const user = await this.authService.getUserByToken(req.body);

        res.json({
            success: !!user,
            data: {
                valid: !!user,
                user: user ? this.authService.verifyToken(req.body) : null,
                error: user ? null : 'Invalid or expired token',
            },
        });
    };

    resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const adminUser = req.user!;
        await this.authService.resetPassword(req.body, adminUser.id);

        res.json({
            success: true,
            message: req.t
                ? req.t('password_reset_successful')
                : 'Password reset successfully',
        });
    };

    unlockAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const adminUser = req.user!;
        await this.authService.unlockAccount(req.body, adminUser.id);

        res.json({
            success: true,
            message: req.t
                ? req.t('account_unlocked')
                : 'Account unlocked successfully',
        });
    };
}