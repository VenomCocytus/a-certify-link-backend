'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create company admin users and agents
        const hashedPassword = await bcrypt.hash('Company@123', 12);

        const companyUsers = [
            // NSIA Insurance Company
            {
                id: uuidv4(),
                email: 'admin@nsia.ci',
                password: hashedPassword,
                first_name: 'Jean',
                last_name: 'Kouassi',
                role: 'company_admin',
                company_code: 'NSIA001',
                agent_code: null,
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:update',
                    'certificate:cancel',
                    'certificate:suspend',
                    'certificate:download',
                    'certificate:bulk_create',
                    'audit:read',
                    'user:read'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                email: 'agent1@nsia.ci',
                password: hashedPassword,
                first_name: 'Marie',
                last_name: 'Traore',
                role: 'agent',
                company_code: 'NSIA001',
                agent_code: 'AGT001',
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:download'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                email: 'agent2@nsia.ci',
                password: hashedPassword,
                first_name: 'Kofi',
                last_name: 'Asante',
                role: 'agent',
                company_code: 'NSIA001',
                agent_code: 'AGT002',
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:download'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },

            // SONAR Insurance Company
            {
                id: uuidv4(),
                email: 'admin@sonar.ci',
                password: hashedPassword,
                first_name: 'Fatou',
                last_name: 'Diabate',
                role: 'company_admin',
                company_code: 'SONAR001',
                agent_code: null,
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:update',
                    'certificate:cancel',
                    'certificate:suspend',
                    'certificate:download',
                    'certificate:bulk_create',
                    'audit:read',
                    'user:read'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                email: 'agent1@sonar.ci',
                password: hashedPassword,
                first_name: 'Ibrahim',
                last_name: 'Sangare',
                role: 'agent',
                company_code: 'SONAR001',
                agent_code: 'AGT003',
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:download'
                ]),
                is_active: true,
                last_login_at: null,
                password_changed_at: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },

            // SAHAM Insurance Company
            {
                id: uuidv4(),
                email: 'admin@saham.ci',
                password: hashedPassword,
                first_name: 'Aminata',
                last_name: 'Cisse',
                role: 'company_admin',
                company_code: 'SAHAM001',
                agent_code: null,
                permissions: JSON.stringify([
                    'certificate:create',
                    'certificate:read',
                    'certificate:update',
                    'certificate:cancel',
                    'certificate:suspend',
                    'certificate:download',
                    'certificate:bulk_create',
                    'audit:read',
                    'user:read'
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
        ];

        await queryInterface.bulkInsert('users', companyUsers);

        console.log('✅ Created sample company users:');
        console.log('   NSIA: admin@nsia.ci, agent1@nsia.ci, agent2@nsia.ci');
        console.log('   SONAR: admin@sonar.ci, agent1@sonar.ci');
        console.log('   SAHAM: admin@saham.ci');
        console.log('   Password for all: Company@123');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', {
            company_code: ['NSIA001', 'SONAR001', 'SAHAM001']
        });
    }
};