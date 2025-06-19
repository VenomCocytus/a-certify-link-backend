import { Express } from "express";
export declare const swaggerUiOptions: {
    customCss: string;
    customSiteTitle: string;
    customfavIcon: string;
    swaggerOptions: {
        persistAuthorization: boolean;
        displayRequestDuration: boolean;
        filter: boolean;
        tryItOutEnabled: boolean;
    };
};
export declare const swaggerSpec: object;
export declare const setupSwagger: (app: Express) => void;
//# sourceMappingURL=swagger.d.ts.map