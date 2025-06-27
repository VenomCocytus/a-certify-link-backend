"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = exports.swaggerUiOptions = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: `${process.env.APP_NAME} Management API`,
            version: '1.0.0',
            description: `This is the comprehensive API documentation for the ${process.env.APP_NAME} system.`,
            contact: {
                name: 'API Support',
                email: 'support@eattestation.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token (without "Bearer " prefix)'
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken',
                    description: 'Refresh token stored in HTTP-only cookie'
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication information is missing or invalid',
                    content: {
                        'application/problem+json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7235#section-3.1' },
                                    title: { type: 'string', example: 'Authentication Required' },
                                    status: { type: 'integer', example: 401 },
                                    detail: { type: 'string', example: 'No valid authentication token provided' },
                                    instance: { type: 'string', example: '/api/auth/profile' },
                                    traceId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Insufficient permissions to access this resource',
                    content: {
                        'application/problem+json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7231#section-6.5.3' },
                                    title: { type: 'string', example: 'Insufficient Permissions' },
                                    status: { type: 'integer', example: 403 },
                                    detail: { type: 'string', example: 'User does not have the required permissions' },
                                    instance: { type: 'string' },
                                    traceId: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' },
                                    requiredPermissions: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Request validation failed',
                    content: {
                        'application/problem+json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7231#section-6.5.1' },
                                    title: { type: 'string', example: 'Validation Error' },
                                    status: { type: 'integer', example: 400 },
                                    detail: { type: 'string', example: 'The request contains invalid data' },
                                    instance: { type: 'string' },
                                    traceId: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' },
                                    validationErrors: {
                                        type: 'object',
                                        additionalProperties: { type: 'string' },
                                        example: {
                                            email: 'Please provide a valid email address',
                                            password: 'Password must be at least 8 characters long'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/problem+json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7231#section-6.5.4' },
                                    title: { type: 'string', example: 'Not Found' },
                                    status: { type: 'integer', example: 404 },
                                    detail: { type: 'string', example: 'The requested resource was not found' },
                                    instance: { type: 'string' },
                                    traceId: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/problem+json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7231#section-6.6.1' },
                                    title: { type: 'string', example: 'Internal Server Error' },
                                    status: { type: 'integer', example: 500 },
                                    detail: { type: 'string', example: 'An unexpected error occurred' },
                                    instance: { type: 'string' },
                                    traceId: { type: 'string' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path_1.default.join(__dirname, '../routes/*.routes.ts'),
        path_1.default.join(__dirname, '../routes/*.ts'),
        path_1.default.join(__dirname, '../controllers/*.controller.ts'),
        path_1.default.join(__dirname, '../controllers/*.ts'),
        // Add schema definitions if you create them
        // path.join(__dirname, '../docs/schemas/*.ts'),
        // path.join(__dirname, '../docs/responses/*.ts'),
        __filename
    ]
};
// Enhanced Swagger UI options with better styling
exports.swaggerUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { 
            color: #1e40af; 
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .swagger-ui .info .description { 
            font-size: 1rem; 
            line-height: 1.6;
        }
        .swagger-ui .scheme-container { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }
        .swagger-ui .opblock.opblock-post { border-color: #10b981; }
        .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
        .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
        .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
        .swagger-ui .btn.authorize { 
            background-color: #1e40af; 
            border-color: #1e40af;
        }
        .swagger-ui .btn.authorize:hover { 
            background-color: #1d4ed8; 
            border-color: #1d4ed8;
        }
        .swagger-ui .info .title:after {
            content: " 🛡️";
            font-size: 2rem;
        }
    `,
    customSiteTitle: `${process.env.APP_NAME} API Documentation`,
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        displayOperationId: false,
        showMutatedRequest: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: 'list', // 'list', 'full', 'none'
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        maxDisplayedTags: 10,
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true
    },
    explorer: true
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use(`${process.env.API_PREFIX}/docs`, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec, exports.swaggerUiOptions, {
        explorer: true,
        customSiteTitle: `${process.env.APP_NAME} API Documentation`
    }));
    // JSON spec endpoint
    app.get(`${process.env.API_PREFIX}/docs.json`, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(exports.swaggerSpec);
    });
    // Alternative endpoints for different formats
    app.get(`${process.env.API_PREFIX}/docs/openapi.json`, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(exports.swaggerSpec);
    });
    // Health check for swagger
    app.get(`${process.env.API_PREFIX}/docs/health`, (req, res) => {
        res.json({
            status: 'healthy',
            service: 'swagger-documentation',
            endpoints: {
                documentation: `${process.env.API_PREFIX}/docs`,
                jsonSpec: `${process.env.API_PREFIX}/docs.json`,
                openApiSpec: `${process.env.API_PREFIX}/docs/openapi.json`
            },
            timestamp: new Date().toISOString()
        });
    });
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map