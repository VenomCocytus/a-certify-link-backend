'use strict';

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Get some users for idempotency keys
        const users = await queryInterface.sequelize.query(
            'SELECT id FROM users WHERE role IN (\'agent\', \'company_admin\') LIMIT 3',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length === 0) {
            console.log('⚠️ No users found. Skipping idempotency key creation.');
            return;
        }

        const idempotencyKeys = [
            // Completed idempotency key
            {
                id: uuidv4(),
                key: 'idem-' + uuidv4(),
                status: 'completed',
                request_hash: crypto.createHash('sha256').update('certificate-request-1').digest('hex'),
                request_path: '/api/v1/certificates',
                request_method: 'POST',
                response_status: 201,
                response_body: JSON.stringify({
                    success: true,
                    data: {
                        id: uuidv4(),
                        referenceNumber: 'REF' + Date.now() + 'COMPLETED',
                        status: 'pending'
                    }
                }),
                user_id: users[0].id,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },

            // Failed idempotency key
            {
                id: uuidv4(),
                key: 'idem-' + uuidv4(),
                status: 'failed',
                request_hash: crypto.createHash('sha256').update('certificate-request-2').digest('hex'),
                request_path: '/api/v1/certificates',
                request_method: 'POST',
                response_status: 400,
                response_body: JSON.stringify({
                    success: false,
                    error: 'Validation failed'
                }),
                user_id: users[1].id,
                expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
                created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                updated_at: new Date(Date.now() - 60 * 60 * 1000)
            },

            // Pending idempotency key
            {
                id: uuidv4(),
                key: 'idem-' + uuidv4(),
                status: 'pending',
                request_hash: crypto.createHash('sha256').update('certificate-request-3').digest('hex'),
                request_path: '/api/v1/certificates',
                request_method: 'POST',
                response_status: null,
                response_body: null,
                user_id: users[2] ? users[2].id : users[0].id,
                expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
                created_at: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                updated_at: new Date(Date.now() - 10 * 60 * 1000)
            },

            // Expired idempotency key
            {
                id: uuidv4(),
                key: 'idem-' + uuidv4(),
                status: 'completed',
                request_hash: crypto.createHash('sha256').update('certificate-request-old').digest('hex'),
                request_path: '/api/v1/certificates',
                request_method: 'POST',
                response_status: 201,
                response_body: JSON.stringify({
                    success: true,
                    data: {
                        id: uuidv4(),
                        referenceNumber: 'REF' + (Date.now() - 48 * 60 * 60 * 1000) + 'EXPIRED',
                        status: 'completed'
                    }
                }),
                user_id: users[0].id,
                expires_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (expired)
                created_at: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
                updated_at: new Date(Date.now() - 46 * 60 * 60 * 1000) // 46 hours ago
            },

            // Bulk operation idempotency key
            {
                id: uuidv4(),
                key: 'bulk-idem-' + uuidv4(),
                status: 'completed',
                request_hash: crypto.createHash('sha256').update('bulk-certificate-request').digest('hex'),
                request_path: '/api/v1/certificates/bulk',
                request_method: 'POST',
                response_status: 202,
                response_body: JSON.stringify({
                    success: true,
                    data: {
                        batchId: 'batch-' + uuidv4(),
                        totalRequests: 10,
                        successful: 8,
                        failed: 2
                    }
                }),
                user_id: users[0].id,
                expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
                created_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
            }
        ];

        await queryInterface.bulkInsert('idempotency_keys', idempotencyKeys);

        console.log('✅ Created sample idempotency keys:');
        console.log('   - 1 completed key');
        console.log('   - 1 failed key');
        console.log('   - 1 pending key');
        console.log('   - 1 expired key (for cleanup testing)');
        console.log('   - 1 bulk operation key');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('idempotency_keys', {});
    }
};