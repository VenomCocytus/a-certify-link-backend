"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("@services/auth.service");
const user_repository_1 = require("@/repositories/user.repository");
const user_mapper_1 = require("@/mappers/user.mapper");
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            res.json({
                success: true,
                data: await this.authService.login(req.body),
                message: req.t('login_successful'),
            });
        };
        this.refreshToken = async (req, res) => {
            res.json({
                success: true,
                data: await this.authService.refreshToken(req.body),
                message: req.t('token_refreshed'),
            });
        };
        this.logout = async (req, res) => {
            await this.authService.logout(req.body.userId);
            res.json({
                success: true,
                message: req.t('logout_successful'),
            });
        };
        this.getProfile = async (req, res) => {
            const userProfile = await this.authService.getUserByToken(req.body);
            res.json({
                success: true,
                data: userProfile ? user_mapper_1.UserMapper.toProfile(userProfile) : null,
            });
        };
        this.changePassword = async (req, res) => {
            const user = req.user;
            await this.authService.changePassword(user.id, req.body);
            res.json({
                success: true,
                message: req.t
                    ? req.t('password_changed')
                    : 'Password changed successfully',
            });
        };
        this.verifyToken = async (req, res) => {
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
        this.resetPassword = async (req, res) => {
            const adminUser = req.user;
            await this.authService.resetPassword(req.body, adminUser.id);
            res.json({
                success: true,
                message: req.t
                    ? req.t('password_reset_successful')
                    : 'Password reset successfully',
            });
        };
        this.unlockAccount = async (req, res) => {
            const adminUser = req.user;
            await this.authService.unlockAccount(req.body, adminUser.id);
            res.json({
                success: true,
                message: req.t
                    ? req.t('account_unlocked')
                    : 'Account unlocked successfully',
            });
        };
        this.authService = new auth_service_1.AuthService();
        this.userRepository = new user_repository_1.UserRepository();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map