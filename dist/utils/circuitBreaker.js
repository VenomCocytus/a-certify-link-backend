"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ivoryAttestationCircuitBreaker = exports.orassCircuitBreaker = void 0;
exports.createCircuitBreaker = createCircuitBreaker;
const opossum_1 = __importDefault(require("opossum"));
const logger_1 = require("./logger");
const environment_1 = require("@config/environment");
function createCircuitBreaker(fn, options) {
    const circuitBreaker = new opossum_1.default(fn, {
        timeout: options.timeout,
        errorThresholdPercentage: options.errorThresholdPercentage,
        resetTimeout: options.resetTimeout,
        name: options.name,
    });
    // Event listeners for monitoring
    circuitBreaker.on('open', () => {
        logger_1.logger.warn(`Circuit breaker opened for ${options.name}`);
    });
    circuitBreaker.on('halfOpen', () => {
        logger_1.logger.info(`Circuit breaker half-opened for ${options.name}`);
    });
    circuitBreaker.on('close', () => {
        logger_1.logger.info(`Circuit breaker closed for ${options.name}`);
    });
    circuitBreaker.on('failure', (error) => {
        logger_1.logger.error(`Circuit breaker failure for ${options.name}:`, error);
    });
    return circuitBreaker;
}
// Pre-configured circuit breakers for external services
const orassCircuitBreaker = (fn) => createCircuitBreaker(fn, {
    timeout: environment_1.Environment.CIRCUIT_BREAKER_TIMEOUT,
    errorThresholdPercentage: environment_1.Environment.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
    resetTimeout: environment_1.Environment.CIRCUIT_BREAKER_RESET_TIMEOUT,
    name: 'Orass API',
});
exports.orassCircuitBreaker = orassCircuitBreaker;
const ivoryAttestationCircuitBreaker = (fn) => createCircuitBreaker(fn, {
    timeout: environment_1.Environment.CIRCUIT_BREAKER_TIMEOUT,
    errorThresholdPercentage: environment_1.Environment.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
    resetTimeout: environment_1.Environment.CIRCUIT_BREAKER_RESET_TIMEOUT,
    name: 'Asaci API',
});
exports.ivoryAttestationCircuitBreaker = ivoryAttestationCircuitBreaker;
//# sourceMappingURL=circuitBreaker.js.map