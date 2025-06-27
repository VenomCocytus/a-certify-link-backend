"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
class HttpClient {
    constructor(config) {
        this.client = axios_1.default.create(config);
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            logger_1.logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('HTTP Request Error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            logger_1.logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            if (error.response) {
                logger_1.logger.error(`HTTP Response Error: ${error.response.status} ${error.response.config?.url}`, {
                    status: error.response.status,
                    data: error.response.data,
                });
            }
            else if (error.request) {
                logger_1.logger.error('HTTP Network Error:', error.message);
            }
            else {
                logger_1.logger.error('HTTP Error:', error.message);
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    setAuthToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setApiKey(key, headerName = 'X-API-Key') {
        this.client.defaults.headers.common[headerName] = key;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpClient.js.map