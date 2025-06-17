import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { validateDto } from '@middlewares/validation.middleware';
import { authLimiter } from '@middlewares/rateLimiter.middleware';
import {
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordDto,
    UserProfileRequest, VerifyTokenRequest
} from '@dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/login', authLimiter, validateDto(LoginRequest), authController.login);

router.post('/refresh', validateDto(RefreshTokenRequest), authController.refreshToken);

router.post('/logout', authController.logout);

router.post('/change-password', validateDto(ChangePasswordRequest), authController.changePassword);

router.post('/reset-password',validateDto(ResetPasswordDto), authController.resetPassword);

router.get('/profile', validateDto(UserProfileRequest), authController.getProfile);

router.post('/verify-token', validateDto(VerifyTokenRequest), authController.verifyToken);

router.post('/unlock-account', validateDto(VerifyTokenRequest), authController.unlockAccount);

export default router;