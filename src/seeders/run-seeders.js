'use strict';

const path = require('path');
const { execSync } = require('child_process');

/**
 * Run all seeders in order
 */
async function runSeeders() {
    const seeders = [
        '001-create-admin-user.js',
        '002-create-sample-companies.js',
        '003-create-sample-insured.js',
        '004-create-sample-policies.js',
        '005-create-sample-certificates.js',
        '006-create-sample-audit-logs.js',
        '007-create-idempotency-keys.js'
    ];

    console.log('🌱 Starting database seeding...\n');

    for (const seeder of seeders) {
        try {
            console.log(`▶️ Running seeder: ${seeder}`);
            execSync(`npx sequelize-cli db:seed --seed ${seeder}`, {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log(`✅ Completed: ${seeder}\n`);
        } catch (error) {
            console.error(`❌ Failed to run seeder ${seeder}:`, error.message);
            process.exit(1);
        }
    }

    console.log('🎉 All seeders completed successfully!');
    console.log('\n📋 Summary of created data:');
    console.log('   👤 Users: 1 admin + 6 company users');
    console.log('   🏢 Companies: NSIA, SONAR, SAHAM');
    console.log('   👥 Insured: 4 individuals + 3 corporate');
    console.log('   📄 Policies: 7 active policies');
    console.log('   🎫 Certificates: 5 certificates (various states)');
    console.log('   📊 Audit Logs: Complete audit trail');
    console.log('   🔑 Idempotency Keys: 5 sample keys');
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@digitalcertificates.com / Admin@123456');
    console.log('   Companies: *@nsia.ci, *@sonar.ci, *@saham.ci / Company@123');
}

if (require.main === module) {
    runSeeders().catch(console.error);
}

module.exports = { runSeeders };