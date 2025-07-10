import CircuitBreaker from 'opossum';
import { logger } from './logger';
import { Environment } from '@config/environment';

interface CircuitBreakerOptions {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
    name: string;
}

export function createCircuitBreaker<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    options: CircuitBreakerOptions
): CircuitBreaker<T, R> {
    const circuitBreaker = new CircuitBreaker(fn, {
        timeout: options.timeout,
        errorThresholdPercentage: options.errorThresholdPercentage,
        resetTimeout: options.resetTimeout,
        name: options.name,
    });

    // Event listeners for monitoring
    circuitBreaker.on('open', () => {
        logger.warn(`Circuit breaker opened for ${options.name}`);
    });

    circuitBreaker.on('halfOpen', () => {
        logger.info(`Circuit breaker half-opened for ${options.name}`);
    });

    circuitBreaker.on('close', () => {
        logger.info(`Circuit breaker closed for ${options.name}`);
    });

    circuitBreaker.on('failure', (error) => {
        logger.error(`Circuit breaker failure for ${options.name}:`, error);
    });

    return circuitBreaker;
}

// Pre-configured circuit breakers for external services
export const orassCircuitBreaker = <T extends unknown[], R>(fn: (...args: T) => Promise<R>) =>
    createCircuitBreaker(fn, {
        timeout: process.env.CIRCUIT_BREAKER_TIMEOUT as unknown as number,
        errorThresholdPercentage: process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE as unknown as number,
        resetTimeout: process.env.CIRCUIT_BREAKER_RESET_TIMEOUT as unknown as number,
        name: 'Orass API',
    });

export const asaciCircuitBreaker = <T extends unknown[], R>(fn: (...args: T) => Promise<R>) =>
    createCircuitBreaker(fn, {
        timeout: process.env.CIRCUIT_BREAKER_TIMEOUT as unknown as number,
        errorThresholdPercentage: process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE as unknown as number,
        resetTimeout: process.env.CIRCUIT_BREAKER_RESET_TIMEOUT as unknown as number,
        name: 'Asaci API',
    });