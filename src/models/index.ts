import { Op } from 'sequelize';
import { UserModel, initUserModel } from './user.model';
import { RoleModel, initRoleModel } from './role.model';
import sequelize from '@config/database';
import { PasswordHistoryModel, initPasswordHistoryModel } from './password-history.model';
import { AsaciRequestModel, initAsaciRequestModel } from './asaci-request.model';
import { OperationLogModel, initOperationLogModel } from './operation-log.model';
import bcrypt from "bcryptjs";

let User: typeof UserModel;
let Role: typeof RoleModel;
let PasswordHistory: typeof PasswordHistoryModel;
let AsaciRequest: typeof AsaciRequestModel;
let OperationLog: typeof OperationLogModel;

function initModels(): void {
    try {
        console.log('🔄 Initializing models for MSSQL...');

        Role = initRoleModel(sequelize);
        User = initUserModel(sequelize);
        PasswordHistory = initPasswordHistoryModel(sequelize);
        AsaciRequest = initAsaciRequestModel(sequelize);
        OperationLog = initOperationLogModel(sequelize);

        console.log('✅ Models initialized successfully for MSSQL');
    } catch (error) {
        console.error('❌ Error initializing models:', error);
        throw error;
    }
}

function defineModelsAssociations(): void {
    try {
        console.log('🔄 Defining model associations...');

        // User <-> Role relationship (Many-to-One)
        User.belongsTo(Role, {
            foreignKey: 'roleId',
            as: 'role',
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE'
        });

        Role.hasMany(User, {
            foreignKey: 'roleId',
            as: 'users',
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE'
        });

        // User <-> PasswordHistory relationship (One-to-Many)
        User.hasMany(PasswordHistory, {
            foreignKey: 'userId',
            as: 'passwordHistories',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        PasswordHistory.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // User <-> AsaciRequest relationship (One-to-Many)
        User.hasMany(AsaciRequest, {
            foreignKey: 'userId',
            as: 'asaciRequests',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        AsaciRequest.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // User <-> OperationLog relationship (One-to-Many)
        User.hasMany(OperationLog, {
            foreignKey: 'userId',
            as: 'operationLogs',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        OperationLog.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // AsaciRequest <-> OperationLog relationship (One-to-Many)
        AsaciRequest.hasMany(OperationLog, {
            foreignKey: 'asaciRequestId',
            as: 'operationLogs',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        OperationLog.belongsTo(AsaciRequest, {
            foreignKey: 'asaciRequestId',
            as: 'asaciRequest',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        console.log('✅ Model associations defined successfully');
    } catch (error) {
        console.error('❌ Error defining associations:', error);
        throw error;
    }
}

async function seedDatabase(): Promise<void> {
    try {
        console.log('🔄 Seeding database for MSSQL...');

        const roles = [
            {
                name: 'ADMIN',
                description: 'System Administrator with full access',
                permissions: [
                    'users.create',
                    'users.read',
                    'users.update',
                    'users.delete',
                    'users.block',
                    'users.unblock',
                    'verify.email',
                    'profile.update',
                    'profile.read',
                    'password.update',
                    'roles.manage',
                    'policies.read',
                    'edition.requests.create',
                    'edition.requests.read',
                    'user.edition.requests.read',
                    'edition.requests.download',
                    'user.statistics.read',
                    'orass.statistics.read'
                ],
                isActive: true // Changed to 1 for MSSQL BIT type
            },
            {
                name: 'USER',
                description: 'Regular user with basic access',
                permissions: [
                    'verify.email',
                    'profile.update',
                    'profile.read',
                    'password.update',
                    'policies.read',
                    'edition.requests.create',
                    'user.edition.requests.read',
                    'edition.requests.download',
                    'user.statistics.read',
                ],
                isActive: true // Changed to 1 for MSSQL BIT type
            },
            {
                name: 'OPERATOR',
                description: 'Operator with production management access',
                permissions: [
                    'edition.requests.create',
                    'user.edition.requests.read',
                    'edition.requests.download',
                    'user.statistics.read',
                    'users.read',
                    'logs.read',
                    'profile.update',
                    'password.change'
                ],
                isActive: true // Changed to 1 for MSSQL BIT type
            },
            {
                name: 'VIEWER',
                description: 'Read-only access for monitoring',
                permissions: [
                    'edition.requests.read',
                    'users.read',
                    'logs.read'
                ],
                isActive: true // Changed to 1 for MSSQL BIT type
            }
        ];

        for (const roleData of roles) {
            const [role] = await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: {
                    ...roleData,
                    permissions: roleData.permissions || [],
                    isActive: roleData.isActive
                }
            });

            console.log(`✅ Role ${role.name} initialized`);
        }

        const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
        if (adminRole) {
            const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
            const [created] = await User.findOrCreate({
                where: { email: 'admin@eattestation.com' },
                defaults: {
                    email: 'admin@eattestation.com',
                    firstName: 'System',
                    lastName: 'Administrator',
                    password: hashedPassword,
                    roleId: adminRole.id,
                    isActive: true,
                    isBlocked: false,
                    isEmailVerified: true,
                    emailVerifiedAt: new Date(),
                    loginAttempts: 0,
                    twoFactorEnabled: true
                }
            });

            if (created) {
                console.log('✅ Default admin user created');
                console.log('📧 Email: admin@eattestation.com');
                console.log('🔑 Password: Admin123!@# (Please change on first login)');
            } else {
                console.log('✅ Default admin user already exists');
            }
        }

        console.log('✅ Database seeded successfully for MSSQL');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

async function setupPeriodicCleanupJobs(): Promise<void> {
    // Clean up expired user blocks every hour
    setInterval(async () => {
        try {
            await User.cleanupExpiredBlocks();
            console.log('🧹 Cleaned up expired user blocks');
        } catch (error) {
            console.error('❌ Error cleaning up expired blocks:', error);
        }
    }, 60 * 60 * 1000); // 1 hour

    // Clean up old operation logs every day at 2 AM
    const now = new Date();
    const tomorrow2AM = new Date(now);
    tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
    tomorrow2AM.setHours(2, 0, 0, 0);

    const timeUntil2AM = tomorrow2AM.getTime() - now.getTime();

    setTimeout(() => {
        setInterval(async () => {
            try {
                const deletedCount = await OperationLog.cleanupOldLogs(30); // Keep 30 days
                console.log(`🧹 Cleaned up ${deletedCount} old operation logs`);
            } catch (error) {
                console.error('❌ Error cleaning up operation logs:', error);
            }
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeUntil2AM);

    //TODO: Clean up failed asaci requests
}

export async function initializeDatabase(): Promise<void> {
    try {
        console.log('🔄 Initializing database for MSSQL...');

        await sequelize.authenticate();
        console.log('✅ Database connection established');

        initModels();

        // MSSQL-specific sync options
        await sequelize.sync({
            alter: process.env.NODE_ENV === 'development',
            force: false, // Never force in production
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        });
        console.log('✅ Database synchronized for MSSQL');

        defineModelsAssociations();

        await seedDatabase();
        console.log('✅ Database seeded with initial data');

        console.log('🔄 Setting up periodic cleanup jobs...');
        await setupPeriodicCleanupJobs();
        console.log('✅ Cleanup jobs scheduled');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

export async function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
}> {
    try {
        // Test basic connection
        await sequelize.authenticate();

        // Test table access
        const userCount = await User.count();
        const roleCount = await Role.count();
        const asaciRequestCount = await AsaciRequest.count();
        const logCount = await OperationLog.count({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });

        return {
            status: 'healthy',
            details: {
                connection: 'active',
                database: 'mssql',
                users: userCount,
                roles: roleCount,
                asaciRequests: asaciRequestCount,
                recentLogs: logCount,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error: any) {
        return {
            status: 'unhealthy',
            details: {
                connection: 'failed',
                database: 'mssql',
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

export {
    sequelize,
    User,
    Role,
    PasswordHistory,
    AsaciRequest,
    OperationLog
};