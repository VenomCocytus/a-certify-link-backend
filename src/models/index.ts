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

function initializeModels(): void {
    try {
        console.log('🔄 Initializing models...');

        // Initialize each model with the sequelized instance
        User = initUserModel(sequelize);
        Role = initRoleModel(sequelize);
        PasswordHistory = initPasswordHistoryModel(sequelize);
        AsaciRequest = initAsaciRequestModel(sequelize);
        OperationLog = initOperationLogModel(sequelize);

        console.log('✅ Models initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing models:', error);
        throw error;
    }
}

// Define model relationships
function defineAssociations(): void {
    try {
        console.log('🔄 Defining model associations...');

        // User <-> Role relationship (Many-to-One)
        User.belongsTo(Role, {
            foreignKey: 'roleId',
            as: 'role',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Role.hasMany(User, {
            foreignKey: 'roleId',
            as: 'users',
            onDelete: 'RESTRICT',
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
            foreignKey: 'productionRequestId',
            as: 'operationLogs',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        OperationLog.belongsTo(AsaciRequest, {
            foreignKey: 'productionRequestId',
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

// Initialize database with seed data
async function seedDatabase(): Promise<void> {
    try {
        console.log('🔄 Seeding database...');

        // Seed default roles
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
                    'roles.manage',
                    'asaci:productions:create',
                    'asaci:productions:read',
                    'asaci:productions:update',
                    'asaci:productions:delete',
                    'asaci:productions:retry',
                    'asaci:logs.read',
                    'asaci:system.configure',
                    'asaci:system.monitor'
                ],
                isActive: true
            },
            {
                name: 'USER',
                description: 'Regular user with basic access',
                permissions: [
                    'productions.create',
                    'productions.read',
                    'productions.download',
                    'profile.update',
                    'password.change'
                ],
                isActive: true
            },
            {
                name: 'OPERATOR',
                description: 'Operator with production management access',
                permissions: [
                    'productions.create',
                    'productions.read',
                    'productions.update',
                    'productions.retry',
                    'productions.download',
                    'users.read',
                    'logs.read',
                    'profile.update',
                    'password.change'
                ],
                isActive: true
            },
            {
                name: 'VIEWER',
                description: 'Read-only access for monitoring',
                permissions: [
                    'productions.read',
                    'users.read',
                    'logs.read'
                ],
                isActive: true
            }
        ];

        for (const roleData of roles) {
            const [role] = await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });

            console.log(`✅ Role ${role.name} initialized`);
        }

        // Create a default admin user if it doesn't already exist
        const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
        if (adminRole) {
            const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
            const [adminUser, created] = await User.findOrCreate({
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
                    emailVerifiedAt: new Date()
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

        console.log('✅ Database seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Setup periodic cleanup jobs
async function setupCleanupJobs(): Promise<void> {
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
}

// Database initialization function
export async function initializeDatabase(): Promise<void> {
    try {
        console.log('🔄 Initializing database...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        initializeModels();
        defineAssociations();

        // Sync database (create tables if they don't exist)
        await sequelize.sync({
            alter: process.env.NODE_ENV === 'development',
            force: false // Never force in production
        });
        console.log('✅ Database synchronized');

        // Seed initial data
        await seedDatabase();
        console.log('✅ Database seeded with initial data');

        // Setup cleanup jobs
        await setupCleanupJobs();
        console.log('✅ Cleanup jobs scheduled');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// Database health check
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
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

export {
    sequelize
};
export function getUser() {
    if (!User) throw new Error('User model not initialized. Call initializeDatabase() first.');
    return User;
}

export function getRole() {
    if (!Role) throw new Error('Role model not initialized. Call initializeDatabase() first.');
    return Role;
}

export function getPasswordHistory() {
    if (!PasswordHistory) throw new Error('PasswordHistory model not initialized. Call initializeDatabase() first.');
    return PasswordHistory;
}

export function getAsaciRequest() {
    if (!AsaciRequest) throw new Error('AsaciRequest model not initialized. Call initializeDatabase() first.');
    return AsaciRequest;
}

export function getOperationLog() {
    if (!OperationLog) throw new Error('OperationLog model not initialized. Call initializeDatabase() first.');
    return OperationLog;
}

export function getModels() {
    return {
        User: getUser(),
        Role: getRole(),
        PasswordHistory: getPasswordHistory(),
        AsaciRequest: getAsaciRequest(),
        OperationLog: getOperationLog()
    };
}