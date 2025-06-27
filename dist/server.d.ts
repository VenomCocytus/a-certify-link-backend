import 'reflect-metadata';
import { App } from './app';
declare const config: {
    appName: string | undefined;
    port: number;
    apiPrefix: string;
    environment: string | undefined;
};
declare function startServer(): Promise<void>;
export declare function getServerConfig(): {
    appName: string | undefined;
    port: number;
    apiPrefix: string;
    environment: string | undefined;
};
export declare function getApp(): App | undefined;
export declare function getServer(): any;
export { startServer, config };
//# sourceMappingURL=server.d.ts.map