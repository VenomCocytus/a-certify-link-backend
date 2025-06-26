import swaggerJsdoc from 'swagger-jsdoc';
import { Environment } from './environment';
import {Express} from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";

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
                url: `http://localhost:${Environment.PORT}${Environment.API_PREFIX}`,
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
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints'
            },
            {
                name: 'Authentication',
                description: 'User management endpoints'
            },
            {
                name: 'Certificate',
                description: 'Certificate management endpoints'
            }
        ],
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path.join(__dirname, '../routes/**/*.routes.ts'),
        path.join(__dirname, '../controllers/**/*.controller.ts'),
        //TODO: Add schema and response files if needed
        // path.join(__dirname, '../docs/schemas/*.ts'),
        // path.join(__dirname, '../docs/responses/*.ts')
    ]
};

// Swagger UI setup with custom CSS
export const swaggerUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #3b82f6; }
      `,
    customSiteTitle: "API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
    }
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
    app.use(
        `${Environment.API_PREFIX}/docs`,
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions,{
            explorer: true,
            customSiteTitle: 'Insurance API Documentation'
        })
    );

    app.get(`${Environment.API_PREFIX}/docs.json`, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

