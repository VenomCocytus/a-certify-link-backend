import {Options, Sequelize, Transaction} from 'sequelize';
import {Environment} from './environment';
import {logger} from '@utils/logger';
import TYPES = Transaction.TYPES;

// Extended Sequelize configuration with additional options for our models
const sequelizeConfig: Options = {
    host: Environment.DB_HOST,
    port: Environment.DB_PORT,
    database: Environment.DB_NAME,
    username: Environment.DB_USERNAME,
    password: Environment.DB_PASSWORD,
    dialect: 'mssql', // Changed from 'postgres' to 'mssql'
    dialectOptions: {
        // MSSQL specific options
        options: {
            encrypt: Environment.NODE_ENV === 'production', // Use encryption for production
            trustServerCertificate: Environment.NODE_ENV !== 'production', // Trust server certificate in dev
            requestTimeout: 60000,
            connectionTimeout: 60000,
            appName: Environment.APP_NAME,
            enableArithAbort: true,
            instanceName: 'SQLEXPRESS',
        },
        // Connection options for Azure SQL Database (if using)
        ...(Environment.NODE_ENV === 'production' && {
            authentication: {
                type: 'default',
            },
            server: Environment.DB_HOST,
            options: {
                database: Environment.DB_NAME,
                encrypt: true,
                trustServerCertificate: false,
            }
        })
    },

    pool: {
        max: Math.max(1, parseInt(Environment.DB_POOL_MAX?.toString() || '5', 10)),
        min: Math.max(0, parseInt(Environment.DB_POOL_MIN?.toString() || '0', 10)),
        acquire: Environment.DB_POOL_ACQUIRE,
        idle: Environment.DB_POOL_IDLE,
        evict: 1000,
    },

    logging: Environment.NODE_ENV === 'development'
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

    benchmark: Environment.NODE_ENV === 'development',

    sync: {
        force: false,
        alter: Environment.NODE_ENV === 'development',
        hooks: true,
        logging: Environment.NODE_ENV === 'development' ? console.log : false,
    },

    // MSSQL specific transaction options
    transactionType: TYPES.IMMEDIATE,
    isolationLevel: 'READ_COMMITTED',
};

const sequelize = new Sequelize(sequelizeConfig);

export default sequelize;