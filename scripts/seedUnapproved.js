const baseUrl = 'http://localhost:8080/api';

async function login(employeeId, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({employeeId, password})
    });
    if (!res.ok) throw new Error(`Login failed for ${employeeId}: ` + await res.text());
    const data = await res.json();
    return data.token;
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

async function fetchParts(token) {
    const res = await fetch(`${baseUrl}/part-names`, {
        headers: {'Authorization': `Bearer ${token}`}
    });
    const page = await res.json();
    return page.content || page;
}

async function run() {
    try {
        console.log("Logging in as U001...");
        const token = await login('U001', 'password');
        
        console.log("Fetching parts...");
        const parts = await fetchParts(token);
        if (parts.length === 0) throw new Error("No parts found. Seed parts first.");
        const partName = parts[0].name;

        console.log(`Creating 5 unapproved QC entries for part: ${partName}...`);
        for (let j = 0; j < 5; j++) {
            const mgVal = (0.015 + Math.random() * 0.035).toFixed(3);
            await createQC(token, {
                partName: partName,
                date: new Date().toISOString().split('T')[0],
                shift: j % 2 === 0 ? "Shift 1" : "Shift 2",
                dateCode: `D${Math.floor(Math.random() * 1000)}`,
                carbon: (3.0 + Math.random() * 1.5).toFixed(2),
                silicon: (1.5 + Math.random() * 1.5).toFixed(2),
                manganese: (0.4 + Math.random() * 0.4).toFixed(2),
                phosphorus: (0.01 + Math.random() * 0.09).toFixed(3),
                sulphur: (0.01 + Math.random() * 0.09).toFixed(3),
                chromium: (0.01 + Math.random() * 0.09).toFixed(2),
                molybdenum: (0.01 + Math.random() * 0.09).toFixed(2),
                nickel: (0.01 + Math.random() * 0.09).toFixed(2),
                copper: (0.01 + Math.random() * 0.09).toFixed(2),
                magnesium: mgVal,
                magnesiumLast: (parseFloat(mgVal) - 0.005).toFixed(3), // slightly lower for Mg Last
                pouringTempStart: (1350 + Math.random() * 50).toFixed(0),
                pouringTempEnd: (1300 + Math.random() * 50).toFixed(0),
                pTimeSecStart: (10 + Math.random() * 5).toFixed(1),
                pTimeSecEnd: (12 + Math.random() * 5).toFixed(1),
                status: "QC_ENTRY",
                createdBy: "User 1"
            });
        }
        console.log("5 unapproved QC entries created successfully!");
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
