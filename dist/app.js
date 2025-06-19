"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const globalExceptionHandler_middleware_1 = require("@middlewares/globalExceptionHandler.middleware");
const requestLogger_middleware_1 = require("@middlewares/requestLogger.middleware");
const rateLimiter_middleware_1 = require("@middlewares/rateLimiter.middleware");
const routes_1 = __importDefault(require("./routes"));
const environment_1 = require("@config/environment");
const swagger_1 = require("@config/swagger");
// Initialize i18next
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .use(i18next_http_middleware_1.default.LanguageDetector)
    .init({
    fallbackLng: environment_1.Environment.DEFAULT_LANGUAGE,
    supportedLngs: environment_1.Environment.SUPPORTED_LANGUAGES.split(','),
    backend: {
        loadPath: './src/locales/{{lng}}.json',
    },
    detection: {
        order: ['header', 'session'],
        caches: false,
    },
});
const app = (0, express_1.default)();
exports.app = app;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: environment_1.Environment.NODE_ENV !== 'production',
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Compression middleware
app.use((0, compression_1.default)());
// Rate limiting
app.use(rateLimiter_middleware_1.rateLimiterMiddleware);
// Request logging
app.use(requestLogger_middleware_1.requestLoggerMiddleware);
// i18n middleware
app.use(i18next_http_middleware_1.default.handle(i18next_1.default));
// API Documentation
app.use(environment_1.Environment.API_PREFIX, routes_1.default);
(0, swagger_1.setupSwagger)(app);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
        title: 'Not Found',
        status: 404,
        detail: `Route ${req.originalUrl} not found`,
        instance: req.originalUrl,
    });
});
// Global error handler (must be last)
app.use(globalExceptionHandler_middleware_1.globalExceptionHandlerMiddleware);
//# sourceMappingURL=app.js.map