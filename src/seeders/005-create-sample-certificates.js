'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Get policy and user data
        const [policies, users] = await Promise.all([
            queryInterface.sequelize.query(
                'SELECT id, orass_id, insured_id, policy_number, registration_number FROM orass_policy WHERE orass_id IN (\'POL001\', \'POL002\', \'POL003\', \'POL004\', \'POL005\')',
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            ),
            queryInterface.sequelize.query(
                'SELECT id, role, company_code FROM users WHERE role IN (\'agent\', \'company_admin\')',
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            )
        ]);

        const policyMap = {};
        policies.forEach(policy => {
            policyMap[policy.orass_id] = policy;
        });

        const agents = users.filter(u => u.role === 'agent');

        const certificates = [
            // Completed certificates
            {
                id: uuidv4(),
                reference_number: 'REF' + Date.now() + 'ABC001',
                ivory_request_number: 'IVR2024001',
                status: 'completed',
                certificate_number: 'ATD1997735444',
                download_url: 'https://eattestation.ivoryattestation.app/#/consulter_attestations?numero=ATD1997735444&demandeur=4123004182192&type=1',
                download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                policy_id: policyMap['POL001'].id,
                insured_id: policyMap['POL001'].insured_id,
                policy_number: policyMap['POL001'].policy_number,
                registration_number: policyMap['POL001'].registration_number,
                company_code: 'NSIA001',
                agent_code: 'AGT001',
                created_by: agents.find(a => a.company_code === 'NSIA001')?.id,
                error_message: null,
                ivory_status_code: 0,
                retry_count: 0,
                last_retry_at: null,
                metadata: JSON.stringify({
                    ivoryRequestNumber: 'IVR2024001',
                    completedAt: new Date().toISOString(),
                    certificateColor: 'JAUN'
                }),
                idempotency_key: null,
                processed_at: new Date(),
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                updated_at: new Date(),
                deleted_at: null
            },
            {
                id: uuidv4(),
                reference_number: 'REF' + (Date.now() + 1000) + 'ABC002',
                ivory_request_number: 'IVR2024002',
                status: 'completed',
                certificate_number: 'ATD1997735445',
                download_url: 'https://eattestation.ivoryattestation.app/#/consulter_attestations?numero=ATD1997735445&demandeur=4123004182192&type=1',
                download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                policy_id: policyMap['POL002'].id,
                insured_id: policyMap['POL002'].insured_id,
                policy_number: policyMap['POL002'].policy_number,
                registration_number: policyMap['POL002'].registration_number,
                company_code: 'NSIA001',
                agent_code: 'AGT002',
                created_by: agents.find(a => a.company_code === 'NSIA001')?.id,
                error_message: null,
                ivory_status_code: 0,
                retry_count: 0,
                last_retry_at: null,
                metadata: JSON.stringify({
                    ivoryRequestNumber: 'IVR2024002',
                    completedAt: new Date().toISOString(),
                    certificateColor: 'JAUN'
                }),
                idempotency_key: null,
                processed_at: new Date(),
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                updated_at: new Date(),
                deleted_at: null
            },

            // Processing certificate
            {
                id: uuidv4(),
                reference_number: 'REF' + (Date.now() + 2000) + 'ABC003',
                ivory_request_number: 'IVR2024003',
                status: 'processing',
                certificate_number: null,
                download_url: null,
                download_expires_at: null,
                policy_id: policyMap['POL003'].id,
                insured_id: policyMap['POL003'].insured_id,
                policy_number: policyMap['POL003'].policy_number,
                registration_number: policyMap['POL003'].registration_number,
                company_code: 'SONAR001',
                agent_code: 'AGT003',
                created_by: agents.find(a => a.company_code === 'SONAR001')?.id,
                error_message: null,
                ivory_status_code: 122,
                retry_count: 0,
                last_retry_at: null,
                metadata: JSON.stringify({
                    ivoryRequestNumber: 'IVR2024003',
                    processingStarted: new Date().toISOString(),
                    certificateColor: 'BRUN'
                }),
                idempotency_key: null,
                processed_at: null,
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                updated_at: new Date(),
                deleted_at: null
            },

            // Pending certificate
            {
                id: uuidv4(),
                reference_number: 'REF' + (Date.now() + 3000) + 'ABC004',
                ivory_request_number: null,
                status: 'pending',
                certificate_number: null,
                download_url: null,
                download_expires_at: null,
                policy_id: policyMap['POL004'].id,
                insured_id: policyMap['POL004'].insured_id,
                policy_number: policyMap['POL004'].policy_number,
                registration_number: policyMap['POL004'].registration_number,
                company_code: 'SONAR001',
                agent_code: 'AGT003',
                created_by: agents.find(a => a.company_code === 'SONAR001')?.id,
                error_message: null,
                ivory_status_code: null,
                retry_count: 0,
                last_retry_at: null,
                metadata: JSON.stringify({
                    originalRequest: {
                        requestedAt: new Date().toISOString()
                    }
                }),
                idempotency_key: 'idem-' + uuidv4(),
                processed_at: null,
                created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                updated_at: new Date(),
                deleted_at: null
            },

            // Failed certificate
            {
                id: uuidv4(),
                reference_number: 'REF' + (Date.now() + 4000) + 'ABC005',
                ivory_request_number: 'IVR2024005',
                status: 'failed',
                certificate_number: null,
                download_url: null,
                download_expires_at: null,
                policy_id: policyMap['POL005'].id,
                insured_id: policyMap['POL005'].insured_id,
                policy_number: policyMap['POL005'].policy_number,
                registration_number: policyMap['POL005'].registration_number,
                company_code: 'SAHAM001',
                agent_code: null,
                created_by: agents[0]?.id, // First available agent
                error_message: 'Invalid vehicle category code',
                ivory_status_code: -26,
                retry_count: 2,
                last_retry_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                metadata: JSON.stringify({
                    ivoryRequestNumber: 'IVR2024005',
                    failedAt: new Date().toISOString(),
                    lastError: 'Invalid vehicle category code',
                    retryHistory: [
                        { attemptAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), error: 'Connection timeout' },
                        { attemptAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), error: 'Invalid vehicle category code' }
                    ]
                }),
                idempotency_key: null,
                processed_at: null,
                created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                updated_at: new Date(),
                deleted_at: null
            }
        ];

        await queryInterface.bulkInsert('certificates', certificates);

        console.log('✅ Created sample certificate data:');
        console.log('   - 2 completed certificates (with download URLs)');
        console.log('   - 1 processing certificate');
        console.log('   - 1 pending certificate');
        console.log('   - 1 failed certificate (with retry history)');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('certificates', {
            reference_number: {
                [queryInterface.sequelize.Op.like]: 'REF%ABC%'
            }
        });
    }
};