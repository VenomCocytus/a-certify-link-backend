import { Router } from 'express';
// import { certificateRoutes } from './certificate.routes';
// import { healthRoutes } from './healthRoutes';
// import { auditRoutes } from './auditRoutes';
// import authRoutes from './auth.routes';

const router = Router();

/**
 * @swagger
 *   get:
 *     summary: API Information
 *     description: Get basic information about the API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Digital Certificate Management API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                   example: API for managing digital certificates for insured parties
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 */
router.get('/', (req, res) => {
    res.json({
        name: 'Digital Certificate Management API',
        version: '1.0.0',
        description: 'API for managing digital certificates for insured parties',
        documentation: '/api-docs',
        timestamp: new Date().toISOString(),
    });
});

// Mount route modules
// router.use('/auth', authRoutes);
// router.use('/certificates', certificateRoutes);
// router.use('/health', healthRoutes);
// router.use('/audit', auditRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Returns basic API information and available endpoints
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: "/api/v1/auth"
 *                     health:
 *                       type: string
 *                       example: "/api/v1/health"
 */
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/v1/auth',
            health: '/api/v1/health'
        }
    });
});

export default router;