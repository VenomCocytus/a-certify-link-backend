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
                onDelete: 'NO ACTION',
            },
            insured_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orass_insured',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION',
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
                onDelete: 'NO ACTION',
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
                type: Sequelize.STRING(255),
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

        // Add indexes with SQL Server optimizations
        await queryInterface.sequelize.transaction(async (transaction) => {
            // Create all indexes in parallel for better performance
            await Promise.all([
                // Unique reference number index with null filter
                queryInterface.addIndex('certificates', ['reference_number'], {
                    unique: true,
                    name: 'idx_certificates_reference_number_unique',
                    transaction,
                    where: {
                        reference_number: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Ivory request number index with coverage
                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_ivory_request_number 
            ON certificates (ivory_request_number)
            INCLUDE (status, processed_at)
            WHERE ivory_request_number IS NOT NULL
            AND deleted_at IS NULL
        `, { transaction }),

                // Certificate number index with coverage
                queryInterface.addIndex('certificates', ['certificate_number'], {
                    name: 'idx_certificates_certificate_number',
                    transaction,
                    include: ['policy_number', 'status'],
                    where: {
                        certificate_number: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Foreign key indexes with included columns
                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_policy_id 
            ON certificates (policy_id)
            INCLUDE (policy_number, status)
            WHERE deleted_at IS NULL
        `, { transaction }),

                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_insured_id 
            ON certificates (insured_id)
            INCLUDE (policy_id, status)
            WHERE deleted_at IS NULL
        `, { transaction }),

                // Policy number index with coverage
                queryInterface.addIndex('certificates', ['policy_number'], {
                    name: 'idx_certificates_policy_number',
                    transaction,
                    include: ['insured_id', 'company_code'],
                    where: {
                        policy_number: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Registration number index with coverage
                queryInterface.addIndex('certificates', ['registration_number'], {
                    name: 'idx_certificates_registration_number',
                    transaction,
                    include: ['vehicle_make', 'vehicle_model'],
                    where: {
                        registration_number: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Business domain indexes with filters
                queryInterface.addIndex('certificates', ['company_code'], {
                    name: 'idx_certificates_company_code',
                    transaction,
                    include: ['agent_code', 'status'],
                    where: {
                        deleted_at: null
                    }
                }),

                queryInterface.addIndex('certificates', ['agent_code'], {
                    name: 'idx_certificates_agent_code',
                    transaction,
                    where: {
                        agent_code: { [Sequelize.Op.ne]: null },
                        deleted_at: null
                    }
                }),

                // Status index with temporal coverage
                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_status 
            ON certificates (status, created_at, processed_at)
            WHERE status IN ('pending', 'processing', 'failed')
            AND deleted_at IS NULL
        `, { transaction }),

                // Creator index with coverage
                queryInterface.addIndex('certificates', ['created_by'], {
                    name: 'idx_certificates_created_by',
                    transaction,
                    include: ['created_at', 'status'],
                    where: {
                        deleted_at: null
                    }
                }),

                // Idempotency key index with coverage
                queryInterface.addIndex('certificates', ['idempotency_key'], {
                    name: 'idx_certificates_idempotency_key',
                    transaction,
                    include: ['status', 'processed_at'],
                    where: {
                        idempotency_key: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Temporal indexes with sort optimization
                queryInterface.addIndex('certificates', ['created_at'], {
                    name: 'idx_certificates_created_at',
                    transaction,
                    order: 'DESC',
                    where: {
                        deleted_at: null
                    }
                }),

                queryInterface.addIndex('certificates', ['processed_at'], {
                    name: 'idx_certificates_processed_at',
                    transaction,
                    order: 'DESC',
                    where: {
                        processed_at: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Optimized composite index for duplicate checking
                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_duplicate_check 
            ON certificates (policy_number, registration_number, company_code)
            INCLUDE (status, insured_id)
            WHERE status IN ('pending', 'processing', 'completed')
            AND deleted_at IS NULL
        `, { transaction }),

                // Optimized index for retry processing
                queryInterface.sequelize.query(`
            CREATE INDEX idx_certificates_retry_processing 
            ON certificates (status, retry_count, created_at)
            WHERE status IN ('failed', 'pending')
            AND retry_count < 5
            AND deleted_at IS NULL
        `, { transaction })
            ]);
        });

        console.log('✅ Certificates table created with indexes');
    },

    down: async (queryInterface) => {
        await queryInterface.sequelize.transaction(async (transaction) => {
            const indexes = [
                'idx_certificates_reference_number_unique',
                'idx_certificates_ivory_request_number',
                'idx_certificates_certificate_number',
                'idx_certificates_policy_id',
                'idx_certificates_insured_id',
                'idx_certificates_policy_number',
                'idx_certificates_registration_number',
                'idx_certificates_company_code',
                'idx_certificates_agent_code',
                'idx_certificates_status',
                'idx_certificates_created_by',
                'idx_certificates_idempotency_key',
                'idx_certificates_created_at',
                'idx_certificates_processed_at',
                'idx_certificates_duplicate_check',
                'idx_certificates_retry_processing'
            ];

            await Promise.all(
                indexes.map(indexName =>
                    queryInterface.removeIndex('certificates', indexName, { transaction })
                )
            );
        });
    }
};