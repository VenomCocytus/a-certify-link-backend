import {Options, QueryTypes, Sequelize, Transaction} from 'sequelize';
import {Environment} from './environment';
import {logger} from '@utils/logger';

const isTrusted = Environment.DB_TRUSTED_CONNECTION === 'true';

// Extended Sequelize configuration with additional options for our models
const sequelizeConfig: Options = {
    host: Environment.DB_HOST,
    port: Environment.DB_PORT,
    database: Environment.DB_NAME,
    username: Environment.DB_USERNAME,
    password: Environment.DB_PASSWORD,
    dialect: 'mssql',

    // Connection options based on trusted connection
    ...(isTrusted
            ? {
                dialectOptions: {
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                        enableArithAbort: true,
                        validateBulkLoadParameters: false,
                        // Additional options for better MSSQL compatibility
                        useUTC: false,
                        dateFirst: 1,
                        abortTransactionOnError: true,
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
                        // Additional options for better MSSQL compatibility
                        useUTC: false,
                        dateFirst: 1,
                        abortTransactionOnError: true,
                    },
                    requestTimeout: 30000,
                    connectionTimeout: 30000,
                },
            }
    ),

    // Connection pool configuration
    pool: {
        max: Environment.DB_POOL_MAX,
        min: Environment.DB_POOL_MIN,
        acquire: Environment.DB_POOL_ACQUIRE,
        idle: Environment.DB_POOL_IDLE,
        evict: 1000, // Remove idle connections after 1 second
    },

    // Logging configuration
    logging: Environment.NODE_ENV === 'development'
        ? (sql: string, timing?: number) => {
            logger.debug(`SQL: ${sql}${timing ? ` (${timing}ms)` : ''}`);
        }
        : false,

    // Global model options
    define: {
        underscored: true,           // Use snake_case for column names
        freezeTableName: true,       // Don't pluralize table names
        timestamps: true,            // Add createdAt and updatedAt
        createdAt: 'created_at',     // Custom column name for createdAt
        updatedAt: 'updated_at',     // Custom column name for updatedAt
        paranoid: false,             // Don't use soft deletes by default
        version: false,              // Don't add a version field
    },

    // Timezone configuration
    timezone: '+00:00',

    // Query options
    query: {
        raw: false,
        nest: false,
    },

    // Retry configuration for connection issues
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

    // Transaction configuration
    transactionType: Transaction.TYPES.IMMEDIATE,
    isolationLevel: 'READ_COMMITTED',

    // Benchmark queries in development
    benchmark: Environment.NODE_ENV === 'development',

    // Synchronization options
    sync: {
        force: false,
        alter: Environment.NODE_ENV === 'development',
        hooks: true,
        logging: Environment.NODE_ENV === 'development' ? console.log : false,
    },
};

// Create Sequelize instance
export const sequelize = new Sequelize(sequelizeConfig);

// Connection event handlers
sequelize.authenticate()
    .then(() => {
        logger.info('✅ Database connection established successfully');
        logger.info(`📊 Database: ${Environment.DB_NAME} on ${Environment.DB_HOST}:${Environment.DB_PORT}`);
    })
    .catch((error: Error) => {
        logger.error('❌ Unable to connect to the database:', error);
    });

// Handle connection events
sequelize.addHook('beforeConnect', (config: any) => {
    logger.debug('🔄 Attempting database connection...');
});

sequelize.addHook('afterConnect', (connection: any, config: any) => {
    logger.debug('✅ Database connection established');
});

sequelize.addHook('beforeDisconnect', (connection: any) => {
    logger.debug('🔄 Disconnecting from database...');
});

sequelize.addHook('afterDisconnect', (connection: any) => {
    logger.debug('✅ Database disconnected');
});

// Error handling for connection issues
sequelize.addHook('beforeQuery', (options: any, query: any) => {
    if (Environment.NODE_ENV === 'development') {
        logger.debug(`🔍 Executing query: ${query.sql?.substring(0, 100)}...`);
    }
});

// Database utility functions
export const databaseUtils = {
    /**
     * Test database connection
     */
    async testConnection(): Promise<boolean> {
        try {
            await sequelize.authenticate();
            return true;
        } catch (error) {
            logger.error('Database connection test failed:', error);
            return false;
        }
    },

    /**
     * Close database connection
     */
    async closeConnection(): Promise<void> {
        try {
            await sequelize.close();
            logger.info('✅ Database connection closed successfully');
        } catch (error) {
            logger.error('❌ Error closing database connection:', error);
            throw error;
        }
    },

    /**
     * Get connection info
     */
    getConnectionInfo(): object {
        return {
            host: Environment.DB_HOST,
            port: Environment.DB_PORT,
            database: Environment.DB_NAME,
            dialect: 'mssql',
            pool: {
                max: Environment.DB_POOL_MAX,
                min: Environment.DB_POOL_MIN,
                acquire: Environment.DB_POOL_ACQUIRE,
                idle: Environment.DB_POOL_IDLE,
            },
            isTrustedConnection: isTrusted,
        };
    },

    /**
     * Get connection status
     */
    async getConnectionStatus(): Promise<{
        status: 'connected' | 'disconnected' | 'error';
        details?: any;
    }> {
        try {
            await sequelize.authenticate();

            // Type-safe pool stats access (requires casting)
            const pool = (sequelize.connectionManager as any).pool;
            const poolInfo = pool ? {
                using: pool.using?.length || 0,
                size: pool.size || 0
            } : undefined;

            return {
                status: 'connected',
                details: {
                    uptime: process.uptime(),
                    connectionTime: new Date().toISOString(),
                    poolInfo
                }
            };
        } catch (error: any) {
            return {
                status: 'error',
                details: {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                }
            };
        }
    },

    /**
     * Execute raw SQL query safely
     */
    async executeRawQuery(sql: string, replacements?: any): Promise<any> {
        try {
            const [results, metadata] = await sequelize.query(sql, {
                replacements,
                type:QueryTypes.SELECT,
            });
            return results;
        } catch (error) {
            logger.error('Raw query execution failed:', error);
            throw error;
        }
    },

    /**
     * Get database version and info
     */
    async getDatabaseInfo(): Promise<any> {
        try {
            const version = await sequelize.query('SELECT @@VERSION as version', {
                type: QueryTypes.SELECT,
            });

            const dbSize = await sequelize.query(`
                SELECT 
                    DB_NAME() as database_name,
                    SUM(size * 8.0 / 1024) as size_mb
                FROM sys.database_files
            `, {
                type: QueryTypes.SELECT,
            });

            return {
                version: version[0],
                size: dbSize[0],
                charset: 'UTF-8',
                collation: await sequelize.query('SELECT DATABASEPROPERTYEX(DB_NAME(), \'Collation\') as collation', {
                    type: QueryTypes.SELECT,
                }),
            };
        } catch (error) {
            logger.error('Failed to get database info:', error);
            throw error;
        }
    },

    /**
     * Create database backup (requires appropriate permissions)
     */
    async createBackup(backupPath?: string): Promise<void> {
        try {
            const defaultPath = `${Environment.DB_NAME}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
            const path = backupPath || defaultPath;

            await sequelize.query(`BACKUP DATABASE [${Environment.DB_NAME}] TO DISK = '${path}'`, {
                type: QueryTypes.RAW,
            });

            logger.info(`✅ Database backup created: ${path}`);
        } catch (error) {
            logger.error('Database backup failed:', error);
            throw error;
        }
    },

    /**
     * Get table statistics
     */
    async getTableStatistics(): Promise<any> {
        try {
            return await sequelize.query(`
                SELECT 
                    t.name AS table_name,
                    p.rows AS row_count,
                    CAST(ROUND(((SUM(a.total_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS total_space_mb,
                    CAST(ROUND(((SUM(a.used_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS used_space_mb,
                    CAST(ROUND(((SUM(a.total_pages) - SUM(a.used_pages)) * 8) / 1024.00, 2) AS NUMERIC(36, 2)) AS unused_space_mb
                FROM sys.tables t
                INNER JOIN sys.indexes i ON t.object_id = i.object_id
                INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
                INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
                WHERE t.name NOT LIKE 'dt%' 
                    AND t.is_ms_shipped = 0
                    AND i.object_id > 255
                GROUP BY t.name, p.rows
                ORDER BY p.rows DESC
            `, {
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            logger.error('Failed to get table statistics:', error);
            throw error;
        }
    },
};

// Export configuration for backward compatibility
export { sequelizeConfig };

// Export default sequelize instance
export default sequelize;