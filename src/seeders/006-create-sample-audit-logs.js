'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Get certificates and users for audit logs
        const [certificates, users] = await Promise.all([
            queryInterface.sequelize.query(
                'SELECT id, reference_number, created_by FROM certificates',
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            ),
            queryInterface.sequelize.query(
                'SELECT id, email, role FROM users WHERE role IN (\'agent\', \'company_admin\', \'admin\')',
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            )
        ]);

        if (certificates.length === 0 || users.length === 0) {
            console.log('⚠️ No certificates or users found. Skipping audit log creation.');
            return;
        }

        const auditLogs = [];

        // Create audit logs for each certificate
        certificates.forEach((cert, index) => {
            const createdBy = users.find(u => u.id === cert.created_by) || users[0];
            const baseTime = new Date(Date.now() - (certificates.length - index) * 2 * 60 * 60 * 1000); // Stagger by 2 hours

            // Certificate creation log
            auditLogs.push({
                id: uuidv4(),
                certificate_id: cert.id,
                user_id: createdBy.id,
                action: 'created',
                old_status: null,
                new_status: 'pending',
                old_values: null,
                new_values: JSON.stringify({
                    referenceNumber: cert.reference_number,
                    status: 'pending'
                }),
                details: JSON.stringify({
                    action: 'Certificate creation initiated',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ipAddress: '192.168.1.' + (100 + index)
                }),
                ip_address: '192.168.1.' + (100 + index),
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                session_id: 'sess-' + uuidv4(),
                timestamp: new Date(baseTime.getTime())
            });

            // Status update logs (simulate workflow)
            if (index < 3) { // First 3 certificates have processing logs
                auditLogs.push({
                    id: uuidv4(),
                    certificate_id: cert.id,
                    user_id: createdBy.id,
                    action: 'updated',
                    old_status: 'pending',
                    new_status: 'processing',
                    old_values: JSON.stringify({ status: 'pending' }),
                    new_values: JSON.stringify({ status: 'processing' }),
                    details: JSON.stringify({
                        action: 'Status updated to processing',
                        automaticUpdate: true,
                        ivoryRequestNumber: 'IVR2024' + String(index + 1).padStart(3, '0')
                    }),
                    ip_address: '10.0.0.1', // System IP for automatic updates
                    user_agent: 'System/1.0',
                    session_id: 'system-session',
                    timestamp: new Date(baseTime.getTime() + 30 * 60 * 1000) // 30 minutes later
                });
            }

            // Completion logs for completed certificates
            if (index < 2) {
                auditLogs.push({
                    id: uuidv4(),
                    certificate_id: cert.id,
                    user_id: createdBy.id,
                    action: 'updated',
                    old_status: 'processing',
                    new_status: 'completed',
                    old_values: JSON.stringify({ status: 'processing' }),
                    new_values: JSON.stringify({
                        status: 'completed',
                        certificateNumber: 'ATD199773544' + (4 + index),
                        downloadUrl: 'https://eattestation.ivoryattestation.app/#/consulter_attestations?numero=ATD199773544' + (4 + index)
                    }),
                    details: JSON.stringify({
                        action: 'Certificate generation completed',
                        ivoryStatus: 0,
                        automaticUpdate: true
                    }),
                    ip_address: '10.0.0.1',
                    user_agent: 'System/1.0',
                    session_id: 'system-session',
                    timestamp: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
                });

                // Download logs
                auditLogs.push({
                    id: uuidv4(),
                    certificate_id: cert.id,
                    user_id: createdBy.id,
                    action: 'downloaded',
                    old_status: null,
                    new_status: null,
                    old_values: null,
                    new_values: JSON.stringify({
                        downloadType: 'PDF',
                        downloadTime: new Date().toISOString()
                    }),
                    details: JSON.stringify({
                        action: 'Certificate downloaded',
                        fileType: 'PDF'
                    }),
                    ip_address: '192.168.1.' + (100 + index),
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    session_id: 'sess-' + uuidv4(),
                    timestamp: new Date(baseTime.getTime() + 3 * 60 * 60 * 1000) // 3 hours later
                });
            }

            // Failed certificate logs
            if (index === 4) { // Last certificate failed
                auditLogs.push({
                    id: uuidv4(),
                    certificate_id: cert.id,
                    user_id: createdBy.id,
                    action: 'updated',
                    old_status: 'processing',
                    new_status: 'failed',
                    old_values: JSON.stringify({ status: 'processing' }),
                    new_values: JSON.stringify({
                        status: 'failed',
                        errorMessage: 'Invalid vehicle category code'
                    }),
                    details: JSON.stringify({
                        action: 'Certificate generation failed',
                        ivoryStatus: -26,
                        errorCode: 'INVALID_VEHICLE_CATEGORY',
                        retryCount: 2
                    }),
                    ip_address: '10.0.0.1',
                    user_agent: 'System/1.0',
                    session_id: 'system-session',
                    timestamp: new Date(baseTime.getTime() + 4 * 60 * 60 * 1000) // 4 hours later
                });
            }
        });

        // Add some additional user activity logs
        const additionalLogs = [
            {
                id: uuidv4(),
                certificate_id: certificates[0].id,
                user_id: users.find(u => u.role === 'admin')?.id || users[0].id,
                action: 'status_checked',
                old_status: null,
                new_status: null,
                old_values: null,
                new_values: JSON.stringify({
                    statusCheckResult: 'completed',
                    ivoryStatus: 0
                }),
                details: JSON.stringify({
                    action: 'Admin checked certificate status',
                    checkType: 'manual'
                }),
                ip_address: '192.168.1.50',
                user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                session_id: 'admin-sess-' + uuidv4(),
                timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            }
        ];

        auditLogs.push(...additionalLogs);

        await queryInterface.bulkInsert('certificate_audit_logs', auditLogs);

        console.log('✅ Created sample audit log data:');
        console.log(`   - ${auditLogs.length} audit log entries`);
        console.log('   - Covers complete certificate lifecycle');
        console.log('   - Includes system and user actions');
        console.log('   - Distributed across different time periods');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('certificate_audit_logs', {});
    }
};