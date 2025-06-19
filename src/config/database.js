const {Environment} = require("./environment");
require('dotenv').config();
const isTrusted = process.env.DB_TRUSTED_CONNECTION === 'true';

module.exports = {
    development: {
        database: process.env.DB_NAME || 'master',
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '1433', 10),
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
                    username: Environment.DB_USERNAME,
                    password: Environment.DB_PASSWORD,
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
                }
        ),
        pool: {
            max: Environment.DB_POOL_MAX,
            min: Environment.DB_POOL_MIN,
            acquire: Environment.DB_POOL_ACQUIRE,
            idle: Environment.DB_POOL_IDLE,
        },
        logging: Environment.NODE_ENV === 'development' ? console.log : false,
        define: {
            underscored: true,
            freezeTableName: true,
            timestamps: true,
        },
        timezone: '+00:00',
    }
};