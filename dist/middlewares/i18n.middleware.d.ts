import { Request, Response, NextFunction } from 'express';
import { TFunction } from 'i18next';
interface I18nRequest extends Request {
    t: TFunction;
    language: string;
}
export declare const i18nMiddleware: (req: I18nRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=i18n.middleware.d.ts.map