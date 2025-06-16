// import { Router } from 'express';
// import { HealthController } from '@controllers/healthController';
// import { authMiddleware, requireRoles } from '@middlewares/authMiddleware';
//
// const router = Router();
// const healthController = new HealthController();
//
// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     HealthCheckResult:
//  *       type: object
//  *       properties:
//  *         status:
//  *           type: string
//  *           enum: [healthy, unhealthy, degraded]
//  *           example: healthy
//  *         timestamp:
//  *           type: string
//  *           format: date-time
//  *         services:
//  *           type: object
//  *           additionalProperties:
//  *             type: object
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [healthy, unhealthy, degraded]
//  *               responseTime:
//  *                 type: number
//  *                 example: 120
//  *               message:
//  *                 type: string
//  *                 example: "Service is responding normally"
//  *         version:
//  *           type: string
//  *           example: "1.0.0"
//  *         environment:
//  *           type: string
//  *           example: "production"
//  */
//
// /**
//  * @swagger
//  * /api/v1/health:
//  *   get:
//  *     summary: Basic health check
//  *     description: Get basic application health status
//  *     tags: [Health]
//  *     responses:
//  *       200:
//  *         description: Application is healthy
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: healthy
//  *                 timestamp:
//  *                   type: string
//  *                   format: date-time
//  *                 version:
//  *                   type: string
//  *                   example: "1.0.0"
//  *       503:
//  *         description: Application is unhealthy
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: unhealthy
//  *                 timestamp:
//  *                   type: string
//  *                   format: date-time
//  *                 error:
//  *                   type: string
//  *                   example: "Database connection failed"
//  */
// router.get('/', healthController.basicHealthCheck);
//
// /**
//  * @swagger
//  * /api/v1/health/detailed:
//  *   get:
//  *     summary: Detailed health check
//  *     description: Get detailed health status of all services and dependencies
//  *     tags: [Health]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Detailed health information
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HealthCheckResult'
//  *       503:
//  *         description: One or more services are unhealthy
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HealthCheckResult'
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get(
//     '/detailed',
//     authMiddleware,
//     requireRoles(['admin', 'company_admin']),
//     healthController.detailedHealthCheck
// );
//
// /**
//  * @swagger
//  * /api/v1/health/database:
//  *   get:
//  *     summary: Database health check
//  *     description: Check database connectivity and performance
//  *     tags: [Health]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Database is healthy
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: healthy
//  *                 responseTime:
//  *                   type: number
//  *                   example: 45
//  *                 timestamp:
//  *                   type: string
//  *                   format: date-time
//  *       503:
//  *         description: Database is unhealthy
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get(
//     '/database',
//     authMiddleware,
//     requireRoles(['admin']),
//     healthController.databaseHealthCheck
// );
//
// /**
//  * @swagger
//  * /api/v1/health/external-apis:
//  *   get:
//  *     summary: External APIs health check
//  *     description: Check connectivity to Orass and IvoryAttestation systems
//  *     tags: [Health]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: External APIs health status
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 orass:
//  *                   type: object
//  *                   properties:
//  *                     status:
//  *                       type: string
//  *                       example: healthy
//  *                     responseTime:
//  *                       type: number
//  *                       example: 250
//  *                 ivoryAttestation:
//  *                   type: object
//  *                   properties:
//  *                     status:
//  *                       type: string
//  *                       example: healthy
//  *                     responseTime:
//  *                       type: number
//  *                       example: 180
//  *       401:
//  *         $ref: '#/components/responses/Unauthorized'
//  */
// router.get(
//     '/external-apis',
//     authMiddleware,
//     requireRoles(['admin']),
//     healthController.externalApisHealthCheck
// );
//
// export { router as healthRoutes };