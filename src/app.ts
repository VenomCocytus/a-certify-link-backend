import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { globalExceptionHandlerMiddleware } from '@middlewares/globalExceptionHandler.middleware';
import { rateLimiterMiddleware } from '@middlewares/rateLimiter.middleware';
import routes from './routes';
import { Environment } from '@config/environment';
import {setupSwagger} from "@config/swagger";

// Initialize i18next
i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: Environment.DEFAULT_LANGUAGE,
        supportedLngs: Environment.SUPPORTED_LANGUAGES.split(','),
        backend: {
            loadPath: './src/locales/{{lng}}.json',
        },
        detection: {
            order: ['header', 'session'],
            caches: false,
        },
    });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: Environment.NODE_ENV !== 'production',
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(rateLimiterMiddleware);

// i18n middleware
app.use(i18nextMiddleware.handle(i18next));

// API Documentation
app.use(Environment.API_PREFIX, routes)
setupSwagger(app);

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
app.use(globalExceptionHandlerMiddleware);

export { app };