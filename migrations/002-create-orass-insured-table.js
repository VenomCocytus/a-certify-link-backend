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
        // Add indexes with SQL Server optimized syntax
        await queryInterface.sequelize.transaction(async (transaction) => {
            // Unique index for orass_id
            await queryInterface.addIndex('orass_insured', ['orass_id'], {
                unique: true,
                name: 'idx_orass_insured_orass_id_unique',
                transaction,
                where: {
                    deleted_at: null // Filter out soft-deleted records for better performance
                }
            });

            // Standard indexes with included columns for covering queries
            const indexes = [
                {
                    fields: ['company_code'],
                    name: 'idx_orass_insured_company_code',
                    include: ['type', 'is_active'] // Frequently accessed columns
                },
                {
                    fields: ['type'],
                    name: 'idx_orass_insured_type',
                    where: {
                        is_active: true // Filter only active records
                    }
                },
                {
                    fields: ['email'],
                    name: 'idx_orass_insured_email',
                    unique: true,
                    where: {
                        email: { [Sequelize.Op.ne]: null } // Only index non-null emails
                    }
                },
                {
                    fields: ['national_id'],
                    name: 'idx_orass_insured_national_id',
                    where: {
                        type: 'individual' // Only relevant for individuals
                    }
                },
                {
                    fields: ['company_registration'],
                    name: 'idx_orass_insured_company_registration',
                    where: {
                        type: 'company' // Only relevant for companies
                    }
                },
                {
                    fields: ['created_at'],
                    name: 'idx_orass_insured_created_at',
                    using: 'BTREE', // Explicit index type
                    order: 'DESC' // Optimized for recent records
                }
            ];

            // Create indexes in parallel for better performance
            await Promise.all(
                indexes.map(index =>
                    queryInterface.addIndex('orass_insured', index.fields, {
                        ...index,
                        transaction
                    })
                )
            );

            // Add filtered index for soft delete pattern
            await queryInterface.sequelize.query(`
                CREATE INDEX idx_orass_insured_active ON orass_insured (is_active)
                WHERE deleted_at IS NULL
            `, { transaction });
        });

        console.log('✅ Orass Insured table created with indexes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orass_insured');
        console.log('❌ Orass Insured table dropped');
    }
};