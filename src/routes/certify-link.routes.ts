import { Router } from 'express';
import { CertifyLinkController } from '@controllers/certify-link.controller';
import { validateDto } from '@middlewares/validation.middleware';
import { asyncHandlerMiddleware } from '@middlewares/async-handler.middleware';
import { authMiddleware, requirePermissions } from '@middlewares/auth.middleware';
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

    /**
     * @route GET /policies/search
     * @desc Search ORASS policies with various criteria
     * @access Private
     */
    router.get('/policies/search',
        authMiddleware,
        requirePermissions(['policies.read']),
        asyncHandlerMiddleware(certifyLinkController.searchOrassPolicies.bind(certifyLinkController))
    );

    /**
     * @route POST /edition-request/create
     * @desc Create edition request from ORASS policy
     * @access Private
     */
    router.post('/edition-requests/production',
        authMiddleware,
        requirePermissions(['edition.requests.create']),
        validateDto(CreateEditionFromOrassDataRequest),
        asyncHandlerMiddleware(certifyLinkController.createEditionRequestFromOrassPolicy.bind(certifyLinkController))
    );

    /**
     * @route GET /edition-requests
     * @desc Get attestations from ASACI API filtered by generated_id and other criteria
     * @access Private
     */
    router.get('/edition-requests',
        authMiddleware,
        requirePermissions(['edition.requests.read']),
        asyncHandlerMiddleware(certifyLinkController.getEditionRequestFromAsaci.bind(certifyLinkController))
    );

    /**
     * @route GET /user/edition-requests
     * @desc Get stored ASACI requests for the authenticated user
     * @access Private
     */
    router.get('/user/edition-requests',
        authMiddleware,
        requirePermissions(['user.edition.requests.read']),
        asyncHandlerMiddleware(certifyLinkController.getStoredAsaciRequests.bind(certifyLinkController))
    );

    /**
     * @route GET /edition-requests/:requestId
     * @desc Get specific ASACI request by ID
     * @access Private
     */
    router.get('/edition-requests/:requestId',
        authMiddleware,
        requirePermissions(['edition.requests.read']),
        asyncHandlerMiddleware(certifyLinkController.getAsaciRequestById.bind(certifyLinkController))
    );

    /**
     * @route POST /edition-requests/:requestId/download
     * @desc Download edition request and track download count
     * @access Private
     */
    router.post('/edition-requests/:requestId/download',
        authMiddleware,
        requirePermissions(['edition.requests.download']),
        asyncHandlerMiddleware(certifyLinkController.downloadEditionRequest.bind(certifyLinkController))
    );

    /**
     * @route GET /user/statistics
     * @desc Get user statistics for ASACI requests
     * @access Private
     */
    router.get('/user/statistics',
        authMiddleware,
        requirePermissions(['user.statistics.read']),
        asyncHandlerMiddleware(certifyLinkController.getUserStatistics.bind(certifyLinkController))
    );

    /**
     * @route GET /orass/statistics
     * @desc Get ORASS statistics
     * @access Private
     */
    router.get('/orass/statistics',
        authMiddleware,
        requirePermissions(['orass.statistics.read']),
        asyncHandlerMiddleware(certifyLinkController.getOrassStatistics.bind(certifyLinkController))
    );

    /**
     * @route POST /edition-request/download-link
     * @desc Get an edition request download link by ASACI edition request reference/ID
     * @access Private
     */
    router.get('/edition-requests/:reference/download-link',
        authMiddleware,
        requirePermissions(['edition.requests.download']),
        asyncHandlerMiddleware(certifyLinkController.getEditionRequestDownloadLink.bind(certifyLinkController))
    );

    /**
     * @route POST /edition-requests/batch-download-links
     * @desc Batch get edition requests download links by multiple ASACI edition requests references
     * @access Private
     * @body certificateReferences - Array of ASACI certificate references/IDs (max 50)
     */
    router.post('/edition-requests/batch-download-links',
        authMiddleware,
        requirePermissions(['edition.requests.download']),
        asyncHandlerMiddleware(certifyLinkController.getBatchEditionRequestDownloadLinks.bind(certifyLinkController))
    );

    return router;
}