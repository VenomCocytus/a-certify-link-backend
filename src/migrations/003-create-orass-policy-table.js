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
                onDelete: 'RESTRICT',
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
                type: Sequelize.JSON,
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

        // Add indexes
        await queryInterface.addIndex('orass_policy', ['orass_id'], {
            unique: true,
            name: 'idx_orass_policy_orass_id_unique'
        });
        await queryInterface.addIndex('orass_policy', ['policy_number'], {
            unique: true,
            name: 'idx_orass_policy_policy_number_unique'
        });
        await queryInterface.addIndex('orass_policy', ['insured_id'], {
            name: 'idx_orass_policy_insured_id'
        });
        await queryInterface.addIndex('orass_policy', ['vehicle_registration'], {
            name: 'idx_orass_policy_vehicle_registration'
        });
        await queryInterface.addIndex('orass_policy', ['company_code'], {
            name: 'idx_orass_policy_company_code'
        });
        await queryInterface.addIndex('orass_policy', ['agent_code'], {
            name: 'idx_orass_policy_agent_code'
        });
        await queryInterface.addIndex('orass_policy', ['status'], {
            name: 'idx_orass_policy_status'
        });
        await queryInterface.addIndex('orass_policy', ['effective_date'], {
            name: 'idx_orass_policy_effective_date'
        });
        await queryInterface.addIndex('orass_policy', ['expiration_date'], {
            name: 'idx_orass_policy_expiration_date'
        });
        await queryInterface.addIndex('orass_policy', ['created_at'], {
            name: 'idx_orass_policy_created_at'
        });

        console.log('✅ Orass Policy table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orass_policy');
        console.log('❌ Orass Policy table dropped');
    }
};