'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const insuredData = [
            // Individual customers
            {
                id: uuidv4(),
                orass_id: 'INS001',
                first_name: 'Kouame',
                last_name: 'N\'Guessan',
                email: 'kouame.nguessan@gmail.com',
                phone: '+22507123456',
                address: 'Cocody, Riviera Golf, Abidjan',
                profession: 'Ingénieur',
                type: 'individual',
                date_of_birth: '1985-03-15',
                national_id: 'CI85031512345',
                company_registration: null,
                company_code: 'NSIA001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'INS002',
                first_name: 'Awa',
                last_name: 'Diallo',
                email: 'awa.diallo@yahoo.fr',
                phone: '+22505234567',
                address: 'Plateau, Abidjan',
                profession: 'Médecin',
                type: 'individual',
                date_of_birth: '1978-08-22',
                national_id: 'CI78082267890',
                company_registration: null,
                company_code: 'NSIA001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'INS003',
                first_name: 'Mamadou',
                last_name: 'Kone',
                email: 'mamadou.kone@hotmail.com',
                phone: '+22507345678',
                address: 'Marcory Zone 4, Abidjan',
                profession: 'Commerçant',
                type: 'individual',
                date_of_birth: '1982-11-10',
                national_id: 'CI82111034567',
                company_registration: null,
                company_code: 'SONAR001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'INS004',
                first_name: 'Adjoa',
                last_name: 'Mensah',
                email: 'adjoa.mensah@gmail.com',
                phone: '+22505456789',
                address: 'Yopougon, Abidjan',
                profession: 'Enseignante',
                type: 'individual',
                date_of_birth: '1990-05-18',
                national_id: 'CI90051845678',
                company_registration: null,
                company_code: 'SONAR001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },

            // Corporate customers
            {
                id: uuidv4(),
                orass_id: 'INS005',
                first_name: 'Transport',
                last_name: 'Express SARL',
                email: 'contact@transportexpress.ci',
                phone: '+22521567890',
                address: 'Zone Industrielle, Yopougon',
                profession: 'Transport',
                type: 'corporate',
                date_of_birth: null,
                national_id: null,
                company_registration: 'CI-ABJ-2018-B-12345',
                company_code: 'SAHAM001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'INS006',
                first_name: 'Logistics',
                last_name: 'Solutions SA',
                email: 'info@logisolutions.ci',
                phone: '+22521678901',
                address: 'Port Autonome, Abidjan',
                profession: 'Logistique',
                type: 'corporate',
                date_of_birth: null,
                national_id: null,
                company_registration: 'CI-ABJ-2020-B-23456',
                company_code: 'NSIA001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'INS007',
                first_name: 'Taxi',
                last_name: 'Premium SARL',
                email: 'admin@taxipremium.ci',
                phone: '+22507789012',
                address: 'Adjamé, Abidjan',
                profession: 'Transport de personnes',
                type: 'corporate',
                date_of_birth: null,
                national_id: null,
                company_registration: 'CI-ABJ-2019-B-34567',
                company_code: 'SONAR001',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            }
        ];

        await queryInterface.bulkInsert('orass_insured', insuredData);

        console.log('✅ Created sample insured data:');
        console.log('   - 4 individual customers');
        console.log('   - 3 corporate customers');
        console.log('   - Distributed across NSIA, SONAR, and SAHAM');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('orass_insured', {
            orass_id: ['INS001', 'INS002', 'INS003', 'INS004', 'INS005', 'INS006', 'INS007']
        });
    }
};