import swaggerJsdoc from 'swagger-jsdoc';
import { Environment } from './environment';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Digital Certificate Management API',
            version: '1.0.0',
            description: 'API for managing digital certificates for insured parties',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${Environment.PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            example: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
                        },
                        title: {
                            type: 'string',
                            example: 'Bad Request',
                        },
                        status: {
                            type: 'integer',
                            example: 400,
                        },
                        detail: {
                            type: 'string',
                            example: 'The request is invalid',
                        },
                        instance: {
                            type: 'string',
                            example: '/api/v1/certificates',
                        },
                    },
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        totalItems: {
                            type: 'integer',
                            example: 100,
                        },
                        pageSize: {
                            type: 'integer',
                            example: 10,
                        },
                        currentPage: {
                            type: 'integer',
                            example: 1,
                        },
                        totalPages: {
                            type: 'integer',
                            example: 10,
                        },
                        itemsPerPage: {
                            type: 'integer',
                            example: 10,
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['src/routes/*.ts', 'src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);