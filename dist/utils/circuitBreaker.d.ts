import CircuitBreaker from 'opossum';
interface CircuitBreakerOptions {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
    name: string;
}
export declare function createCircuitBreaker<T extends unknown[], R>(fn: (...args: T) => Promise<R>, options: CircuitBreakerOptions): CircuitBreaker<T, R>;
export declare const orassCircuitBreaker: <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => CircuitBreaker<T, R>;
export declare const asaciCircuitBreaker: <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => CircuitBreaker<T, R>;
export {};
//# sourceMappingURL=circuitBreaker.d.ts.map