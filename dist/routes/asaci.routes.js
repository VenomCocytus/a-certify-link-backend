"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsaciRoutes = createAsaciRoutes;
const express_1 = require("express");
const asaci_dto_1 = require("@dto/asaci.dto");
const validation_middleware_1 = require("@middlewares/validation.middleware");
const async_handler_middleware_1 = require("@middlewares/async-handler.middleware");
const auth_middleware_1 = require("@middlewares/auth.middleware");
const rate_limiter_middleware_1 = require("@middlewares/rate-limiter.middleware");
function createAsaciRoutes(authController, attestationController) {
    const router = (0, express_1.Router)();
    // ASACI Authentication Routes (require user authentication to access ASACI services)
    /**
     * @route POST /auth/login
     * @desc Generate ASACI access token for authenticated user
     * @access Private
     */
    router.post('/auth/login', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:login']), (0, validation_middleware_1.validateDto)(asaci_dto_1.GenerateTokenDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.generateToken.bind(authController)));
    /**
     * @route POST /auth/otp/validate
     * @desc Validate ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/validate', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:otp']), (0, validation_middleware_1.validateDto)(asaci_dto_1.OtpValidateDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.validateOtp.bind(authController)));
    /**
     * @route POST /auth/otp/resend
     * @desc Resend ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/resend', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:otp']), (0, validation_middleware_1.validateDto)(asaci_dto_1.OtpValidateDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.resendOtp.bind(authController)));
    /**
     * @route POST /auth/forgot-password
     * @desc Request ASACI password reset
     * @access Private
     */
    router.post('/auth/forgot-password', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:password_reset']), (0, validation_middleware_1.validateDto)(asaci_dto_1.ForgotPasswordDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.forgotPassword.bind(authController)));
    /**
     * @route POST /auth/reset-password
     * @desc Reset ASACI password
     * @access Private
     */
    router.post('/auth/reset-password', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:password_reset']), (0, validation_middleware_1.validateDto)(asaci_dto_1.ResetPasswordDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.resetPassword.bind(authController)));
    /**
     * @route POST /auth/welcome/send
     * @desc Send ASACI welcome email
     * @access Private
     */
    router.post('/auth/welcome/send', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRoles)(['ADMIN', 'SUPER_ADMIN']), (0, validation_middleware_1.validateDto)(asaci_dto_1.ResendWelcomeDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.resendWelcomeEmail.bind(authController)));
    /**
     * @route POST /auth/welcome/:userId/set-password
     * @desc Set initial ASACI password
     * @access Private
     */
    router.post('/auth/welcome/:userId/set-password', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRoles)(['ADMIN', 'SUPER_ADMIN']), (0, validation_middleware_1.validateDto)(asaci_dto_1.SetInitialPasswordDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.setInitialPassword.bind(authController)));
    /**
     * @route GET /auth/user
     * @desc Get current ASACI user info
     * @access Private
     */
    router.get('/auth/user', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.getCurrentUser.bind(authController)));
    /**
     * @route GET /auth/tokens
     * @desc Get ASACI user tokens
     * @access Private
     */
    router.get('/auth/tokens', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:tokens']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.getUserTokens.bind(authController)));
    /**
     * @route POST /auth/tokens/revoke
     * @desc Revoke ASACI tokens
     * @access Private
     */
    router.post('/auth/tokens/revoke', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:tokens']), (0, validation_middleware_1.validateDto)(asaci_dto_1.RevokeTokensDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.revokeTokens.bind(authController)));
    /**
     * @route DELETE /auth/tokens
     * @desc Delete current ASACI token
     * @access Private
     */
    router.delete('/auth/tokens', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:tokens']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.deleteCurrentToken.bind(authController)));
    /**
     * @route GET /auth/email/send-verification
     * @desc Resend ASACI email verification
     * @access Private
     */
    router.get('/auth/email/send-verification', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:email_verification']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.resendEmailVerification.bind(authController)));
    /**
     * @route GET /auth/email/verify/:id/:hash
     * @desc Verify ASACI email
     * @access Private
     */
    router.get('/auth/email/verify/:id/:hash', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:email_verification']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(authController.verifyEmail.bind(authController)));
    // ASACI Production Routes
    /**
     * @route POST /productions
     * @desc Create ASACI production request
     * @access Private
     */
    router.post('/productions', auth_middleware_1.authMiddleware, rate_limiter_middleware_1.certificateCreationLimiter, (0, auth_middleware_1.requirePermissions)(['asaci:productions:create']), (0, validation_middleware_1.validateDto)(asaci_dto_1.CreateProductionRequestDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.createProductionRequest.bind(attestationController)));
    /**
     * @route GET /productions
     * @desc Get ASACI production requests
     * @access Private
     */
    router.get('/productions', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:productions:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getProductionRequests.bind(attestationController)));
    /**
     * @route GET /productions/:reference/download
     * @desc Download ASACI production ZIP
     * @access Private
     */
    router.get('/productions/:reference/download', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:productions:download']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.downloadProductionZip.bind(attestationController)));
    // ASACI Order Routes
    /**
     * @route POST /orders
     * @desc Create ASACI order
     * @access Private
     */
    router.post('/orders', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:create']), (0, validation_middleware_1.validateDto)(asaci_dto_1.CreateOrderDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.createOrder.bind(attestationController)));
    /**
     * @route GET /orders
     * @desc Get ASACI orders
     * @access Private
     */
    router.get('/orders', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getOrders.bind(attestationController)));
    /**
     * @route GET /orders/:reference
     * @desc Get ASACI order by reference
     * @access Private
     */
    router.get('/orders/:reference', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getOrder.bind(attestationController)));
    /**
     * @route PUT /orders/:reference
     * @desc Update ASACI order
     * @access Private
     */
    router.put('/orders/:reference', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:update']), (0, validation_middleware_1.validateDto)(asaci_dto_1.UpdateOrderDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.updateOrder.bind(attestationController)));
    /**
     * @route POST /orders/:reference/approve
     * @desc Approve ASACI order
     * @access Private
     */
    router.post('/orders/:reference/approve', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:approve']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.approveOrder.bind(attestationController)));
    /**
     * @route POST /orders/:reference/reject
     * @desc Reject ASACI order
     * @access Private
     */
    router.post('/orders/:reference/reject', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:reject']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.rejectOrder.bind(attestationController)));
    /**
     * @route POST /orders/:reference/cancel
     * @desc Cancel ASACI order
     * @access Private
     */
    router.post('/orders/:reference/cancel', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:cancel']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.cancelOrder.bind(attestationController)));
    /**
     * @route POST /orders/:reference/suspend
     * @desc Suspend ASACI order
     * @access Private
     */
    router.post('/orders/:reference/suspend', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:suspend']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.suspendOrder.bind(attestationController)));
    /**
     * @route POST /orders/:reference/submit-for-confirmation
     * @desc Submit ASACI order for confirmation
     * @access Private
     */
    router.post('/orders/:reference/submit-for-confirmation', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:submit']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.submitOrderForConfirmation.bind(attestationController)));
    /**
     * @route POST /orders/:reference/confirm-delivery
     * @desc Confirm ASACI order delivery
     * @access Private
     */
    router.post('/orders/:reference/confirm-delivery', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:orders:confirm']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.confirmOrderDelivery.bind(attestationController)));
    // ASACI Certificate Routes
    /**
     * @route GET /certificates
     * @desc Get ASACI certificates
     * @access Private
     */
    router.get('/certificates', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getCertificates.bind(attestationController)));
    /**
     * @route GET /certificates/:reference
     * @desc Get ASACI certificate by reference
     * @access Private
     */
    router.get('/certificates/:reference', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getCertificate.bind(attestationController)));
    /**
     * @route GET /certificates/:reference/download
     * @desc Download ASACI certificate
     * @access Private
     */
    router.get('/certificates/:reference/download', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:download']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.downloadCertificate.bind(attestationController)));
    /**
     * @route POST /certificates/:reference/cancel
     * @desc Cancel ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/cancel', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:cancel']), (0, validation_middleware_1.validateDto)(asaci_dto_1.CancelCertificateDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.cancelCertificate.bind(attestationController)));
    /**
     * @route POST /certificates/:reference/suspend
     * @desc Suspend ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/suspend', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:suspend']), (0, validation_middleware_1.validateDto)(asaci_dto_1.SuspendCertificateDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.suspendCertificate.bind(attestationController)));
    /**
     * @route POST /certificates/:reference/check
     * @desc Check ASACI certificate
     * @access Private
     */
    router.post('/certificates/:reference/check', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:check']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.checkCertificate.bind(attestationController)));
    /**
     * @route GET /certificate-types
     * @desc Get ASACI certificate types
     * @access Private
     */
    router.get('/certificate-types', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getCertificateTypes.bind(attestationController)));
    /**
     * @route GET /certificate-variants
     * @desc Get ASACI certificate variants
     * @access Private
     */
    router.get('/certificate-variants', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:certificates:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getCertificateVariants.bind(attestationController)));
    // ASACI Transaction Routes
    /**
     * @route POST /transactions
     * @desc Create ASACI transaction
     * @access Private
     */
    router.post('/transactions', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:create']), (0, validation_middleware_1.validateDto)(asaci_dto_1.CreateTransactionDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.createTransaction.bind(attestationController)));
    /**
     * @route GET /transactions
     * @desc Get ASACI transactions
     * @access Private
     */
    router.get('/transactions', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getTransactions.bind(attestationController)));
    /**
     * @route GET /transactions/:reference
     * @desc Get ASACI transaction by reference
     * @access Private
     */
    router.get('/transactions/:reference', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getTransaction.bind(attestationController)));
    /**
     * @route PUT /transactions/:reference
     * @desc Update ASACI transaction
     * @access Private
     */
    router.put('/transactions/:reference', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:update']), (0, validation_middleware_1.validateDto)(asaci_dto_1.UpdateTransactionDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.updateTransaction.bind(attestationController)));
    /**
     * @route POST /transactions/:reference/approve
     * @desc Approve ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/approve', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:approve']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.approveTransaction.bind(attestationController)));
    /**
     * @route POST /transactions/:reference/reject
     * @desc Reject ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/reject', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:reject']), (0, validation_middleware_1.validateDto)(asaci_dto_1.RejectTransactionDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.rejectTransaction.bind(attestationController)));
    /**
     * @route POST /transactions/:reference/cancel
     * @desc Cancel ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/cancel', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:transactions:cancel']), (0, validation_middleware_1.validateDto)(asaci_dto_1.CancelTransactionDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.cancelTransaction.bind(attestationController)));
    // ASACI Statistics Routes
    /**
     * @route GET /statistics/certificates/usage
     * @desc Get ASACI certificate usage statistics
     * @access Private
     */
    router.get('/statistics/certificates/usage', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:statistics:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getCertificateUsageStatistics.bind(attestationController)));
    /**
     * @route GET /statistics/certificates/available
     * @desc Get ASACI available certificates statistics
     * @access Private
     */
    router.get('/statistics/certificates/available', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:statistics:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getAvailableCertificatesStatistics.bind(attestationController)));
    /**
     * @route GET /statistics/certificates/used
     * @desc Get ASACI used certificates statistics
     * @access Private
     */
    router.get('/statistics/certificates/used', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['asaci:statistics:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(attestationController.getUsedCertificatesStatistics.bind(attestationController)));
    return router;
}
//# sourceMappingURL=asaci.routes.js.map