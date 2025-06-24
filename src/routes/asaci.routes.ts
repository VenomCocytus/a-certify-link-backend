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
import {validateDto} from "@middlewares/validation.middleware";
import {asyncHandlerMiddleware} from "@middlewares/async-handler.middleware";
import {AsaciAttestationController} from "@controllers/asaci-attestation.controller";
import {AsaciAuthenticationController} from "@controllers/asaci-authentication.controller";

export function createAsaciRoutes(
    authController: AsaciAuthenticationController,
    attestationController: AsaciAttestationController
): Router {
    const router = Router();

    // Authentication Routes
    router.post('/auth/login',
        validateDto(GenerateTokenDto),
        asyncHandlerMiddleware(authController.generateToken.bind(authController))
    );

    router.post('/auth/otp/validate',
        validateDto(OtpValidateDto),
        asyncHandlerMiddleware(authController.validateOtp.bind(authController))
    );

    router.post('/auth/otp/resend',
        validateDto(OtpValidateDto),
        asyncHandlerMiddleware(authController.resendOtp.bind(authController))
    );

    router.post('/auth/forgot-password',
        validateDto(ForgotPasswordDto),
        asyncHandlerMiddleware(authController.forgotPassword.bind(authController))
    );

    router.post('/auth/reset-password',
        validateDto(ResetPasswordDto),
        asyncHandlerMiddleware(authController.resetPassword.bind(authController))
    );

    router.post('/auth/welcome/send',
        validateDto(ResendWelcomeDto),
        asyncHandlerMiddleware(authController.resendWelcomeEmail.bind(authController))
    );

    router.post('/auth/welcome/:userId/set-password',
        validateDto(SetInitialPasswordDto),
        asyncHandlerMiddleware(authController.setInitialPassword.bind(authController))
    );

    router.get('/auth/user',
        asyncHandlerMiddleware(authController.getCurrentUser.bind(authController))
    );

    router.get('/auth/tokens',
        asyncHandlerMiddleware(authController.getUserTokens.bind(authController))
    );

    router.post('/auth/tokens/revoke',
        validateDto(RevokeTokensDto),
        asyncHandlerMiddleware(authController.revokeTokens.bind(authController))
    );

    router.delete('/auth/tokens',
        asyncHandlerMiddleware(authController.deleteCurrentToken.bind(authController))
    );

    router.get('/auth/email/send-verification',
        asyncHandlerMiddleware(authController.resendEmailVerification.bind(authController))
    );

    router.get('/auth/email/verify/:id/:hash',
        asyncHandlerMiddleware(authController.verifyEmail.bind(authController))
    );

    // Production Routes
    router.post('/attestations/productions',
        validateDto(CreateProductionRequestDto),
        asyncHandlerMiddleware(attestationController.createProductionRequest.bind(attestationController))
    );

    router.get('/attestations/productions',
        asyncHandlerMiddleware(attestationController.getProductionRequests.bind(attestationController))
    );

    router.get('/attestations/productions/:reference/download',
        asyncHandlerMiddleware(attestationController.downloadProductionZip.bind(attestationController))
    );

    // Order Routes
    router.post('/attestations/orders',
        validateDto(CreateOrderDto),
        asyncHandlerMiddleware(attestationController.createOrder.bind(attestationController))
    );

    router.get('/attestations/orders',
        asyncHandlerMiddleware(attestationController.getOrders.bind(attestationController))
    );

    router.get('/attestations/orders/:reference',
        asyncHandlerMiddleware(attestationController.getOrder.bind(attestationController))
    );

    router.put('/attestations/orders/:reference',
        validateDto(UpdateOrderDto),
        asyncHandlerMiddleware(attestationController.updateOrder.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/approve',
        asyncHandlerMiddleware(attestationController.approveOrder.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/reject',
        asyncHandlerMiddleware(attestationController.rejectOrder.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/cancel',
        asyncHandlerMiddleware(attestationController.cancelOrder.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/suspend',
        asyncHandlerMiddleware(attestationController.suspendOrder.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/submit-for-confirmation',
        asyncHandlerMiddleware(attestationController.submitOrderForConfirmation.bind(attestationController))
    );

    router.post('/attestations/orders/:reference/confirm-delivery',
        asyncHandlerMiddleware(attestationController.confirmOrderDelivery.bind(attestationController))
    );

    // Certificate Routes
    router.get('/attestations/certificates',
        asyncHandlerMiddleware(attestationController.getCertificates.bind(attestationController))
    );

    router.get('/attestations/certificates/:reference',
        asyncHandlerMiddleware(attestationController.getCertificate.bind(attestationController))
    );

    router.get('/attestations/certificates/:reference/download',
        asyncHandlerMiddleware(attestationController.downloadCertificate.bind(attestationController))
    );

    router.post('/attestations/certificates/:reference/cancel',
        validateDto(CancelCertificateDto),
        asyncHandlerMiddleware(attestationController.cancelCertificate.bind(attestationController))
    );

    router.post('/attestations/certificates/:reference/suspend',
        validateDto(SuspendCertificateDto),
        asyncHandlerMiddleware(attestationController.suspendCertificate.bind(attestationController))
    );

    router.post('/attestations/certificates/:reference/check',
        asyncHandlerMiddleware(attestationController.checkCertificate.bind(attestationController))
    );

    router.get('/attestations/certificate-types',
        asyncHandlerMiddleware(attestationController.getCertificateTypes.bind(attestationController))
    );

    router.get('/attestations/certificate-variants',
        asyncHandlerMiddleware(attestationController.getCertificateVariants.bind(attestationController))
    );

    // Transaction Routes
    router.post('/attestations/transactions',
        validateDto(CreateTransactionDto),
        asyncHandlerMiddleware(attestationController.createTransaction.bind(attestationController))
    );

    router.get('/attestations/transactions',
        asyncHandlerMiddleware(attestationController.getTransactions.bind(attestationController))
    );

    router.get('/attestations/transactions/:reference',
        asyncHandlerMiddleware(attestationController.getTransaction.bind(attestationController))
    );

    router.put('/attestations/transactions/:reference',
        validateDto(UpdateTransactionDto),
        asyncHandlerMiddleware(attestationController.updateTransaction.bind(attestationController))
    );

    router.post('/attestations/transactions/:reference/approve',
        asyncHandlerMiddleware(attestationController.approveTransaction.bind(attestationController))
    );

    router.post('/attestations/transactions/:reference/reject',
        validateDto(RejectTransactionDto),
        asyncHandlerMiddleware(attestationController.rejectTransaction.bind(attestationController))
    );

    router.post('/attestations/transactions/:reference/cancel',
        validateDto(CancelTransactionDto),
        asyncHandlerMiddleware(attestationController.cancelTransaction.bind(attestationController))
    );

    // Statistics Routes
    router.get('/attestations/statistics/certificates/usage',
        asyncHandlerMiddleware(attestationController.getCertificateUsageStatistics.bind(attestationController))
    );

    router.get('/attestations/statistics/certificates/available',
        asyncHandlerMiddleware(attestationController.getAvailableCertificatesStatistics.bind(attestationController))
    );

    router.get('/attestations/statistics/certificates/used',
        asyncHandlerMiddleware(attestationController.getUsedCertificatesStatistics.bind(attestationController))
    );

    return router;
}