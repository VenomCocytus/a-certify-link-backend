"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const environment_1 = require("./environment");
const logger_1 = require("@utils/logger");
// Extended Sequelize configuration with additional options for our models
const sequelizeConfig = {
    host: environment_1.Environment.DB_HOST,
    port: environment_1.Environment.DB_PORT,
    database: environment_1.Environment.DB_NAME,
    username: environment_1.Environment.DB_USERNAME,
    password: environment_1.Environment.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
        ssl: environment_1.Environment.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        connectTimeout: 60000,
        application_name: environment_1.Environment.APP_NAME,
    },
    pool: {
        max: Math.max(1, parseInt(environment_1.Environment.DB_POOL_MAX?.toString() || '5', 10)),
        min: Math.max(0, parseInt(environment_1.Environment.DB_POOL_MIN?.toString() || '0', 10)),
        acquire: environment_1.Environment.DB_POOL_ACQUIRE,
        idle: environment_1.Environment.DB_POOL_IDLE,
        evict: 1000,
    },
    logging: environment_1.Environment.NODE_ENV === 'development'
        ? (sql, timing) => {
            logger_1.logger.debug(`SQL: ${sql}${timing ? ` (${timing}ms)` : ''}`);
        }
        : false,
    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false,
        defaultScope: {},
    },
    timezone: '+00:00',
    query: {
        raw: false,
        nest: false,
    },
    retry: {
        max: 3,
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /TIMEOUT/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
        ],
    },
    benchmark: environment_1.Environment.NODE_ENV === 'development',
    sync: {
        force: false,
        alter: environment_1.Environment.NODE_ENV === 'development',
        hooks: true,
        logging: environment_1.Environment.NODE_ENV === 'development' ? console.log : false,
    },
};
const sequelize = new sequelize_1.Sequelize(sequelizeConfig);
exports.default = sequelize;
//# sourceMappingURL=database.js.map