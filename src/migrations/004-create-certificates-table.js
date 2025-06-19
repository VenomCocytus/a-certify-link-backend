'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('certificates', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            reference_number: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
                comment: 'Internal reference number for tracking',
            },
            ivory_request_number: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Reference number from IvoryAttestation system',
            },
            status: {
                type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'suspended'),
                allowNull: false,
                defaultValue: 'pending',
            },
            certificate_number: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Certificate number from IvoryAttestation',
            },
            download_url: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'URL to download the certificate',
            },
            download_expires_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Expiration date for download URL',
            },
            policy_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orass_policy',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            insured_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orass_insured',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            policy_number: {
                type: Sequelize.STRING(50),
                allowNull: false,
                comment: 'Denormalized for quick access',
            },
            registration_number: {
                type: Sequelize.STRING(20),
                allowNull: false,
                comment: 'Vehicle registration number',
            },
            company_code: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            agent_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            error_message: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Error message if certificate creation failed',
            },
            ivory_status_code: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Status code from IvoryAttestation API',
            },
            retry_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Number of retry attempts',
            },
            last_retry_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp of last retry attempt',
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Additional metadata for the certificate request',
            },
            idempotency_key: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Idempotency key to prevent duplicate operations',
            },
            processed_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp when certificate was fully processed',
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
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        // Add indexes
        await queryInterface.addIndex('certificates', ['reference_number'], {
            unique: true,
            name: 'idx_certificates_reference_number_unique'
        });
        await queryInterface.addIndex('certificates', ['ivory_request_number'], {
            name: 'idx_certificates_ivory_request_number'
        });
        await queryInterface.addIndex('certificates', ['certificate_number'], {
            name: 'idx_certificates_certificate_number'
        });
        await queryInterface.addIndex('certificates', ['policy_id'], {
            name: 'idx_certificates_policy_id'
        });
        await queryInterface.addIndex('certificates', ['insured_id'], {
            name: 'idx_certificates_insured_id'
        });
        await queryInterface.addIndex('certificates', ['policy_number'], {
            name: 'idx_certificates_policy_number'
        });
        await queryInterface.addIndex('certificates', ['registration_number'], {
            name: 'idx_certificates_registration_number'
        });
        await queryInterface.addIndex('certificates', ['company_code'], {
            name: 'idx_certificates_company_code'
        });
        await queryInterface.addIndex('certificates', ['agent_code'], {
            name: 'idx_certificates_agent_code'
        });
        await queryInterface.addIndex('certificates', ['status'], {
            name: 'idx_certificates_status'
        });
        await queryInterface.addIndex('certificates', ['created_by'], {
            name: 'idx_certificates_created_by'
        });
        await queryInterface.addIndex('certificates', ['idempotency_key'], {
            name: 'idx_certificates_idempotency_key'
        });
        await queryInterface.addIndex('certificates', ['created_at'], {
            name: 'idx_certificates_created_at'
        });
        await queryInterface.addIndex('certificates', ['processed_at'], {
            name: 'idx_certificates_processed_at'
        });

        // Composite index for duplicate checking
        await queryInterface.addIndex('certificates',
            ['policy_number', 'registration_number', 'company_code'],
            {
                name: 'idx_certificates_duplicate_check',
                where: {
                    status: ['pending', 'processing', 'completed']
                }
            }
        );

        // Index for retry processing
        await queryInterface.addIndex('certificates',
            ['status', 'retry_count'],
            {
                name: 'idx_certificates_retry_processing'
            }
        );

        console.log('✅ Certificates table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('certificates');
        console.log('❌ Certificates table dropped');
    }
};