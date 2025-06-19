"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelizeConfig = void 0;
const environment_1 = require("./environment");
const isTrusted = environment_1.Environment.DB_TRUSTED_CONNECTION === 'true';
const sequelizeConfig = {
    host: environment_1.Environment.DB_HOST,
    port: environment_1.Environment.DB_PORT,
    database: environment_1.Environment.DB_NAME,
    dialect: 'mssql',
    ...(isTrusted
        ? {
            dialectOptions: {
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                    enableArithAbort: true,
                    validateBulkLoadParameters: false,
                },
                trustedConnection: true,
                requestTimeout: 30000,
                connectionTimeout: 30000,
            },
        }
        : {
            username: environment_1.Environment.DB_USERNAME,
            password: environment_1.Environment.DB_PASSWORD,
            dialectOptions: {
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                    enableArithAbort: true,
                    validateBulkLoadParameters: false,
                },
                requestTimeout: 30000,
                connectionTimeout: 30000,
            },
        }),
    pool: {
        max: environment_1.Environment.DB_POOL_MAX,
        min: environment_1.Environment.DB_POOL_MIN,
        acquire: environment_1.Environment.DB_POOL_ACQUIRE,
        idle: environment_1.Environment.DB_POOL_IDLE,
    },
    logging: environment_1.Environment.NODE_ENV === 'development' ? console.log : false,
    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true,
    },
    timezone: '+00:00',
};
exports.sequelizeConfig = sequelizeConfig;
//# sourceMappingURL=database.js.map