'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orass_insured', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            orass_id: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
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
        await queryInterface.addIndex('orass_insured', ['orass_id'], { unique: true });
        await queryInterface.addIndex('orass_insured', ['company_code']);
        await queryInterface.addIndex('orass_insured', ['type']);
        await queryInterface.addIndex('orass_insured', ['email']);
        await queryInterface.addIndex('orass_insured', ['national_id']);
        await queryInterface.addIndex('orass_insured', ['company_registration']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orass_insured');
    },
};