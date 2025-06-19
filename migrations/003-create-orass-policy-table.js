'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orass_policy', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            orass_id: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
                comment: 'Unique identifier from Orass system',
            },
            policy_number: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
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
            vehicle_registration: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            vehicle_make: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            vehicle_model: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            vehicle_year: {
                type: Sequelize.INTEGER,
                allowNull: true,
                validate: {
                    min: 1900,
                    max: new Date().getFullYear() + 1,
                },
            },
            vehicle_type: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            vehicle_usage: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            vehicle_chassis_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            vehicle_motor_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            subscription_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            effective_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            expiration_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            premium_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                validate: {
                    min: 0,
                },
            },
            currency: {
                type: Sequelize.STRING(3),
                allowNull: false,
                defaultValue: 'XOF',
            },
            status: {
                type: Sequelize.ENUM('active', 'expired', 'cancelled', 'suspended'),
                allowNull: false,
                defaultValue: 'active',
            },
            agent_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            company_code: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            guarantees: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'JSON object containing policy guarantees',
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
                // Unique indexes with filtered null checks
                queryInterface.addIndex('orass_policy', ['orass_id'], {
                    unique: true,
                    name: 'idx_orass_policy_orass_id_unique',
                    transaction,
                    where: {
                        orass_id: { [Sequelize.Op.ne]: null }
                    }
                }),
                queryInterface.addIndex('orass_policy', ['policy_number'], {
                    unique: true,
                    name: 'idx_orass_policy_policy_number_unique',
                    transaction,
                    where: {
                        policy_number: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Foreign key index with included columns
                queryInterface.sequelize.query(`
            CREATE INDEX idx_orass_policy_insured_id 
            ON orass_policy (insured_id)
            INCLUDE (policy_number, status)
            WHERE deleted_at IS NULL
        `, { transaction }),

                // Vehicle registration index with coverage
                queryInterface.addIndex('orass_policy', ['vehicle_registration'], {
                    name: 'idx_orass_policy_vehicle_registration',
                    transaction,
                    include: ['vehicle_make', 'vehicle_model'],
                    where: {
                        vehicle_registration: { [Sequelize.Op.ne]: null }
                    }
                }),

                // Business domain indexes with filters
                queryInterface.addIndex('orass_policy', ['company_code'], {
                    name: 'idx_orass_policy_company_code',
                    transaction,
                    include: ['status'],
                    where: {
                        deleted_at: null
                    }
                }),
                queryInterface.addIndex('orass_policy', ['agent_code'], {
                    name: 'idx_orass_policy_agent_code',
                    transaction,
                    where: {
                        agent_code: { [Sequelize.Op.ne]: null },
                        deleted_at: null
                    }
                }),

                // Status index with effective date coverage
                queryInterface.sequelize.query(`
            CREATE INDEX idx_orass_policy_status 
            ON orass_policy (status, effective_date, expiration_date)
            WHERE status IN ('active', 'pending')
            AND deleted_at IS NULL
        `, { transaction }),

                // Temporal indexes with sort optimization
                queryInterface.addIndex('orass_policy', ['effective_date'], {
                    name: 'idx_orass_policy_effective_date',
                    transaction,
                    order: 'DESC',
                    where: {
                        deleted_at: null
                    }
                }),
                queryInterface.addIndex('orass_policy', ['expiration_date'], {
                    name: 'idx_orass_policy_expiration_date',
                    transaction,
                    order: 'ASC', // Optimized for finding expiring policies
                    where: {
                        deleted_at: null
                    }
                }),

                // Created_at index for reporting
                queryInterface.addIndex('orass_policy', ['created_at'], {
                    name: 'idx_orass_policy_created_at',
                    transaction,
                    order: 'DESC',
                    where: {
                        deleted_at: null
                    }
                }),

                // Composite index for common queries
                queryInterface.sequelize.query(`
            CREATE INDEX idx_orass_policy_company_agent 
            ON orass_policy (company_code, agent_code, status)
            WHERE deleted_at IS NULL
        `, { transaction })
            ]);
        });

        console.log('✅ Orass Policy table created with indexes');
    },

    down: async (queryInterface) => {
        await queryInterface.sequelize.transaction(async (transaction) => {
            const indexes = [
                'idx_orass_policy_orass_id_unique',
                'idx_orass_policy_policy_number_unique',
                'idx_orass_policy_insured_id',
                'idx_orass_policy_vehicle_registration',
                'idx_orass_policy_company_code',
                'idx_orass_policy_agent_code',
                'idx_orass_policy_status',
                'idx_orass_policy_effective_date',
                'idx_orass_policy_expiration_date',
                'idx_orass_policy_created_at',
                'idx_orass_policy_company_agent'
            ];

            await Promise.all(
                indexes.map(indexName =>
                    queryInterface.removeIndex('orass_policy', indexName, { transaction })
                )
            );
        });
    }
};