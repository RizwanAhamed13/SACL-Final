const baseUrl = 'http://localhost:8080/api';

let adminToken, hofToken, hodToken;

async function login(employeeId, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
    });
    if (!res.ok) throw new Error(`Login failed for ${employeeId}: ${await res.text()}`);
    const data = await res.json();
    return data;
}

async function request(method, path, token, body) {
    const opts = {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
    };
    if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${baseUrl}${path}`, opts);
    if (!res.ok) throw new Error(`${method} ${path} failed: ${await res.text()}`);
    if (res.status === 204) return null;
    return res.json();
}

async function run() {
    try {
        // ── Step 1: Login as Admin ──
        console.log('\n========== 1. LOGIN AS ADMIN ==========');
        const adminLogin = await login('EMP043', 'Rizwan@25012007');
        adminToken = adminLogin.token;
        console.log('Admin logged in:', adminLogin.user.fullName, '| Role:', adminLogin.user.role);

        // ── Step 2: Create Users with all roles ──
        console.log('\n========== 2. CREATE USERS WITH ALL ROLES ==========');
        const usersToCreate = [
            { fullName: 'QC User One',   username: 'user1', email: 'user1@sacl.com', employeeId: 'U001', role: 'USER',   password: 'password', active: true },
            { fullName: 'QC User Two',   username: 'user2', email: 'user2@sacl.com', employeeId: 'U002', role: 'USER',   password: 'password', active: true },
            { fullName: 'HOF Manager',   username: 'hof1',  email: 'hof1@sacl.com',  employeeId: 'HOF01', role: 'HOF',    password: 'password', active: true },
            { fullName: 'HOD Director',  username: 'hod1',  email: 'hod1@sacl.com',  employeeId: 'HOD01', role: 'HOD',    password: 'password', active: true },
        ];
        for (const u of usersToCreate) {
            try {
                const created = await request('POST', '/users', adminToken, u);
                console.log(`  Created: ${created.fullName} (${created.employeeId}) [${created.role}]`);
            } catch (e) {
                console.log(`  User ${u.username} already exists or error: ${e.message}`);
            }
        }

        // ── Step 3: Login as HOD to create Part Names ──
        console.log('\n========== 3. LOGIN AS HOD & CREATE PART NAMES ==========');
        const hodLogin = await login('HOD01', 'password');
        hodToken = hodLogin.token;
        console.log('HOD logged in:', hodLogin.user.fullName);

        const parts = await Promise.all([
            request('POST', '/part-names', hodToken, { name: 'Engine Block', description: 'Main engine block casting', qcMinC: 3.0, qcMaxC: 4.0 }),
            request('POST', '/part-names', hodToken, { name: 'Cylinder Head', description: 'Top cylinder head cover', qcMinC: 2.0, qcMaxC: 3.0 }),
            request('POST', '/part-names', hodToken, { name: 'Brake Disc', description: 'Front brake disc rotor', qcMinC: 3.2, qcMaxC: 3.8 })
        ]);
        for (const p of parts) {
            console.log(`  Part: ${p.name || p.id || JSON.stringify(p)}`);
        }

        // ── Step 4: Login as USERs & Create QC Register Entries ──
        console.log('\n========== 4. CREATE QC REGISTER ENTRIES (as USERs) ==========');
        const user1Login = await login('U001', 'password');
        const user2Login = await login('U002', 'password');
        const user1Token = user1Login.token;
        const user2Token = user2Login.token;

        // QC entries by User 1
        const qcEntries = [
            { partName: 'Engine Block', heatCode: 'HEAT01A', date: '2026-06-29', compositionC: 3.5, compositionSi: 1.8, compositionMn: 0.5, compositionP: 0.03, compositionS: 0.02, compositionMgFirst: 0.025, compositionMgLast: 0.028, qtyMoulds: 100, timeOfPouringStart: '10:00', timeOfPouringEnd: '10:30', pouringTempStart: 1380, pouringTempEnd: 1350, pTimeSecStart: 12.5, pTimeSecEnd: 14.2, status: 'QC_ENTRY', createdBy: 'QC User One' },
            { partName: 'Cylinder Head', heatCode: 'HEAT01B', date: '2026-06-29', compositionC: 2.5, compositionSi: 2.0, compositionMn: 0.4, compositionP: 0.025, compositionS: 0.015, compositionMgFirst: 0.030, compositionMgLast: 0.032, qtyMoulds: 150, timeOfPouringStart: '11:00', timeOfPouringEnd: '11:45', pouringTempStart: 1400, pouringTempEnd: 1370, pTimeSecStart: 13.0, pTimeSecEnd: 15.1, status: 'QC_ENTRY', createdBy: 'QC User One' },
        ];
        for (const qc of qcEntries) {
            const created = await request('POST', '/qc-register', user1Token, qc);
            console.log(`  QC Entry #${created.id}: ${created.partName} / ${created.heatCode} by ${created.createdBy}`);
        }

        // QC entries by User 2
        const qcEntries2 = [
            { partName: 'Brake Disc', heatCode: 'HEAT02A', date: '2026-06-29', compositionC: 3.5, compositionSi: 1.9, compositionMn: 0.45, compositionP: 0.028, compositionS: 0.018, compositionMgFirst: 0.022, compositionMgLast: 0.024, qtyMoulds: 200, timeOfPouringStart: '09:30', timeOfPouringEnd: '10:15', pouringTempStart: 1390, pouringTempEnd: 1360, pTimeSecStart: 11.0, pTimeSecEnd: 13.5, status: 'QC_ENTRY', createdBy: 'QC User Two' },
            { partName: 'Engine Block', heatCode: 'HEAT02B', date: '2026-06-30', compositionC: 3.6, compositionSi: 1.7, compositionMn: 0.55, compositionP: 0.032, compositionS: 0.022, compositionMgFirst: 0.026, compositionMgLast: 0.029, qtyMoulds: 120, timeOfPouringStart: '14:00', timeOfPouringEnd: '14:40', pouringTempStart: 1370, pouringTempEnd: 1340, pTimeSecStart: 12.0, pTimeSecEnd: 14.8, status: 'QC_ENTRY', createdBy: 'QC User Two' },
        ];
        for (const qc of qcEntries2) {
            const created = await request('POST', '/qc-register', user2Token, qc);
            console.log(`  QC Entry #${created.id}: ${created.partName} / ${created.heatCode} by ${created.createdBy}`);
        }

        // ── Step 5: Create Micro Tensile Test Entries ──
        console.log('\n========== 5. CREATE MICRO TENSILE TEST ENTRIES ==========');
        const tensileEntries = [
            { dateOfInspection: '2026-06-29', item: 'Engine Block', heatCode: 'HEAT01A', dateCode: 'D001', barDiaMm: 10.0, gaugeLengthMm: 50.0, maxLoadKn: 45.2, yieldLoadKn: 38.1, tensileStrength: 575, yieldStrength02: 485, elongationPercent: 12.5, status: 'QC_ENTRY', createdBy: 'QC User One' },
            { dateOfInspection: '2026-06-29', item: 'Cylinder Head', heatCode: 'HEAT01B', dateCode: 'D002', barDiaMm: 8.0, gaugeLengthMm: 40.0, maxLoadKn: 32.8, yieldLoadKn: 27.5, tensileStrength: 520, yieldStrength02: 440, elongationPercent: 15.0, status: 'QC_ENTRY', createdBy: 'QC User One' },
            { dateOfInspection: '2026-06-29', item: 'Brake Disc', heatCode: 'HEAT02A', dateCode: 'D003', barDiaMm: 10.0, gaugeLengthMm: 50.0, maxLoadKn: 48.5, yieldLoadKn: 41.0, tensileStrength: 590, yieldStrength02: 500, elongationPercent: 11.0, status: 'QC_ENTRY', createdBy: 'QC User Two' },
        ];
        for (const t of tensileEntries) {
            const created = await request('POST', '/micro-tensile', user1Token, t);
            console.log(`  Tensile #${created.id}: ${created.item} / ${created.heatCode}`);
        }

        // ── Step 6: Create Micro Structure Analysis Entries ──
        console.log('\n========== 6. CREATE MICRO STRUCTURE ANALYSIS ENTRIES ==========');
        const microEntries = [
            { inspectionDate: '2026-06-29', partName: 'Engine Block', heatCode: 'HEAT01A', dateCode: 'D001', nodularityPercent: 90.0, graphiteType: 'VI', countNosPerMm2: 120.0, size: '6-7', ferritePercent: 65.0, pearlitePercent: 30.0, carbidePercent: 5.0, status: 'QC_ENTRY', createdBy: 'QC User One' },
            { inspectionDate: '2026-06-29', partName: 'Cylinder Head', heatCode: 'HEAT01B', dateCode: 'D002', nodularityPercent: 88.0, graphiteType: 'V/VI', countNosPerMm2: 110.0, size: '7', ferritePercent: 70.0, pearlitePercent: 25.0, carbidePercent: 5.0, status: 'QC_ENTRY', createdBy: 'QC User One' },
        ];
        for (const m of microEntries) {
            const created = await request('POST', '/micro-structure', user1Token, m);
            console.log(`  MicroStructure #${created.id}: ${created.partName} / ${created.heatCode}`);
        }

        // ── Step 7: Create Impact Test Entries ──
        console.log('\n========== 7. CREATE IMPACT TEST ENTRIES ==========');
        const impactEntries = [
            { dateOfInspection: '2026-06-29', partName: 'Engine Block', dateCode: 'D001', specification: 'ISO 1083', testType: 'Charpy', notchType: 'Vnotch', observedValue1: 14.5, observedValue2: 13.8, observedValue3: 15.2, status: 'QC_ENTRY', createdBy: 'QC User One' },
            { dateOfInspection: '2026-06-29', partName: 'Brake Disc', dateCode: 'D003', specification: 'ISO 1083', testType: 'Charpy', notchType: 'Unotch', observedValue1: 18.0, observedValue2: 17.5, observedValue3: 18.5, status: 'QC_ENTRY', createdBy: 'QC User Two' },
        ];
        for (const imp of impactEntries) {
            const created = await request('POST', '/impact-test', user1Token, imp);
            console.log(`  ImpactTest #${created.id}: ${created.partName} / ${created.dateCode}`);
        }

        // ── Step 8: HOF Approval (QC_ENTRY -> HOF_APPROVED) ──
        console.log('\n========== 8. HOF APPROVAL (QC_ENTRY -> HOF_APPROVED) ==========');
        const hofLogin = await login('HOF01', 'password');
        hofToken = hofLogin.token;
        console.log('HOF logged in:', hofLogin.user.fullName);

        // Fetch all QC entries
        let allQcs = await request('GET', '/qc-register', hofToken);
        const qcList = allQcs.content || [];
        for (const qc of qcList) {
            if (qc.status === 'QC_ENTRY') {
                qc.status = 'HOF_APPROVED';
                qc.hofApprovedBy = 'HOF Manager';
                await request('PUT', `/qc-register/${qc.id}`, hofToken, qc);
                console.log(`  QC #${qc.id}: ${qc.partName} approved by HOF ✓`);
            }
        }

        // Also approve tensile, micro-structure, impact-test
        const allTensile = (await request('GET', '/micro-tensile', hofToken)).content || [];
        for (const t of allTensile) {
            if (t.status === 'QC_ENTRY') {
                t.status = 'HOF_APPROVED';
                t.hofApprovedBy = 'HOF Manager';
                await request('PUT', `/micro-tensile/${t.id}`, hofToken, t);
                console.log(`  Tensile #${t.id}: ${t.item} approved by HOF ✓`);
            }
        }

        const allMicro = (await request('GET', '/micro-structure', hofToken)).content || [];
        for (const m of allMicro) {
            if (m.status === 'QC_ENTRY') {
                m.status = 'HOF_APPROVED';
                m.hofApprovedBy = 'HOF Manager';
                await request('PUT', `/micro-structure/${m.id}`, hofToken, m);
                console.log(`  MicroStructure #${m.id}: ${m.partName} approved by HOF ✓`);
            }
        }

        const allImpact = (await request('GET', '/impact-test', hofToken)).content || [];
        for (const imp of allImpact) {
            if (imp.status === 'QC_ENTRY') {
                imp.status = 'HOF_APPROVED';
                imp.hofApprovedBy = 'HOF Manager';
                await request('PUT', `/impact-test/${imp.id}`, hofToken, imp);
                console.log(`  ImpactTest #${imp.id}: ${imp.partName} approved by HOF ✓`);
            }
        }

        // ── Step 9: HOD Approval (HOF_APPROVED -> HOD_APPROVED) ──
        console.log('\n========== 9. HOD APPROVAL (HOF_APPROVED -> HOD_APPROVED) ==========');
        console.log('HOD logged in:', hodLogin.user.fullName);

        const allQcs2 = (await request('GET', '/qc-register', hodToken)).content || [];
        for (const qc of allQcs2) {
            if (qc.status === 'HOF_APPROVED') {
                qc.status = 'HOD_APPROVED';
                qc.hodApprovedBy = 'HOD Director';
                await request('PUT', `/qc-register/${qc.id}`, hodToken, qc);
                console.log(`  QC #${qc.id}: ${qc.partName} approved by HOD ✓`);
            }
        }

        const allTensile2 = (await request('GET', '/micro-tensile', hodToken)).content || [];
        for (const t of allTensile2) {
            if (t.status === 'HOF_APPROVED') {
                t.status = 'HOD_APPROVED';
                t.hodApprovedBy = 'HOD Director';
                await request('PUT', `/micro-tensile/${t.id}`, hodToken, t);
                console.log(`  Tensile #${t.id}: ${t.item} approved by HOD ✓`);
            }
        }

        const allMicro2 = (await request('GET', '/micro-structure', hodToken)).content || [];
        for (const m of allMicro2) {
            if (m.status === 'HOF_APPROVED') {
                m.status = 'HOD_APPROVED';
                m.hodApprovedBy = 'HOD Director';
                await request('PUT', `/micro-structure/${m.id}`, hodToken, m);
                console.log(`  MicroStructure #${m.id}: ${m.partName} approved by HOD ✓`);
            }
        }

        const allImpact2 = (await request('GET', '/impact-test', hodToken)).content || [];
        for (const imp of allImpact2) {
            if (imp.status === 'HOF_APPROVED') {
                imp.status = 'HOD_APPROVED';
                imp.hodApprovedBy = 'HOD Director';
                await request('PUT', `/impact-test/${imp.id}`, hodToken, imp);
                console.log(`  ImpactTest #${imp.id}: ${imp.partName} approved by HOD ✓`);
            }
        }

        // ── Step 10: Generate Report ──
        console.log('\n========== 10. GENERATE REPORT (All Records) ==========');
        const report = await request('GET', '/reports/search', adminToken);
        console.log('\n--- REPORT SUMMARY ---');
        console.log(`Total QC Register entries:      ${report.qcRegister.length}`);
        console.log(`Total Micro Structure entries:  ${report.microStructure.length}`);
        console.log(`Total Micro Tensile entries:    ${report.microTensile.length}`);
        console.log(`Total Impact Test entries:      ${report.impactTest.length}`);

        console.log('\n--- DETAILED QC REGISTER ---');
        for (const r of report.qcRegister) {
            console.log(`  #${r.id} | ${r.partName} | ${r.heatCode || '-'} | Status: ${r.status} | HOF: ${r.hofApprovedBy || '-'} | HOD: ${r.hodApprovedBy || '-'} | Created by: ${r.createdBy}`);
        }

        console.log('\n--- DETAILED MICRO TENSILE ---');
        for (const r of report.microTensile) {
            console.log(`  #${r.id} | ${r.item} | Heat: ${r.heatCode || '-'} | Status: ${r.status} | HOF: ${r.hofApprovedBy || '-'} | HOD: ${r.hodApprovedBy || '-'} | Created by: ${r.createdBy}`);
        }

        console.log('\n--- DETAILED MICRO STRUCTURE ---');
        for (const r of report.microStructure) {
            console.log(`  #${r.id} | ${r.partName} | Heat: ${r.heatCode || '-'} | Status: ${r.status} | HOF: ${r.hofApprovedBy || '-'} | HOD: ${r.hodApprovedBy || '-'} | Created by: ${r.createdBy}`);
        }

        console.log('\n--- DETAILED IMPACT TEST ---');
        for (const r of report.impactTest) {
            console.log(`  #${r.id} | ${r.partName} | Date: ${r.dateCode || '-'} | Status: ${r.status} | HOF: ${r.hofApprovedBy || '-'} | HOD: ${r.hodApprovedBy || '-'} | Created by: ${r.createdBy}`);
        }

        // ── Step 11: Filtered Report ──
        console.log('\n========== 11. FILTERED REPORT (Engine Block only) ==========');
        const filtered = await request('GET', '/reports/search?partName=Engine+Block', adminToken);
        console.log(`QC Register (Engine Block): ${filtered.qcRegister.length} entries`);
        for (const r of filtered.qcRegister) {
            console.log(`  #${r.id} | ${r.partName} | ${r.heatCode} | Status: ${r.status}`);
        }
        console.log(`Micro Structure (Engine Block): ${filtered.microStructure.length} entries`);
        console.log(`Micro Tensile (Engine Block): ${filtered.microTensile.length} entries`);
        console.log(`Impact Test (Engine Block): ${filtered.impactTest.length} entries`);

        console.log('\n========== ✅ DEMO COMPLETED SUCCESSFULLY ==========');
    } catch (err) {
        console.error('ERROR:', err);
    }
}

run();
