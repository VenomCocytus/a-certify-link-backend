'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = await bcrypt.hash('Admin@123456', 12);
        const adminId = uuidv4();

        await queryInterface.bulkInsert('users', [
            {
                id: adminId,
                email: 'admin@digitalcertificates.com',
                password: hashedPassword,
                first_name: 'System',
                last_name: 'Administrator',
                role: 'admin',
                company_code: null,
                agent_code: null,
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:update',
                    'certificate:delete',
                    'certificate:cancel',
                    'certificate:suspend',
                    'certificate:download',
                    'certificate:bulk_create',
                    'audit:read',
                    'audit:export',
                    'user:create',
                    'user:read',
                    'user:update',
                    'user:delete',
                    'system:admin'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            }
        ]);

        console.log('✅ Created admin user: admin@digitalcertificates.com / Admin@123456');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', {
            email: 'admin@digitalcertificates.com'
        });
    }
};