'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('certificate_audit_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            certificate_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'certificates',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            action: {
                type: Sequelize.ENUM('created', 'updated', 'cancelled', 'suspended', 'downloaded', 'status_checked', 'login', 'logout', 'password_changed', 'password_reset', 'account_locked', 'account_unlocked'),
                allowNull: false,
            },
            old_status: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Previous status before the action',
            },
            new_status: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'New status after the action',
            },
            old_values: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Previous values before the change',
            },
            new_values: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'New values after the change',
            },
            details: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Additional details about the action',
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true,
                comment: 'IP address of the user performing the action',
            },
            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'User agent of the client',
            },
            session_id: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Session ID of the user',
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Add indexes
        await queryInterface.addIndex('certificate_audit_logs', ['certificate_id'], {
            name: 'idx_cert_audit_logs_certificate_id'
        });
        await queryInterface.addIndex('certificate_audit_logs', ['user_id'], {
            name: 'idx_cert_audit_logs_user_id'
        });
        await queryInterface.addIndex('certificate_audit_logs', ['action'], {
            name: 'idx_cert_audit_logs_action'
        });
        await queryInterface.addIndex('certificate_audit_logs', ['timestamp'], {
            name: 'idx_cert_audit_logs_timestamp'
        });
        await queryInterface.addIndex('certificate_audit_logs', ['ip_address'], {
            name: 'idx_cert_audit_logs_ip_address'
        });
        await queryInterface.addIndex('certificate_audit_logs', ['session_id'], {
            name: 'idx_cert_audit_logs_session_id'
        });

        // Composite indexes for common queries
        await queryInterface.addIndex('certificate_audit_logs',
            ['certificate_id', 'timestamp'],
            {
                name: 'idx_cert_audit_logs_cert_timestamp'
            }
        );
        await queryInterface.addIndex('certificate_audit_logs',
            ['user_id', 'timestamp'],
            {
                name: 'idx_cert_audit_logs_user_timestamp'
            }
        );
        await queryInterface.addIndex('certificate_audit_logs',
            ['action', 'timestamp'],
            {
                name: 'idx_cert_audit_logs_action_timestamp'
            }
        );

        console.log('✅ Certificate Audit Logs table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('certificate_audit_logs');
        console.log('❌ Certificate Audit Logs table dropped');
    }
};