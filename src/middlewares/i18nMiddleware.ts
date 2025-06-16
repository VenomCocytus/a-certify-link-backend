import { Request, Response, NextFunction } from 'express';
import i18next, {TFunction} from 'i18next';
import { logger } from '@utils/logger';

interface I18nRequest extends Request {
    t: TFunction;
    language: string;
}

export const i18nMiddleware = (
    req: I18nRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Detect language from various sources
        let language = detectLanguage(req);

        // Validate and set language
        const supportedLanguages = ['en', 'fr', 'es'];
        if (!supportedLanguages.includes(language)) {
            language = 'en'; // fallback
        }

        // Change language for this request
        i18next.changeLanguage(language);

        // Attach translation function to request
        req.t = i18next.getFixedT(language);

        // Attach language to request
        req.language = language;

        // Set a response language header
        res.set('Content-Language', language);

        logger.debug('Language set for request', {
            language,
            url: req.originalUrl,
        });

        next();
    } catch (error) {
        logger.error('i18n middleware error:', error);
        // Continue with the default language
        req.t = ((key: string) => key) as TFunction;
        req.language = 'en';
        next();
    }
};

function detectLanguage(req: Request): string {
    // 1. Check session language (if available)
    if ((req as any).session?.language) {
        return (req as any).session.language;
    }

    // 2. Check Accept-Language header
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
        // Parse Accept-Language header
        const languages = acceptLanguage
            .split(',')
            .map(lang => {
                const [code, quality = '1'] = lang.trim().split(';q=');
                return {
                    code: code.split('-')[0].toLowerCase(),
                    quality: parseFloat(quality),
                };
            })
            .sort((a, b) => b.quality - a.quality);

        for (const lang of languages) {
            if (['en', 'fr', 'es'].includes(lang.code)) {
                return lang.code;
            }
        }
    }

    // 3. Check custom header
    const customLang = req.headers['x-language'] as string;
    if (customLang && ['en', 'fr', 'es'].includes(customLang.toLowerCase())) {
        return customLang.toLowerCase();
    }

    // 4. Default fallback
    return 'en';
}