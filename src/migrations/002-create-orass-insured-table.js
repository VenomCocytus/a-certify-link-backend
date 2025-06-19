'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orass_insured', {
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
            first_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            profession: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            type: {
                type: Sequelize.ENUM('individual', 'corporate'),
                allowNull: false,
                defaultValue: 'individual',
            },
            date_of_birth: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            national_id: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            company_registration: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            company_code: {
                type: Sequelize.STRING(20),
                allowNull: false,
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
        await queryInterface.addIndex('orass_insured', ['orass_id'], {
            unique: true,
            name: 'idx_orass_insured_orass_id_unique'
        });
        await queryInterface.addIndex('orass_insured', ['company_code'], {
            name: 'idx_orass_insured_company_code'
        });
        await queryInterface.addIndex('orass_insured', ['type'], {
            name: 'idx_orass_insured_type'
        });
        await queryInterface.addIndex('orass_insured', ['email'], {
            name: 'idx_orass_insured_email'
        });
        await queryInterface.addIndex('orass_insured', ['national_id'], {
            name: 'idx_orass_insured_national_id'
        });
        await queryInterface.addIndex('orass_insured', ['company_registration'], {
            name: 'idx_orass_insured_company_registration'
        });
        await queryInterface.addIndex('orass_insured', ['created_at'], {
            name: 'idx_orass_insured_created_at'
        });

        console.log('✅ Orass Insured table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orass_insured');
        console.log('❌ Orass Insured table dropped');
    }
};