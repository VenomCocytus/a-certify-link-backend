import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { validateDto } from '@middlewares/validation.middleware';
import { authLimiter } from '@middlewares/rateLimiter.middleware';
import {
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest, UnlockAccountRequest,
    UserProfileRequest, VerifyTokenRequest
} from '@dto/auth.dto';
import {asyncHandler} from "@utils/async-handler";
import {requireRoles} from "@middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post('/login', authLimiter, validateDto(LoginRequest), asyncHandler(authController.login));

router.post('/refresh', validateDto(RefreshTokenRequest), asyncHandler(authController.refreshToken));

router.post('/logout', authController.logout);

router.post('/change-password',
    requireRoles(['admin']),
    validateDto(ChangePasswordRequest),
    asyncHandler(authController.changePassword));

router.post('/reset-password',validateDto(ResetPasswordRequest), asyncHandler(authController.resetPassword));

router.get('/profile', validateDto(UserProfileRequest), asyncHandler(authController.getProfile));

router.post('/verify-token', validateDto(VerifyTokenRequest), asyncHandler(authController.verifyToken));

router.post('/unlock-account',
    requireRoles(['admin']),
    validateDto(UnlockAccountRequest),
    asyncHandler(authController.unlockAccount));

export default router;