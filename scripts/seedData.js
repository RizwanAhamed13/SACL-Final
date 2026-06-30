const fs = require('fs');

async function seed() {
    const baseUrl = 'http://localhost:8080/api';
    
    async function login(employeeId, password) {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ employeeId, password })
        });
        if (!res.ok) throw new Error(`Login failed for ${employeeId}: ` + await res.text());
        const data = await res.json();
        return data.token;
    }

    async function createUser(token, user) {
        const res = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(user)
        });
        if (!res.ok) {
            const text = await res.text();
            if(text.includes('Duplicate')) return; // ignore duplicates
            throw new Error(`Create user failed for ${user.username}: ` + text);
        }
        return await res.json();
    }
    
    async function createPart(token, part) {
        const res = await fetch(`${baseUrl}/part-names`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(part)
        });
        if (!res.ok) {
            const text = await res.text();
            if(text.includes('already exists')) {
                return part;
            }
            throw new Error(`Create part failed: ` + text);
        }
        return await res.json();
    }
    
    async function createQC(token, qc) {
        const res = await fetch(`${baseUrl}/qc-register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(qc)
        });
        if (!res.ok) throw new Error(`Create QC failed: ` + await res.text());
        return await res.json();
    }

    try {
        console.log('Logging in as admin...');
        const adminToken = await login('EMP043', 'Rizwan@25012007');
        
        console.log('Creating users...');
        const users = [];
        for(let i=1; i<=5; i++) {
            users.push({ fullName: `QC User ${i}`, username: `user${i}`, email: `user${i}@sacl.com`, employeeId: `U00${i}`, role: 'USER', password: 'password', active: true });
        }
        for(let i=1; i<=2; i++) {
            users.push({ fullName: `HOF Manager ${i}`, username: `hof${i}`, email: `hof${i}@sacl.com`, employeeId: `HOF00${i}`, role: 'HOF', password: 'password', active: true });
        }
        for(let i=1; i<=2; i++) {
            users.push({ fullName: `HOD Director ${i}`, username: `hod${i}`, email: `hod${i}@sacl.com`, employeeId: `HOD00${i}`, role: 'HOD', password: 'password', active: true });
        }
        
        for (const u of users) {
            try {
               await createUser(adminToken, u);
               console.log(`Created ${u.username}`);
            } catch(e) {
               console.log(`User ${u.username} might already exist or err: ${e.message}`);
            }
        }
        
        console.log('Logging in as HOD 1...');
        const hodToken = await login('HOD001', 'password');
        
        console.log('Creating parts...');
        let part1 = await createPart(hodToken, { name: 'Engine Block V8', description: 'Main engine block', qcMinC: 3.0, qcMaxC: 4.0 });
        let part2 = await createPart(hodToken, { name: 'Cylinder Head', description: 'Top block cover', qcMinC: 2.0, qcMaxC: 3.0 });
        
        if (!part1.name) part1 = { name: 'Engine Block V8' };
        if (!part2.name) part2 = { name: 'Cylinder Head' };
        
        console.log('Parts created/verified.');
        
        console.log('Creating 10 QC Records...');
        const qcIds = [];
        for(let i=1; i<=5; i++) {
            const userToken = await login(`U00${i}`, 'password');
            const qc1 = await createQC(userToken, { 
                partName: part1.name, 
                heatCode: `HEAT${i}A`, 
                date: '2026-06-29', 
                compositionC: 3.5, 
                qtyMoulds: 100, 
                status: 'QC_ENTRY',
                compositionMgFirst: 0.02,
                compositionMgLast: 0.03,
                timeOfPouringStart: '10:00',
                timeOfPouringEnd: '10:30'
            });
            qcIds.push(qc1.id);
            const qc2 = await createQC(userToken, { 
                partName: part2.name, 
                heatCode: `HEAT${i}B`, 
                date: '2026-06-29', 
                compositionC: 2.5, 
                qtyMoulds: 150, 
                status: 'QC_ENTRY',
                compositionMgFirst: 0.025,
                compositionMgLast: 0.028,
                timeOfPouringStart: '11:00',
                timeOfPouringEnd: '11:45'
            });
            qcIds.push(qc2.id);
            console.log(`User ${i} created QC entries.`);
        }
        
        console.log('Logging in as HOF 1 to approve...');
        const hofToken = await login('HOF001', 'password');
        
        // fetch all QCs
        const res = await fetch(`${baseUrl}/qc-register`, { headers: { 'Authorization': `Bearer ${hofToken}` }});
        const page = await res.json();
        const qcs = page.content || page;
        
        for (const id of qcIds) {
            const qc = qcs.find(q => q.id === id);
            if (qc) {
                qc.status = 'HOF_APPROVED';
                qc.hofApprovedBy = 'HOF Manager 1';
                qc.hofApprovedAt = new Date().toISOString();
                
                await fetch(`${baseUrl}/qc-register/${id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${hofToken}`},
                    body: JSON.stringify(qc)
                });
                console.log(`Approved QC ID: ${id}`);
            }
        }
        
        console.log('Data Seeding Completed Successfully!');
    } catch(err) {
        console.error('Error during seeding:', err);
    }
}

seed();
