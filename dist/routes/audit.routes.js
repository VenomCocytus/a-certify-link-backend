"use strict";
// import { Router } from 'express';
// import { AuditController } from '../controllers/auditController';
// import { authMiddleware, requirePermissions } from '@middlewares/authMiddleware';
// import { validateQuery } from '@middlewares/validationMiddleware';
// import Joi from 'joi';
//
// const router = Router();
// const auditController = new AuditController();
//
// // Apply authentication to all audit routes
// router.use(authMiddleware);
//
// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     AuditLogEntry:
//  *       type: object
//  *       properties:
//  *         id:
//  *           type: string
//  *           example: "550e8400-e29b-41d4-a716-446655440000"
//  *         userId:
//  *           type: string
//  *           example: "550e8400-e29b-41d4-a716-446655440001"
//  *         action:
//  *           type: string
//  *           example: "created"
//  *         resourceType:
//  *           type: string
//  *           example: "certificate"
//  *         resourceId:
//  *           type: string
//  *           example: "550e8400-e29b-41d4-a716-446655440002"
//  *         oldValues:
//  *           type: object
//  *           nullable: true
//  *         newValues:
//  *           type: object
//  *           nullable: true
//  *         metadata:
//  *           type: object
//  *           nullable: true
//  *         timestamp:
//  *           type: string
//  *           format: date-time
//  *         user:
//  *           type: object
//  *           properties:
//  *             id:
//  *               type: string
//  *             email:
//  *               type: string
//  *             firstName:
//  *               type: string
//  *             lastName:
//  *               type: string
//  */
//
// /**
//  * @swagger
//  * /api/v1/audit:
//  *   get:
//  *     summary: Get audit logs
//  *     description: Get paginated list of audit logs with optional filtering
//  *     tags: [Audit]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           default: 1
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           maximum: 100
//  *           default: 20
//  *         description: Number of items per page
//  *       - in: query
//  *         name: userId
//  *         schema:
//  *           type: string
//  *         description: Filter by user ID
//  *       - in: query
//  *         name: action
//  *         schema:
//  *           type: string
//  *           enum: [created, updated, canceled, suspended, downloaded, status_checked]
//  *         description: Filter by action type
//  *       - in: query
//  *         name: resourceType
//  *         schema:
//  *           type: string
//  *         description: Filter by resource type
//  *       - in: query
//  *         name: resourceId
//  *         schema:
//  *           type: string
//  *         description: Filter by resource ID
//  *       - in: query
//  *         name: dateFrom
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter logs from this date
//  *       - in: query
//  *         name: dateTo
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter logs until this date
//  *     responses:
//  *       200:
//  *         description: List of audit logs
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/AuditLogEntry'
//  *                 meta:
//  *                   $ref: '#/components/schemas/PaginationMeta'
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  *       403:
//  *         $ref: '#/components/responses/Forbidden'
//  */
// router.get(
//   '/',
//   requirePermissions(['audit:read']),
//   validateQuery(Joi.object({
//     page: Joi.number().integer().min(1).default(1),
//     limit: Joi.number().integer().min(1).max(100).default(20),
//     userId: Joi.string().uuid(),
//     action: Joi.string().valid('created', 'updated', 'cancelled', 'suspended', 'downloaded', 'status_checked'),
//     resourceType: Joi.string(),
//     resourceId: Joi.string().uuid(),
//     dateFrom: Joi.date().iso(),
//     dateTo: Joi.date().iso().min(Joi.ref('dateFrom')),
//   })),
//   auditController.getAuditLogs
// );
//
// /**
//  * @swagger
//  * /api/v1/audit/certificates/{certificateId}:
//  *   get:
//  *     summary: Get certificate audit history
//  *     description: Get the complete audit history for a specific certificate
//  *     tags: [Audit]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: certificateId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Certificate ID
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           default: 1
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           maximum: 100
//  *           default: 20
//  *         description: Number of items per page
//  *     responses:
//  *       200:
//  *         description: Certificate audit history
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/AuditLogEntry'
//  *                 meta:
//  *                   $ref: '#/components/schemas/PaginationMeta'
//  *       404:
//  *         $ref: '#/components/responses/NotFound'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get(
//   '/certificates/:certificateId',
//   requirePermissions(['audit:read', 'certificate:read']),
//   auditController.getCertificateAuditHistory
// );
//
// /**
//  * @swagger
//  * /api/v1/audit/users/{userId}:
//  *   get:
//  *     summary: Get user activity logs
//  *     description: Get audit logs for a specific user's activities
//  *     tags: [Audit]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: User ID
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           default: 1
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           maximum: 100
//  *           default: 20
//  *         description: Number of items per page
//  *       - in: query
//  *         name: dateFrom
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter activities from this date
//  *       - in: query
//  *         name: dateTo
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter activities until this date
//  *     responses:
//  *       200:
//  *         description: User activity logs
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/AuditLogEntry'
//  *                 meta:
//  *                   $ref: '#/components/schemas/PaginationMeta'
//  *       404:
//  *         $ref: '#/components/responses/NotFound'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get(
//   '/users/:userId',
//   requirePermissions(['audit:read']),
//   auditController.getUserActivityLogs
// );
//
// /**
//  * @swagger
//  * /api/v1/audit/export:
//  *   get:
//  *     summary: Export audit logs
//  *     description: Export audit logs to CSV format with filtering options
//  *     tags: [Audit]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: format
//  *         schema:
//  *           type: string
//  *           enum: [csv, json]
//  *           default: csv
//  *         description: Export format
//  *       - in: query
//  *         name: dateFrom
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Export logs from this date
//  *       - in: query
//  *         name: dateTo
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Export logs until this date
//  *       - in: query
//  *         name: userId
//  *         schema:
//  *           type: string
//  *         description: Filter by user ID
//  *       - in: query
//  *         name: action
//  *         schema:
//  *           type: string
//  *         description: Filter by action type
//  *     responses:
//  *       200:
//  *         description: Exported audit logs
//  *         content:
//  *           text/csv:
//  *             schema:
//  *               type: string
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/AuditLogEntry'
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  *       403:
//  *         $ref: '#/components/responses/Forbidden'
//  */
// router.get(
//   '/export',
//   requirePermissions(['audit:export']),
//   validateQuery(Joi.object({
//     format: Joi.string().valid('csv', 'json').default('csv'),
//     dateFrom: Joi.date().iso(),
//     dateTo: Joi.date().iso().min(Joi.ref('dateFrom')),
//     userId: Joi.string().uuid(),
//     action: Joi.string(),
//   })),
//   auditController.exportAuditLogs
// );
//
// export { router as auditRoutes };
//# sourceMappingURL=audit.routes.js.map