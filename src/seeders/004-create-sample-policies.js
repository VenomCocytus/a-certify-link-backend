'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // First, get the insured IDs from the database
        const insuredRecords = await queryInterface.sequelize.query(
            'SELECT id, orass_id FROM orass_insured WHERE orass_id IN (\'INS001\', \'INS002\', \'INS003\', \'INS004\', \'INS005\', \'INS006\', \'INS007\')',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const insuredMap = {};
        insuredRecords.forEach(record => {
            insuredMap[record.orass_id] = record.id;
        });

        const currentDate = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);

        const policies = [
            // Individual vehicle policies
            {
                id: uuidv4(),
                orass_id: 'POL001',
                policy_number: 'NSIA-AUTO-2024-001',
                insured_id: insuredMap['INS001'],
                vehicle_registration: 'AB1234CD',
                vehicle_make: 'Toyota',
                vehicle_model: 'Corolla',
                vehicle_year: 2020,
                vehicle_type: 'passenger_car',
                vehicle_usage: 'personal',
                vehicle_chassis_number: 'JT2AE91A5M0123456',
                vehicle_motor_number: '1NZ-FE789012',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 285000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT001',
                company_code: 'NSIA001',
                guarantees: JSON.stringify({
                    rc: 10000000,
                    vol: 5000000,
                    incendie: 3000000,
                    bris_glaces: 150000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'POL002',
                policy_number: 'NSIA-AUTO-2024-002',
                insured_id: insuredMap['INS002'],
                vehicle_registration: 'EF5678GH',
                vehicle_make: 'Nissan',
                vehicle_model: 'Sentra',
                vehicle_year: 2019,
                vehicle_type: 'passenger_car',
                vehicle_usage: 'personal',
                vehicle_chassis_number: '3N1AB7AP5KY123456',
                vehicle_motor_number: 'HR16DE456789',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 245000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT002',
                company_code: 'NSIA001',
                guarantees: JSON.stringify({
                    rc: 10000000,
                    vol: 4500000,
                    incendie: 2500000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'POL003',
                policy_number: 'SONAR-AUTO-2024-001',
                insured_id: insuredMap['INS003'],
                vehicle_registration: 'IJ9012KL',
                vehicle_make: 'Hyundai',
                vehicle_model: 'Accent',
                vehicle_year: 2021,
                vehicle_type: 'passenger_car',
                vehicle_usage: 'commercial',
                vehicle_chassis_number: 'KMHC281ABMA123456',
                vehicle_motor_number: 'G4LC789012',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 320000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT003',
                company_code: 'SONAR001',
                guarantees: JSON.stringify({
                    rc: 15000000,
                    vol: 6000000,
                    incendie: 4000000,
                    bris_glaces: 200000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'POL004',
                policy_number: 'SONAR-AUTO-2024-002',
                insured_id: insuredMap['INS004'],
                vehicle_registration: 'MN3456OP',
                vehicle_make: 'Kia',
                vehicle_model: 'Picanto',
                vehicle_year: 2022,
                vehicle_type: 'passenger_car',
                vehicle_usage: 'personal',
                vehicle_chassis_number: 'KNAPA811DMK123456',
                vehicle_motor_number: 'G3LA345678',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 195000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT003',
                company_code: 'SONAR001',
                guarantees: JSON.stringify({
                    rc: 10000000,
                    vol: 3500000,
                    incendie: 2000000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },

            // Commercial vehicle policies
            {
                id: uuidv4(),
                orass_id: 'POL005',
                policy_number: 'SAHAM-FLEET-2024-001',
                insured_id: insuredMap['INS005'],
                vehicle_registration: 'QR7890ST',
                vehicle_make: 'Mercedes',
                vehicle_model: 'Sprinter',
                vehicle_year: 2020,
                vehicle_type: 'commercial_vehicle',
                vehicle_usage: 'commercial',
                vehicle_chassis_number: 'WD3PE7CC5LP123456',
                vehicle_motor_number: 'OM651LA987654',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 450000,
                currency: 'XOF',
                status: 'active',
                agent_code: null,
                company_code: 'SAHAM001',
                guarantees: JSON.stringify({
                    rc: 25000000,
                    vol: 8000000,
                    incendie: 6000000,
                    bris_glaces: 300000,
                    assistance: 500000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'POL006',
                policy_number: 'NSIA-FLEET-2024-001',
                insured_id: insuredMap['INS006'],
                vehicle_registration: 'UV1234WX',
                vehicle_make: 'Isuzu',
                vehicle_model: 'NPR',
                vehicle_year: 2021,
                vehicle_type: 'truck',
                vehicle_usage: 'commercial',
                vehicle_chassis_number: 'JALC4B16517123456',
                vehicle_motor_number: '4HK1TC456789',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 680000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT001',
                company_code: 'NSIA001',
                guarantees: JSON.stringify({
                    rc: 30000000,
                    vol: 12000000,
                    incendie: 8000000,
                    assistance: 750000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                orass_id: 'POL007',
                policy_number: 'SONAR-TAXI-2024-001',
                insured_id: insuredMap['INS007'],
                vehicle_registration: 'YZ5678AB',
                vehicle_make: 'Toyota',
                vehicle_model: 'Yaris',
                vehicle_year: 2019,
                vehicle_type: 'taxi',
                vehicle_usage: 'taxi',
                vehicle_chassis_number: 'NCP91L-AHPNKA123456',
                vehicle_motor_number: '2NZ-FE234567',
                subscription_date: currentDate,
                effective_date: currentDate,
                expiration_date: oneYearFromNow,
                premium_amount: 380000,
                currency: 'XOF',
                status: 'active',
                agent_code: 'AGT003',
                company_code: 'SONAR001',
                guarantees: JSON.stringify({
                    rc: 20000000,
                    vol: 4000000,
                    incendie: 3000000,
                    conducteur: 1000000
                }),
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            }
        ];

        await queryInterface.bulkInsert('orass_policy', policies);

        console.log('✅ Created sample policy data:');
        console.log('   - 4 individual vehicle policies');
        console.log('   - 3 commercial vehicle policies');
        console.log('   - Mixed vehicle types: cars, trucks, taxi');
        console.log('   - All policies active for 1 year');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('orass_policy', {
            orass_id: ['POL001', 'POL002', 'POL003', 'POL004', 'POL005', 'POL006', 'POL007']
        });
    }
};