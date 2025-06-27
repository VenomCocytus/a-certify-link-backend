import { Router } from 'express';
import { AuthenticationController } from "@controllers/authentication.controller";
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: SecurePass123!
 *         rememberMe:
 *           type: boolean
 *           default: false
 *         twoFactorCode:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           example: '123456'
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: newuser@example.com
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Doe
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *           example: SecurePass123!
 *         confirmPassword:
 *           type: string
 *           example: SecurePass123!
 *         phoneNumber:
 *           type: string
 *           minLength: 10
 *           maxLength: 20
 *           example: '+1234567890'
 *         roleId:
 *           type: string
 *           format: uuid
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         fullName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *         isActive:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         twoFactorEnabled:
 *           type: boolean
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *         accessToken:
 *           type: string
 *         expiresIn:
 *           type: integer
 *         tokenType:
 *           type: string
 *           default: Bearer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         status:
 *           type: integer
 *         detail:
 *           type: string
 *         instance:
 *           type: string
 *         traceId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             validationErrors:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
export declare function createAuthRoutes(authController: AuthenticationController): Router;
//# sourceMappingURL=auth.routes.d.ts.map