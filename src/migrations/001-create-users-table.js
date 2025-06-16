'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            first_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM('admin', 'agent', 'company_admin', 'viewer'),
                allowNull: false,
                defaultValue: 'viewer',
            },
            company_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            agent_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            permissions: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: '[]',
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            password_changed_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            failed_login_attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            locked_until: {
                type: Sequelize.DATE,
                allowNull: true,
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
        await queryInterface.addIndex('users', ['email'], { unique: true });
        await queryInterface.addIndex('users', ['role']);
        await queryInterface.addIndex('users', ['company_code']);
        await queryInterface.addIndex('users', ['agent_code']);
        await queryInterface.addIndex('users', ['is_active']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    },
};