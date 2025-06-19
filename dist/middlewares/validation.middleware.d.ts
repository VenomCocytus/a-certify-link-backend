import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
export declare const validateJoi: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDto: <T extends object>(DtoClass: new () => T) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateQuery: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map