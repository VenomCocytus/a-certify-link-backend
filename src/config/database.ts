import {Options, Sequelize, Transaction} from 'sequelize';
import {isDevelopment, isProduction} from './environment';
import {logger} from '@utils/logger';
import TYPES = Transaction.TYPES;
import process from "node:process";
import {parseNumber} from "@utils/generic.helper";

const sequelizeConfig: Options = {
    host: process.env.DB_HOST,
    port: parseNumber(process.env.DB_PORT, 3000),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: isProduction(),
            trustServerCertificate: isDevelopment(), // Trust server certificate in dev
            requestTimeout: 60000,
            connectionTimeout: 60000,
            appName: process.env.APP_NAME,
            enableArithAbort: true,
            instanceName: process.env.DB_INSTANCE_NAME,
        },
        ...(isProduction() && {
            authentication: {
                type: 'default',
            },
            server: process.env.DB_HOST,
            options: {
                database: process.env.DB_NAME,
                encrypt: true,
                trustServerCertificate: false,
            }
        })
    },

    pool: {
        max: Math.max(1, parseInt(process.env.DB_POOL_MAX?.toString() || '5', 10)),
        min: Math.max(0, parseInt(process.env.DB_POOL_MIN?.toString() || '0', 10)),
        acquire: parseNumber(process.env.DB_POOL_ACQUIRE, 30000),
        idle: parseNumber(process.env.DB_POOL_IDLE, 10000),
        evict: 1000,
    },

    logging: isDevelopment()
        ? (sql: string, timing?: number) => {
            logger.debug(`SQL: ${sql}${timing ? ` (${timing}ms)` : ''}`);
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
        charset: 'utf8',
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

            // MSSQL specific errors
            /ConnectionError/,
            /RequestError/,
            /TransactionError/,
        ],
    },

    benchmark: process.env.NODE_ENV === 'development',

    sync: {
        force: false,
        alter: process.env.NODE_ENV === 'development',
        hooks: true,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    },
    
    transactionType: TYPES.IMMEDIATE,
    isolationLevel: 'READ_COMMITTED',
};

const sequelize = new Sequelize(sequelizeConfig);

export default sequelize;