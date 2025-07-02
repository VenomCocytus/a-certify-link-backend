import { Router } from 'express';
import { CertifyLinkController } from '@controllers/certify-link.controller';
import { validateDto, validateQuery } from '@middlewares/validation.middleware';
import { asyncHandlerMiddleware } from '@middlewares/async-handler.middleware';
import { authMiddleware, requirePermissions } from '@middlewares/auth.middleware';
import { certificateCreationLimiter } from '@middlewares/rate-limiter.middleware';
import {
    BulkCreateCertificatesFromOrassDto
} from '@dto/certify-link.dto';
import {CreateEditionFromOrassDataRequest} from "@dto/orass.dto";

export function createCertifyLinkRoutes(certifyLinkController: CertifyLinkController): Router {
    const router = Router();

    // Health check route (public)
    /**
     * @route GET /health
     * @desc Health check for certify-link service
     * @access Public
     */
    router.get('/health',
        asyncHandlerMiddleware(certifyLinkController.healthCheck.bind(certifyLinkController))
    );

    // ORASS Policy Routes (authentication required)

    /**
     * @route GET /policies/search
     * @desc Search ORASS policies with various criteria
     * @access Private
     */
    router.get('/policies/search',
        authMiddleware,
        requirePermissions(['orass:policies:read']),
        // validateQuery,
        asyncHandlerMiddleware(certifyLinkController.searchOrassPolicies.bind(certifyLinkController))
    );

    /**
     * @route POST /certificates/create
     * @desc Create certificate production from ORASS policy
     * @access Private
     */
    router.post('/certificates/production',
        authMiddleware,
        // certificateCreationLimiter,
        requirePermissions(['orass:certificates:create']),
        validateDto(CreateEditionFromOrassDataRequest),
        asyncHandlerMiddleware(certifyLinkController.createEditionRequestFromOrassPolicy.bind(certifyLinkController))
    );

    //TODO: Update the route to create bulk edition requests from ORASS policies
    // /**
    //  * @route POST /certificates/bulk-create
    //  * @desc Create multiple certificates from ORASS policies (bulk operation)
    //  * @access Private
    //  */
    // router.post('/certificates/bulk-create',
    //     authMiddleware,
    //     certificateCreationLimiter,
    //     requirePermissions(['orass:certificates:bulk-create']),
    //     validateDto(BulkCreateCertificatesFromOrassDto),
    //     asyncHandlerMiddleware(certifyLinkController.bulkCreateCertificatesFromOrass.bind(certifyLinkController))
    // );

    // Configuration and Utility Routes

    /**
     * @route GET /certificate-colors
     * @desc Get available certificate colors
     * @access Private
     */
    router.get('/certificate-colors',
        authMiddleware,
        requirePermissions(['orass:certificates:read']),
        asyncHandlerMiddleware(certifyLinkController.getAvailableCertificateColors.bind(certifyLinkController))
    );

    /**
     * @route GET /statistics
     * @desc Get ORASS statistics
     * @access Private
     */
    router.get('/statistics',
        authMiddleware,
        requirePermissions(['orass:statistics:read']),
        asyncHandlerMiddleware(certifyLinkController.getOrassStatistics.bind(certifyLinkController))
    );

    return router;
}