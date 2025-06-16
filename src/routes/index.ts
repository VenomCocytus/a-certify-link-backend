import { Router } from 'express';
import { certificateRoutes } from './certificateRoutes';
// import { healthRoutes } from './healthRoutes';
// import { auditRoutes } from './auditRoutes';
// import { authRoutes } from './authRoutes';

const router = Router();

/**
 * @swagger
 * /api/v1:
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
router.use('/certificates', certificateRoutes);
// router.use('/health', healthRoutes);
// router.use('/audit', auditRoutes);

export { router as routes };