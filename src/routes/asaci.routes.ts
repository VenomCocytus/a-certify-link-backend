import { Router } from 'express';
import { asyncHandlerMiddleware } from "@middlewares/async-handler.middleware";
import { authMiddleware } from "@middlewares/auth.middleware";
import { AsaciAttestationController } from "@controllers/asaci-attestation.controller";
import { AsaciAuthenticationController } from "@controllers/asaci-authentication.controller";

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
        asyncHandlerMiddleware(authController.generateToken.bind(authController))
    );

    /**
     * @route POST /auth/otp/validate
     * @desc Validate ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/validate',
        authMiddleware,
        asyncHandlerMiddleware(authController.validateOtp.bind(authController))
    );

    /**
     * @route POST /auth/otp/resend
     * @desc Resend ASACI OTP
     * @access Private
     */
    router.post('/auth/otp/resend',
        authMiddleware,
        asyncHandlerMiddleware(authController.resendOtp.bind(authController))
    );

    /**
     * @route POST /auth/forgot-password
     * @desc Request ASACI password reset
     * @access Private
     */
    router.post('/auth/forgot-password',
        authMiddleware,
        asyncHandlerMiddleware(authController.forgotPassword.bind(authController))
    );

    /**
     * @route POST /auth/reset-password
     * @desc Reset ASACI password
     * @access Private
     */
    router.post('/auth/reset-password',
        authMiddleware,
        asyncHandlerMiddleware(authController.resetPassword.bind(authController))
    );

    /**
     * @route POST /auth/welcome/send
     * @desc Send ASACI welcome email
     * @access Private
     */
    router.post('/auth/welcome/send',
        authMiddleware,
        asyncHandlerMiddleware(authController.resendWelcomeEmail.bind(authController))
    );

    /**
     * @route POST /auth/welcome/:userId/set-password
     * @desc Set initial ASACI password
     * @access Private
     */
    router.post('/auth/welcome/:userId/set-password',
        authMiddleware,
        asyncHandlerMiddleware(authController.setInitialPassword.bind(authController))
    );

    /**
     * @route GET /auth/user
     * @desc Get current ASACI user info
     * @access Private
     */
    router.get('/auth/user',
        authMiddleware,
        asyncHandlerMiddleware(authController.getCurrentUser.bind(authController))
    );

    /**
     * @route GET /auth/tokens
     * @desc Get ASACI user tokens
     * @access Private
     */
    router.get('/auth/tokens',
        authMiddleware,
        asyncHandlerMiddleware(authController.getUserTokens.bind(authController))
    );

    /**
     * @route POST /auth/tokens/revoke
     * @desc Revoke ASACI tokens
     * @access Private
     */
    router.post('/auth/tokens/revoke',
        authMiddleware,
        asyncHandlerMiddleware(authController.revokeTokens.bind(authController))
    );

    /**
     * @route DELETE /auth/tokens
     * @desc Delete current ASACI token
     * @access Private
     */
    router.delete('/auth/tokens',
        authMiddleware,
        asyncHandlerMiddleware(authController.deleteCurrentToken.bind(authController))
    );

    /**
     * @route GET /auth/email/send-verification
     * @desc Resend ASACI email verification
     * @access Private
     */
    router.get('/auth/email/send-verification',
        authMiddleware,
        asyncHandlerMiddleware(authController.resendEmailVerification.bind(authController))
    );

    /**
     * @route GET /auth/email/verify/:id/:hash
     * @desc Verify ASACI email
     * @access Private
     */
    router.get('/auth/email/verify/:id/:hash',
        authMiddleware,
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
        asyncHandlerMiddleware(attestationController.createProductionRequest.bind(attestationController))
    );

    /**
     * @route GET /productions
     * @desc Get ASACI production requests
     * @access Private
     */
    router.get('/productions',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getProductionRequests.bind(attestationController))
    );

    /**
     * @route GET /productions/:reference/download
     * @desc Download ASACI production ZIP
     * @access Private
     */
    router.get('/productions/:reference/download',
        authMiddleware,
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
        asyncHandlerMiddleware(attestationController.createOrder.bind(attestationController))
    );

    /**
     * @route GET /orders
     * @desc Get ASACI orders
     * @access Private
     */
    router.get('/orders',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getOrders.bind(attestationController))
    );

    /**
     * @route GET /orders/:reference
     * @desc Get ASACI order by reference
     * @access Private
     */
    router.get('/orders/:reference',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getOrder.bind(attestationController))
    );

    /**
     * @route PUT /orders/:reference
     * @desc Update ASACI order
     * @access Private
     */
    router.put('/orders/:reference',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.updateOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/approve
     * @desc Approve ASACI order
     * @access Private
     */
    router.post('/orders/:reference/approve',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.approveOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/reject
     * @desc Reject ASACI order
     * @access Private
     */
    router.post('/orders/:reference/reject',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.rejectOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/cancel
     * @desc Cancel ASACI order
     * @access Private
     */
    router.post('/orders/:reference/cancel',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.cancelOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/suspend
     * @desc Suspend ASACI order
     * @access Private
     */
    router.post('/orders/:reference/suspend',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.suspendOrder.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/submit-for-confirmation
     * @desc Submit ASACI order for confirmation
     * @access Private
     */
    router.post('/orders/:reference/submit-for-confirmation',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.submitOrderForConfirmation.bind(attestationController))
    );

    /**
     * @route POST /orders/:reference/confirm-delivery
     * @desc Confirm ASACI order delivery
     * @access Private
     */
    router.post('/orders/:reference/confirm-delivery',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.confirmOrderDelivery.bind(attestationController))
    );

    // ASACI Certificate Routes

    /**
     * @route GET /edition-requests
     * @desc Get ASACI edition-requests
     * @access Private
     */
    router.get('/edition-requests',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getCertificates.bind(attestationController))
    );

    /**
     * @route GET /edition-requests/:reference
     * @desc Get ASACI certificate by reference
     * @access Private
     */
    router.get('/edition-requests/:reference',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getCertificate.bind(attestationController))
    );

    /**
     * @route GET /edition-requests/:reference/download
     * @desc Download ASACI certificate
     * @access Private
     */
    router.get('/edition-requests/:reference/download',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.downloadCertificate.bind(attestationController))
    );

    /**
     * @route POST /edition-requests/:reference/cancel
     * @desc Cancel ASACI certificate
     * @access Private
     */
    router.post('/edition-requests/:reference/cancel',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.cancelCertificate.bind(attestationController))
    );

    /**
     * @route POST /edition-requests/:reference/suspend
     * @desc Suspend ASACI certificate
     * @access Private
     */
    router.post('/edition-requests/:reference/suspend',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.suspendCertificate.bind(attestationController))
    );

    /**
     * @route POST /edition-requests/:reference/check
     * @desc Check ASACI certificate
     * @access Private
     */
    router.post('/edition-requests/:reference/check',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.checkCertificate.bind(attestationController))
    );

    /**
     * @route GET /certificate-types
     * @desc Get ASACI certificate types
     * @access Private
     */
    router.get('/certificate-types',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getCertificateTypes.bind(attestationController))
    );

    /**
     * @route GET /certificate-variants
     * @desc Get ASACI certificate variants
     * @access Private
     */
    router.get('/certificate-variants',
        authMiddleware,
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
        asyncHandlerMiddleware(attestationController.createTransaction.bind(attestationController))
    );

    /**
     * @route GET /transactions
     * @desc Get ASACI transactions
     * @access Private
     */
    router.get('/transactions',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getTransactions.bind(attestationController))
    );

    /**
     * @route GET /transactions/:reference
     * @desc Get ASACI transaction by reference
     * @access Private
     */
    router.get('/transactions/:reference',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getTransaction.bind(attestationController))
    );

    /**
     * @route PUT /transactions/:reference
     * @desc Update ASACI transaction
     * @access Private
     */
    router.put('/transactions/:reference',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.updateTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/approve
     * @desc Approve ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/approve',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.approveTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/reject
     * @desc Reject ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/reject',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.rejectTransaction.bind(attestationController))
    );

    /**
     * @route POST /transactions/:reference/cancel
     * @desc Cancel ASACI transaction
     * @access Private
     */
    router.post('/transactions/:reference/cancel',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.cancelTransaction.bind(attestationController))
    );

    // ASACI Statistics Routes

    /**
     * @route GET /statistics/edition-requests/usage
     * @desc Get ASACI certificate usage statistics
     * @access Private
     */
    router.get('/statistics/edition-requests/usage',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getCertificateUsageStatistics.bind(attestationController))
    );

    /**
     * @route GET /statistics/edition-requests/available
     * @desc Get ASACI available edition-requests statistics
     * @access Private
     */
    router.get('/statistics/edition-requests/available',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getAvailableCertificatesStatistics.bind(attestationController))
    );

    /**
     * @route GET /statistics/edition-requests/used
     * @desc Get ASACI used edition-requests statistics
     * @access Private
     */
    router.get('/statistics/edition-requests/used',
        authMiddleware,
        asyncHandlerMiddleware(attestationController.getUsedCertificatesStatistics.bind(attestationController))
    );

    return router;
}