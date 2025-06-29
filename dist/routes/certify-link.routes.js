"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCertifyLinkRoutes = createCertifyLinkRoutes;
const express_1 = require("express");
const validation_middleware_1 = require("@middlewares/validation.middleware");
const async_handler_middleware_1 = require("@middlewares/async-handler.middleware");
const auth_middleware_1 = require("@middlewares/auth.middleware");
const rate_limiter_middleware_1 = require("@middlewares/rate-limiter.middleware");
const certify_link_dto_1 = require("@dto/certify-link.dto");
function createCertifyLinkRoutes(certifyLinkController) {
    const router = (0, express_1.Router)();
    // Health check route (public)
    /**
     * @route GET /health
     * @desc Health check for certify-link service
     * @access Public
     */
    router.get('/health', (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.healthCheck.bind(certifyLinkController)));
    // ORASS Policy Routes (authentication required)
    /**
     * @route GET /policies/search
     * @desc Search ORASS policies with various criteria
     * @access Private
     */
    router.get('/policies/search', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:policies:read']), validation_middleware_1.validateQuery, (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.searchOrassPolicies.bind(certifyLinkController)));
    /**
     * @route GET /policies/:policyNumber
     * @desc Get specific ORASS policy by policy number
     * @access Private
     */
    router.get('/policies/:policyNumber', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:policies:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.getOrassPolicyByNumber.bind(certifyLinkController)));
    /**
     * @route GET /policies/by-vehicle/:vehicleRegistration
     * @desc Get ORASS policies by vehicle registration
     * @access Private
     */
    router.get('/policies/by-vehicle/:vehicleRegistration', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:policies:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.getPoliciesByVehicleRegistration.bind(certifyLinkController)));
    /**
     * @route GET /policies/by-chassis/:chassisNumber
     * @desc Get ORASS policies by chassis number
     * @access Private
     */
    router.get('/policies/by-chassis/:chassisNumber', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:policies:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.getPoliciesByChassisNumber.bind(certifyLinkController)));
    /**
     * @route POST /policies/validate
     * @desc Validate ORASS policy for certificate creation
     * @access Private
     */
    router.post('/policies/validate', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:policies:validate']), (0, validation_middleware_1.validateDto)(certify_link_dto_1.ValidateOrassPolicyDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.validateOrassPolicy.bind(certifyLinkController)));
    // Certificate Creation Routes
    /**
     * @route POST /certificates/preview
     * @desc Preview certificate data before creation
     * @access Private
     */
    router.post('/certificates/preview', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:certificates:preview']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.previewCertificateData.bind(certifyLinkController)));
    /**
     * @route POST /certificates/create
     * @desc Create certificate production from ORASS policy
     * @access Private
     */
    router.post('/certificates/create', auth_middleware_1.authMiddleware, rate_limiter_middleware_1.certificateCreationLimiter, (0, auth_middleware_1.requirePermissions)(['orass:certificates:create']), (0, validation_middleware_1.validateDto)(certify_link_dto_1.CreateCertificateFromOrassDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.createCertificateFromOrassPolicy.bind(certifyLinkController)));
    /**
     * @route POST /certificates/bulk-create
     * @desc Create multiple certificates from ORASS policies (bulk operation)
     * @access Private
     */
    router.post('/certificates/bulk-create', auth_middleware_1.authMiddleware, rate_limiter_middleware_1.certificateCreationLimiter, (0, auth_middleware_1.requirePermissions)(['orass:certificates:bulk-create']), (0, validation_middleware_1.validateDto)(certify_link_dto_1.BulkCreateCertificatesFromOrassDto), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.bulkCreateCertificatesFromOrass.bind(certifyLinkController)));
    // Configuration and Utility Routes
    /**
     * @route GET /certificate-colors
     * @desc Get available certificate colors
     * @access Private
     */
    router.get('/certificate-colors', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:certificates:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.getAvailableCertificateColors.bind(certifyLinkController)));
    /**
     * @route GET /statistics
     * @desc Get ORASS statistics
     * @access Private
     */
    router.get('/statistics', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requirePermissions)(['orass:statistics:read']), (0, async_handler_middleware_1.asyncHandlerMiddleware)(certifyLinkController.getOrassStatistics.bind(certifyLinkController)));
    return router;
}
//# sourceMappingURL=certify-link.routes.js.map