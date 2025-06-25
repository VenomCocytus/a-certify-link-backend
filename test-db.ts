// test-db.ts - Run this to test your database configuration
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🔍 Testing database configuration...');

// Test environment variables
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('DB_TRUSTED_CONNECTION:', process.env.DB_TRUSTED_CONNECTION);

async function testDatabase() {
    try {
        // Test importing the database module
        console.log('\n🔄 Testing database import...');

        const dbModule = await import('./src/config/database');
        console.log('Available exports:', Object.keys(dbModule));

        const sequelize = dbModule.default;

        if (!sequelize) {
            throw new Error('Sequelize instance not found in exports');
        }

        console.log('✅ Sequelize instance imported successfully');
        console.log('Sequelize instance type:', typeof sequelize);
        console.log('Has authenticate method:', typeof sequelize.authenticate === 'function');

        // Test connection
        console.log('\n🔄 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');

        // Get database info
        const dbName = sequelize.getDatabaseName();
        console.log('Connected to database:', dbName);

        // Close connection
        await sequelize.close();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase().then(() => {
    console.log('\n🎉 All database tests passed!');
    process.exit(0);
}).catch((error) => {
    console.error('\n💥 Database test failed:', error);
    process.exit(1);
});