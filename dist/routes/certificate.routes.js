"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificateRoutes = void 0;
const express_1 = require("express");
const certificate_controller_1 = require("@controllers/certificate.controller");
const auth_middleware_1 = require("@middlewares/auth.middleware");
const validation_middleware_1 = require("@middlewares/validation.middleware");
const idempotency_middleware_1 = require("@middlewares/idempotency.middleware");
const rateLimiter_middleware_1 = require("@middlewares/rateLimiter.middleware");
const joi_1 = __importDefault(require("joi"));
const async_handler_1 = require("@utils/async-handler");
const certificate_dto_1 = require("@dto/certificate.dto");
const router = (0, express_1.Router)();
exports.certificateRoutes = router;
const certificateController = new certificate_controller_1.CertificateController();
// Apply authentication to all certificate routes
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCertificateRequest:
 *       type: object
 *       required:
 *         - code_compagnie
 *         - date_demande_edition
 *         - date_souscription
 *         - date_effet
 *         - date_echeance
 *         - genre_vehicule
 *         - numero_immatriculation
 *         - type_vehicule
 *         - model_vehicule
 *         - categorie_vehicule
 *         - usage_vehicule
 *         - source_energie
 *         - nombre_place
 *         - marque_vehicule
 *         - numero_carte_brune_physique
 *         - nom_souscripteur
 *         - type_souscripteur
 *         - adresse_mail_souscripteur
 *         - numero_telephone_souscripteur
 *         - nom_assure
 *         - adresse_mail_assure
 *         - numero_police
 *         - numero_telephone_assure
 *         - profession_assure
 *         - code_point_vente_compagnie
 *         - denomination_point_vente_compagnie
 *         - rc
 *         - code_nature_attestation
 *         - date_premiere_mise_en_circulation
 *         - valeur_neuve
 *         - valeur_venale
 *         - montant_autres_garanties
 *         - montant_prime_nette_total
 *         - montant_accessoires
 *         - montant_taxes
 *         - montant_carte_brune
 *         - fga
 *         - montant_prime_ttc
 *       properties:
 *         code_compagnie:
 *           type: string
 *           example: "COMP001"
 *         numero_immatriculation:
 *           type: string
 *           example: "AB1234CD"
 *         numero_police:
 *           type: string
 *           example: "POL123456789"
 *     CertificateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         referenceNumber:
 *           type: string
 *           example: "REF1640995200123ABC"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, suspended]
 *           example: "pending"
 *         certificateNumber:
 *           type: string
 *           example: "ATD1997735444"
 *         downloadUrl:
 *           type: string
 *           example: "https://eattestation.ivoryattestation.app/#/consulter_attestations?numero=ATD1997735444"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         policyNumber:
 *           type: string
 *           example: "POL123456789"
 *         registrationNumber:
 *           type: string
 *           example: "AB1234CD"
 *         companyCode:
 *           type: string
 *           example: "COMP001"
 */
/**
 * @swagger
 * /api/v1/certificates:
 *   post:
 *     summary: Create a new digital certificate
 *     description: Create a new digital certificate for an insured vehicle
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique key to prevent duplicate operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCertificateRequest'
 *     responses:
 *       201:
 *         description: Certificate creation initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CertificateResponse'
 *                 message:
 *                   type: string
 *                   example: "Certificate creation initiated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post('/', rateLimiter_middleware_1.certificateCreationLimiter, (0, idempotency_middleware_1.idempotencyMiddleware)({ ttlHours: 24 }), //TODO: To review
(0, auth_middleware_1.requirePermissions)(['certificate:create']), (0, validation_middleware_1.validateDto)(certificate_dto_1.CertificateCreationRequest), (0, async_handler_1.asyncHandler)(certificateController.createCertificate));
/**
 * @swagger
 * /api/v1/certificates:
 *   get:
 *     summary: List certificates
 *     description: Get a paginated list of certificates with optional filtering
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, suspended]
 *         description: Filter by certificate status
 *       - in: query
 *         name: companyCode
 *         schema:
 *           type: string
 *         description: Filter by company code
 *       - in: query
 *         name: policyNumber
 *         schema:
 *           type: string
 *         description: Filter by policy number
 *       - in: query
 *         name: registrationNumber
 *         schema:
 *           type: string
 *         description: Filter by vehicle registration number
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter certificates created from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter certificates created until this date
 *     responses:
 *       200:
 *         description: List of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CertificateResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', (0, auth_middleware_1.requirePermissions)(['certificate:read']), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    status: joi_1.default.string().valid('pending', 'processing', 'completed', 'failed', 'cancelled', 'suspended'),
    companyCode: joi_1.default.string(),
    policyNumber: joi_1.default.string(),
    registrationNumber: joi_1.default.string(),
    dateFrom: joi_1.default.date().iso(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref('dateFrom')),
})), (0, async_handler_1.asyncHandler)(certificateController.listCertificates));
/**
 * @swagger
 * /api/v1/certificates/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     description: Get detailed information about a specific certificate
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CertificateResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', (0, auth_middleware_1.requirePermissions)(['certificate:read']), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    id: joi_1.default.string().uuid().required(),
})), (0, async_handler_1.asyncHandler)(certificateController.getCertificateById));
/**
 * @swagger
 * /api/v1/certificates/{id}/status:
 *   get:
 *     summary: Check certificate status
 *     description: Check the current status of a certificate from IvoryAttestation
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     ivoryStatus:
 *                       type: number
 *                       example: 0
 *                     message:
 *                       type: string
 *                       example: "Certificate generation completed"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/status', (0, auth_middleware_1.requirePermissions)(['certificate:read']), (0, async_handler_1.asyncHandler)(certificateController.checkCertificateStatus));
/**
 * @swagger
 * /api/v1/certificates/{id}/download:
 *   get:
 *     summary: Get certificate download URL
 *     description: Get the download URL for a completed certificate
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PDF, IMAGE, QRCODE]
 *           default: PDF
 *         description: File type to download
 *     responses:
 *       200:
 *         description: Download URL information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       example: "https://eattestation.ivoryattestation.app/#/consulter_attestations?numero=ATD1997735444&type=1"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     fileType:
 *                       type: string
 *                       example: "PDF"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/download', (0, auth_middleware_1.requirePermissions)(['certificate:download']), (0, async_handler_1.asyncHandler)(certificateController.downloadCertificate));
/**
 * @swagger
 * /api/v1/certificates/{id}/cancel:
 *   put:
 *     summary: Cancel certificate
 *     description: Cancel a certificate in IvoryAttestation system
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Policy cancelled by customer request"
 *     responses:
 *       200:
 *         description: Certificate cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Certificate cancelled successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id/cancel', (0, auth_middleware_1.requirePermissions)(['certificate:cancel']), (0, async_handler_1.asyncHandler)(certificateController.cancelCertificate));
/**
 * @swagger
 * /api/v1/certificates/{id}/suspend:
 *   put:
 *     summary: Suspend certificate
 *     description: Suspend a certificate in IvoryAttestation system
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Temporary suspension for investigation"
 *     responses:
 *       200:
 *         description: Certificate suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Certificate suspended successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id/suspend', (0, auth_middleware_1.requirePermissions)(['certificate:suspend']), (0, async_handler_1.asyncHandler)(certificateController.suspendCertificate));
/**
 * @swagger
 * /api/v1/certificates/bulk:
 *   post:
 *     summary: Create multiple certificates
 *     description: Create multiple certificates in a single batch operation
 *     tags: [Certificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique key to prevent duplicate operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificates
 *             properties:
 *               certificates:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateCertificateRequest'
 *                 maxItems: 100
 *     responses:
 *       202:
 *         description: Bulk certificate creation initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     batchId:
 *                       type: string
 *                       example: "batch_550e8400-e29b-41d4-a716-446655440000"
 *                     totalRequests:
 *                       type: number
 *                       example: 50
 *                     message:
 *                       type: string
 *                       example: "Bulk certificate creation initiated"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/bulk', (0, auth_middleware_1.requireRoles)(['admin', 'company_admin']), (0, auth_middleware_1.requirePermissions)(['certificate:bulk_create']), (0, idempotency_middleware_1.idempotencyMiddleware)({ ttlHours: 48 }), (0, async_handler_1.asyncHandler)(certificateController.createBulkCertificates));
//# sourceMappingURL=certificate.routes.js.map