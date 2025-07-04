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
    //TODO: fix this road with postman
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

    // New Attestations Routes

    /**
     * @route GET /attestations
     * @desc Get attestations from ASACI API filtered by generated_id and other criteria
     * @access Private
     */
    router.get('/attestations',
        authMiddleware,
        // requirePermissions(['asaci:attestations:read']),
        asyncHandlerMiddleware(certifyLinkController.getAttestationsFromAsaci.bind(certifyLinkController))
    );

    // Stored ASACI Request Routes

    /**
     * @route GET /requests
     * @desc Get stored ASACI requests for the authenticated user
     * @access Private
     * @query status - Filter by request status
     * @query certificate_type - Filter by certificate type
     * @query limit - Number of records to return (default: 50)
     * @query offset - Number of records to skip (default: 0)
     */
    router.get('/requests',
        authMiddleware,
        // requirePermissions(['asaci:requests:read']),
        asyncHandlerMiddleware(certifyLinkController.getStoredAsaciRequests.bind(certifyLinkController))
    );

    /**
     * @route GET /requests/:requestId
     * @desc Get specific ASACI request by ID
     * @access Private
     */
    router.get('/requests/:requestId',
        authMiddleware,
        // requirePermissions(['asaci:requests:read']),
        asyncHandlerMiddleware(certifyLinkController.getAsaciRequestById.bind(certifyLinkController))
    );

    /**
     * @route POST /requests/:requestId/download
     * @desc Download certificate and track download count
     * @access Private
     */
    router.post('/requests/:requestId/download',
        authMiddleware,
        // requirePermissions(['asaci:certificates:download']),
        asyncHandlerMiddleware(certifyLinkController.downloadCertificate.bind(certifyLinkController))
    );

    // Statistics Routes

    /**
     * @route GET /statistics/user
     * @desc Get user statistics for ASACI requests
     * @access Private
     */
    router.get('/statistics/user',
        authMiddleware,
        requirePermissions(['asaci:statistics:read']),
        asyncHandlerMiddleware(certifyLinkController.getUserStatistics.bind(certifyLinkController))
    );

    /**
     * @route GET /statistics/orass
     * @desc Get ORASS statistics
     * @access Private
     */
    router.get('/statistics/orass',
        authMiddleware,
        requirePermissions(['orass:statistics:read']),
        asyncHandlerMiddleware(certifyLinkController.getOrassStatistics.bind(certifyLinkController))
    );

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
     * @route POST /certificates/download-link
     * @desc Get certificate download link by ASACI certificate reference/ID (POST version)
     * @access Private
     * @body certificateReference - The ASACI certificate reference/ID
     */
    //TODO: Turn this route into a query
    router.get('/certificates/:reference/download-link',
        authMiddleware,
        // requirePermissions(['asaci:certificates:download']),
        asyncHandlerMiddleware(certifyLinkController.getCertificateDownloadLink.bind(certifyLinkController))
    );

    /**
     * @route POST /certificates/batch-download-links
     * @desc Batch get certificate download links by multiple ASACI certificate references
     * @access Private
     * @body certificateReferences - Array of ASACI certificate references/IDs (max 50)
     */
    router.post('/certificates/batch-download-links',
        authMiddleware,
        requirePermissions(['asaci:certificates:download']),
        asyncHandlerMiddleware(certifyLinkController.getBatchCertificateDownloadLinks.bind(certifyLinkController))
    );

    return router;
}