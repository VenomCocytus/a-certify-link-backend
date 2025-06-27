"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nMiddleware = void 0;
const i18next_1 = __importDefault(require("i18next"));
const logger_1 = require("@utils/logger");
const i18nMiddleware = (req, res, next) => {
    try {
        // Detect language from various sources
        let language = detectLanguage(req);
        // Validate and set language
        const supportedLanguages = ['en', 'fr', 'es'];
        if (!supportedLanguages.includes(language)) {
            language = 'en'; // fallback
        }
        // Change language for this request
        i18next_1.default.changeLanguage(language);
        // Attach translation function to request
        req.t = i18next_1.default.getFixedT(language);
        // Attach language to request
        req.language = language;
        // Set a response language header
        res.set('Content-Language', language);
        logger_1.logger.debug('Language set for request', {
            language,
            url: req.originalUrl,
        });
        next();
    }
    catch (error) {
        logger_1.logger.error('i18n middleware error:', error);
        // Continue with the default language
        req.t = ((key) => key);
        req.language = 'en';
        next();
    }
};
exports.i18nMiddleware = i18nMiddleware;
function detectLanguage(req) {
    // 1. Check session language (if available)
    if (req.session?.language) {
        return req.session.language;
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
    const customLang = req.headers['x-language'];
    if (customLang && ['en', 'fr', 'es'].includes(customLang.toLowerCase())) {
        return customLang.toLowerCase();
    }
    // 4. Default fallback
    return 'en';
}
//# sourceMappingURL=i18n.middleware.js.map