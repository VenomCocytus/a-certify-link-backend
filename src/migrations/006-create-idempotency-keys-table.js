'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('idempotency_keys', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            key: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
                comment: 'Unique idempotency key provided by client',
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            request_hash: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Hash of the request body for verification',
            },
            request_path: {
                type: Sequelize.STRING(500),
                allowNull: false,
                comment: 'API endpoint path',
            },
            request_method: {
                type: Sequelize.STRING(10),
                allowNull: false,
                comment: 'HTTP method',
            },
            response_status: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'HTTP response status code',
            },
            response_body: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Cached response body',
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: 'User who made the request',
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
                comment: 'Expiration timestamp for the idempotency key',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Add indexes
        await queryInterface.addIndex('idempotency_keys', ['key'], {
            unique: true,
            name: 'idx_idempotency_keys_key_unique'
        });
        await queryInterface.addIndex('idempotency_keys', ['status'], {
            name: 'idx_idempotency_keys_status'
        });
        await queryInterface.addIndex('idempotency_keys', ['expires_at'], {
            name: 'idx_idempotency_keys_expires_at'
        });
        await queryInterface.addIndex('idempotency_keys', ['user_id'], {
            name: 'idx_idempotency_keys_user_id'
        });
        await queryInterface.addIndex('idempotency_keys', ['created_at'], {
            name: 'idx_idempotency_keys_created_at'
        });

        // Composite indexes
        await queryInterface.addIndex('idempotency_keys',
            ['request_path', 'request_method'],
            {
                name: 'idx_idempotency_keys_request_endpoint'
            }
        );
        await queryInterface.addIndex('idempotency_keys',
            ['user_id', 'created_at'],
            {
                name: 'idx_idempotency_keys_user_created'
            }
        );

        console.log('✅ Idempotency Keys table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('idempotency_keys');
        console.log('❌ Idempotency Keys table dropped');
    }
};