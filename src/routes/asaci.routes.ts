import { Router } from 'express';
import {
    GenerateTokenDto,
    OtpValidateDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ResendWelcomeDto,
    SetInitialPasswordDto,
    RevokeTokensDto,
    CreateProductionRequestDto,
    CreateOrderDto,
    UpdateOrderDto,
    CancelCertificateDto,
    SuspendCertificateDto,
    CreateTransactionDto,
    UpdateTransactionDto,
    RejectTransactionDto,
    CancelTransactionDto
} from '@dto/asaci.dto';
import { validateDto } from "@middlewares/validation.middleware";
import { asyncHandlerMiddleware } from "@middlewares/async-handler.middleware";
import { authMiddleware, requirePermissions, requireRoles } from "@middlewares/auth.middleware";
import { AsaciAttestationController } from "@controllers/asaci-attestation.controller";
import { AsaciAuthenticationController } from "@controllers/asaci-authentication.controller";
import {certificateCreationLimiter} from "@middlewares/rate-limiter.middleware";

export function createAsaciRoutes(
    authController: AsaciAuthenticationController,
    attestationController: AsaciAttestationController
): Router {
    const router = Router();

    // ASACI Authentication Routes (require user authentication to access ASACI services)

    /**
     * @route POST /auth/login
     * @desc Generate ASACI access token for authenticated user
     * @access Private
     */
    router.post('/auth/login',
        authMiddleware,
        requirePermissions(['asaci:login']),
        validateDto(GenerateTokenDto),
        asyncHandlerMiddleware(authController.generateToken.bind(authController))
    );

    /**
     * @route POST /auth/otp/validate
     * @desc Validate ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/validate',
        authMiddleware,
        requirePermissions(['asaci:otp']),
        validateDto(OtpValidateDto),
        asyncHandlerMiddleware(authController.validateOtp.bind(authController))
    );

    /**
     * @route POST /auth/otp/resend
     * @desc Resend ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/resend',
        authMiddleware,
        requirePermissions(['asaci:otp']),
        validateDto(OtpValidateDto),
        asyncHandlerMiddleware(authController.resendOtp.bind(authController))
    );

    /**
     * @route POST /auth/forgot-password
     * @desc Request ASACI password reset
     * @access Private
     */
    router.post('/auth/forgot-password',
        authMiddleware,
        requirePermissions(['asaci:password_reset']),
        validateDto(ForgotPasswordDto),
        asyncHandlerMiddleware(authController.forgotPassword.bind(authController))
    );

    /**
     * @route POST /auth/reset-password
     * @desc Reset ASACI password
     * @access Private
     */
    router.post('/auth/reset-password',
        authMiddleware,
        requirePermissions(['asaci:password_reset']),
        validateDto(ResetPasswordDto),
        asyncHandlerMiddleware(authController.resetPassword.bind(authController))
    );

    /**
     * @route POST /auth/welcome/send
     * @desc Send ASACI welcome email
     * @access Private
     */
    router.post('/auth/welcome/send',
        authMiddleware,
        requireRoles(['ADMIN', 'SUPER_ADMIN']),
        validateDto(ResendWelcomeDto),
        asyncHandlerMiddleware(authController.resendWelcomeEmail.bind(authController))
    );

    /**
     * @route POST /auth/welcome/:userId/set-password
     * @desc Set initial ASACI password
     * @access Private
     */
    router.post('/auth/welcome/:userId/set-password',
        authMiddleware,
        requireRoles(['ADMIN', 'SUPER_ADMIN']),
        validateDto(SetInitialPasswordDto),
        asyncHandlerMiddleware(authController.setInitialPassword.bind(authController))
    );

    /**
     * @route GET /auth/user
     * @desc Get current ASACI user info
     * @access Private
     */
    router.get('/auth/user',
        authMiddleware,
        requirePermissions(['asaci:read']),
        asyncHandlerMiddleware(authController.getCurrentUser.bind(authController))
    );

    /**
     * @route GET /auth/tokens
     * @desc Get ASACI user tokens
     * @access Private
     */
    router.get('/auth/tokens',
        authMiddleware,
        requirePermissions(['asaci:tokens']),
        asyncHandlerMiddleware(authController.getUserTokens.bind(authController))
    );

    /**
     * @route POST /auth/tokens/revoke
     * @desc Revoke ASACI tokens
     * @access Private
     */
    router.post('/auth/tokens/revoke',
        authMiddleware,
        requirePermissions(['asaci:tokens']),
        validateDto(RevokeTokensDto),
        asyncHandlerMiddleware(authController.revokeTokens.bind(authController))
    );

    /**
     * @route DELETE /auth/tokens
     * @desc Delete current ASACI token
     * @access Private
     */
    router.delete('/auth/tokens',
        authMiddleware,
        requirePermissions(['asaci:tokens']),
        asyncHandlerMiddleware(authController.deleteCurrentToken.bind(authController))
    );

    /**
     * @route GET /auth/email/send-verification
     * @desc Resend ASACI email verification
     * @access Private
     */
    router.get('/auth/email/send-verification',
        authMiddleware,
        requirePermissions(['asaci:email_verification']),
        asyncHandlerMiddleware(authController.resendEmailVerification.bind(authController))
    );

    /**
     * @route GET /auth/email/verify/:id/:hash
     * @desc Verify ASACI email
     * @access Private
     */
    router.get('/auth/email/verify/:id/:hash',
        authMiddleware,
        requirePermissions(['asaci:email_verification']),
        asyncHandlerMiddleware(authController.verifyEmail.bind(authController))
    );

    // ASACI Production Routes

    /**
     * @route POST /productions
     * @desc Create ASACI production request
     * @access Private
     */
    router.post('/productions',
        authMiddleware,
        certificateCreationLimiter,
        requirePermissions(['asaci:productions:create']),
        validateDto(CreateProductionRequestDto),
        asyncHandlerMiddleware(attestationController.createProductionRequest.bind(attestationController))
    );

    /**
     * @route GET /productions
     * @desc Get ASACI production requests
     * @access Private
     */
    router.get('/productions',
        authMiddleware,
        requirePermissions(['asaci:productions:read']),
        asyncHandlerMiddleware(attestationController.getProductionRequests.bind(attestationController))
    );

    /**
     * @route GET /productions/:reference/download
     * @desc Download ASACI production ZIP
     * @access Private
     */
    router.get('/productions/:reference/download',
        authMiddleware,
        requirePermissions(['asaci:productions:download']),
        asyncHandlerMiddleware(attestationController.downloadProductionZip.bind(attestationController))
    );

    // ASACI Order Routes

    /**
     * @route POST /orders
     * @desc Create ASACI order
     * @access Private
     */
    router.post('/orders',
        authMiddleware,
        requirePermissions(['asaci:orders:create']),
        validateDto(CreateOrderDto),
        asyncHandlerMiddleware(attestationController.createOrder.bind(attestationController))
    );

    /**
     * @route GET /orders
     * @desc Get ASACI orders
     * @access Private
     */
    router.get('/orders',
        authMiddleware,
        requirePermissions(['asaci:orders:read']),
        asyncHandlerMiddleware(attestationController.getOrders.bind(attestationController))
    );

    /**
     * @route GET /orders/:reference
     * @desc Get ASACI order by reference
     * @access Private
     */
    router.get('/orders/:reference',
        authMiddleware,
        requirePermissions(['asaci:orders:read']),
        asyncHandlerMiddleware(attestationController.getOrder.bind(attestationController))
    );

    /**
     * @route PUT /orders/:reference
     * @desc Update ASACI order
     * @access Private
     */
    router.put('/orders/:reference',
        authMiddleware,
        requirePermissions(['asaci:orders:update']),
        validateDto(UpdateOrderDto),
        asyncHandlerMiddleware(attestationController.updateOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/approve
     * @desc Approve ASACI order
     * @access Private
     */
    router.post('/orders/:reference/approve',
        authMiddleware,
        requirePermissions(['asaci:orders:approve']),
        asyncHandlerMiddleware(attestationController.approveOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/reject
     * @desc Reject ASACI order
     * @access Private
     */
    router.post('/orders/:reference/reject',
        authMiddleware,
        requirePermissions(['asaci:orders:reject']),
        asyncHandlerMiddleware(attestationController.rejectOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/cancel
     * @desc Cancel ASACI order
     * @access Private
     */
    router.post('/orders/:reference/cancel',
        authMiddleware,
        requirePermissions(['asaci:orders:cancel']),
        asyncHandlerMiddleware(attestationController.cancelOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/suspend
     * @desc Suspend ASACI order
     * @access Private
     */
    router.post('/orders/:reference/suspend',
        authMiddleware,
        requirePermissions(['asaci:orders:suspend']),
        asyncHandlerMiddleware(attestationController.suspendOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/submit-for-confirmation
     * @desc Submit ASACI order for confirmation
     * @access Private
     */
    router.post('/orders/:reference/submit-for-confirmation',
        authMiddleware,
        requirePermissions(['asaci:orders:submit']),
        asyncHandlerMiddleware(attestationController.submitOrderForConfirmation.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/confirm-delivery
     * @desc Confirm ASACI order delivery
     * @access Private
     */
    router.post('/orders/:reference/confirm-delivery',
        authMiddleware,
        requirePermissions(['asaci:orders:confirm']),
        asyncHandlerMiddleware(attestationController.confirmOrderDelivery.bind(attestationController))
    );

    // ASACI Certificate Routes

    /**
     * @route GET /certificates
     * @desc Get ASACI certificates
     * @access Private
     */
    router.get('/certificates',
        authMiddleware,
        requirePermissions(['asaci:certificates:read']),
        asyncHandlerMiddleware(attestationController.getCertificates.bind(attestationController))
    );

    /**
     * @route GET /certificates/:reference
     * @desc Get ASACI certificate by reference
     * @access Private
     */
    router.get('/certificates/:reference',
        authMiddleware,
        requirePermissions(['asaci:certificates:read']),
        asyncHandlerMiddleware(attestationController.getCertificate.bind(attestationController))
    );

    /**
     * @route GET /certificates/:reference/download
     * @desc Download ASACI certificate
     * @access Private
     */
    router.get('/certificates/:reference/download',
        authMiddleware,
        requirePermissions(['asaci:certificates:download']),
        asyncHandlerMiddleware(attestationController.downloadCertificate.bind(attestationController))
    );

    /**
     * @route POST /certificates/:reference/cancel
     * @desc Cancel ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/cancel',
        authMiddleware,
        requirePermissions(['asaci:certificates:cancel']),
        validateDto(CancelCertificateDto),
        asyncHandlerMiddleware(attestationController.cancelCertificate.bind(attestationController))
    );

    /**
     * @route POST /certificates/:reference/suspend
     * @desc Suspend ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/suspend',
        authMiddleware,
        requirePermissions(['asaci:certificates:suspend']),
        validateDto(SuspendCertificateDto),
        asyncHandlerMiddleware(attestationController.suspendCertificate.bind(attestationController))
    );

    /**
     * @route POST /certificates/:reference/check
     * @desc Check ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/check',
        authMiddleware,
        requirePermissions(['asaci:certificates:check']),
        asyncHandlerMiddleware(attestationController.checkCertificate.bind(attestationController))
    );

    /**
     * @route GET /certificate-types
     * @desc Get ASACI certificate types
     * @access Private
     */
    router.get('/certificate-types',
        authMiddleware,
        requirePermissions(['asaci:certificates:read']),
        asyncHandlerMiddleware(attestationController.getCertificateTypes.bind(attestationController))
    );

    /**
     * @route GET /certificate-variants
     * @desc Get ASACI certificate variants
     * @access Private
     */
    router.get('/certificate-variants',
        authMiddleware,
        requirePermissions(['asaci:certificates:read']),
        asyncHandlerMiddleware(attestationController.getCertificateVariants.bind(attestationController))
    );

    // ASACI Transaction Routes

    /**
     * @route POST /transactions
     * @desc Create ASACI transaction
     * @access Private
     */
    router.post('/transactions',
        authMiddleware,
        requirePermissions(['asaci:transactions:create']),
        validateDto(CreateTransactionDto),
        asyncHandlerMiddleware(attestationController.createTransaction.bind(attestationController))
    );

    /**
     * @route GET /transactions
     * @desc Get ASACI transactions
     * @access Private
     */
    router.get('/transactions',
        authMiddleware,
        requirePermissions(['asaci:transactions:read']),
        asyncHandlerMiddleware(attestationController.getTransactions.bind(attestationController))
    );

    /**
     * @route GET /transactions/:reference
     * @desc Get ASACI transaction by reference
     * @access Private
     */
    router.get('/transactions/:reference',
        authMiddleware,
        requirePermissions(['asaci:transactions:read']),
        asyncHandlerMiddleware(attestationController.getTransaction.bind(attestationController))
    );

    /**
     * @route PUT /transactions/:reference
     * @desc Update ASACI transaction
     * @access Private
     */
    router.put('/transactions/:reference',
        authMiddleware,
        requirePermissions(['asaci:transactions:update']),
        validateDto(UpdateTransactionDto),
        asyncHandlerMiddleware(attestationController.updateTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/approve
     * @desc Approve ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/approve',
        authMiddleware,
        requirePermissions(['asaci:transactions:approve']),
        asyncHandlerMiddleware(attestationController.approveTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/reject
     * @desc Reject ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/reject',
        authMiddleware,
        requirePermissions(['asaci:transactions:reject']),
        validateDto(RejectTransactionDto),
        asyncHandlerMiddleware(attestationController.rejectTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/cancel
     * @desc Cancel ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/cancel',
        authMiddleware,
        requirePermissions(['asaci:transactions:cancel']),
        validateDto(CancelTransactionDto),
        asyncHandlerMiddleware(attestationController.cancelTransaction.bind(attestationController))
    );

    // ASACI Statistics Routes

    /**
     * @route GET /statistics/certificates/usage
     * @desc Get ASACI certificate usage statistics
     * @access Private
     */
    router.get('/statistics/certificates/usage',
        authMiddleware,
        requirePermissions(['asaci:statistics:read']),
        asyncHandlerMiddleware(attestationController.getCertificateUsageStatistics.bind(attestationController))
    );

    /**
     * @route GET /statistics/certificates/available
     * @desc Get ASACI available certificates statistics
     * @access Private
     */
    router.get('/statistics/certificates/available',
        authMiddleware,
        requirePermissions(['asaci:statistics:read']),
        asyncHandlerMiddleware(attestationController.getAvailableCertificatesStatistics.bind(attestationController))
    );

    /**
     * @route GET /statistics/certificates/used
     * @desc Get ASACI used certificates statistics
     * @access Private
     */
    router.get('/statistics/certificates/used',
        authMiddleware,
        requirePermissions(['asaci:statistics:read']),
        asyncHandlerMiddleware(attestationController.getUsedCertificatesStatistics.bind(attestationController))
    );

    return router;
}