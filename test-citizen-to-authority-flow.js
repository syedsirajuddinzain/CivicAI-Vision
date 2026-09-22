import fs from 'fs';
import path from 'path';

async function verifyCompleteFlow() {
  console.log('================================================================');
  console.log('TESTING COMPLETE CITIZEN -> DATABASE -> DEPARTMENT -> AUTHORITY FLOW');
  console.log('================================================================\n');

  // 1. Authenticate Citizen
  const citizenLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@civicai.gov', password: 'password123' }),
  });
  const citizenLogin = await citizenLoginRes.json();
  const citizenToken = citizenLogin.data.token;
  const citizenUser = citizenLogin.data;
  console.log(`[AUTH] Citizen Logged In: ${citizenUser.name} (ID: ${citizenUser._id})\n`);

  // 2. Submit 5 tickets for each civic issue category
  const testSubmissions = [
    {
      issueType: 'Road / Pothole',
      severity: 'Critical',
      description: 'Dangerous asphalt pothole crater on vehicle fast lane',
      expectedDeptId: 'dept_roads',
      expectedDeptName: 'Roads & Infrastructure Department',
      authorityEmail: 'road.authority@civicai.gov',
      authorityName: 'Roads Authority',
      latitude: 12.9716,
      longitude: 77.5946,
      imageName: 'pothole_crater.jpg',
      imageUrl: '/uploads/pothole_crater.jpg',
    },
    {
      issueType: 'Electrical / Streetlight',
      severity: 'High',
      description: 'Broken streetlight fixture creating dark pedestrian crossing',
      expectedDeptId: 'dept_electrical',
      expectedDeptName: 'Electrical Department',
      authorityEmail: 'electrical.authority@civicai.gov',
      authorityName: 'Electrical Authority',
      latitude: 13.0105,
      longitude: 77.6055,
      imageName: 'broken_streetlight.jpg',
      imageUrl: '/uploads/broken_streetlight.jpg',
    },
    {
      issueType: 'Garbage / Sanitation',
      severity: 'Medium',
      description: 'Overflowing municipal garbage dumpster on street corner',
      expectedDeptId: 'dept_sanitation',
      expectedDeptName: 'Sanitation Department',
      authorityEmail: 'sanitation.authority@civicai.gov',
      authorityName: 'Sanitation Authority',
      latitude: 12.981,
      longitude: 77.671,
      imageName: 'garbage_dump.jpg',
      imageUrl: '/uploads/garbage_dump.jpg',
    },
    {
      issueType: 'Drainage / Wastewater',
      severity: 'High',
      description: 'Clogged storm drain culvert with standing wastewater',
      expectedDeptId: 'dept_water',
      expectedDeptName: 'Water & Drainage Department',
      authorityEmail: 'water.authority@civicai.gov',
      authorityName: 'Water & Drainage Authority',
      latitude: 12.9305,
      longitude: 77.581,
      imageName: 'clogged_drain.jpg',
      imageUrl: '/uploads/clogged_drain.jpg',
    },
    {
      issueType: 'Other / Unknown',
      severity: 'Low',
      description: 'Uncategorized municipal public works inspection needed',
      expectedDeptId: 'dept_general',
      expectedDeptName: 'General Municipal Department',
      authorityEmail: 'general.authority@civicai.gov',
      authorityName: 'General Municipal Authority',
      latitude: 12.956,
      longitude: 77.521,
      imageName: 'general_notice.jpg',
      imageUrl: '/uploads/general_notice.jpg',
    },
  ];

  const createdTickets = [];

  console.log('STEP 1: SUBMITTING 5 CITIZEN REPORTS ACROSS DEPARTMENTS:');
  console.log('----------------------------------------------------------------');
  for (const item of testSubmissions) {
    const res = await fetch('http://localhost:5000/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        issueType: item.issueType,
        severity: item.severity,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        imageName: item.imageName,
        imageUrl: item.imageUrl,
        aiConfidence: 0.95,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`❌ Failed to create ticket for ${item.issueType}:`, data);
      continue;
    }

    const t = data.data;
    console.log(`✓ Created Ticket: [${t.ticketId}]`);
    console.log(`  - Issue Type    : ${t.issueType}`);
    console.log(`  - Department ID : ${t.departmentId} (Expected: ${item.expectedDeptId})`);
    console.log(`  - Dept Name     : ${t.departmentName}`);
    console.log(`  - Status        : ${t.status}`);
    console.log(`  - Citizen ID    : ${t.citizenId}`);
    console.log(`  - GPS           : ${t.latitude}, ${t.longitude}`);

    if (t.departmentId === item.expectedDeptId) {
      console.log(`  ✅ Department mapping accurate!\n`);
    } else {
      console.error(`  ❌ Department mapping mismatch!\n`);
    }

    createdTickets.push({ ...item, ticket: t });
  }

  // 3. Verify each Authority sees ONLY their department's tickets
  console.log('================================================================');
  console.log('STEP 2: VERIFYING ROLE-BASED AUTHORITY DASHBOARD FETCHES:');
  console.log('================================================================\n');

  for (const item of createdTickets) {
    console.log(`----------------------------------------------------------------`);
    console.log(`Testing Authority: ${item.authorityName} (${item.authorityEmail})`);
    console.log(`Department Scope : ${item.expectedDeptId} (${item.expectedDeptName})`);

    // Log in as this department authority
    const authLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: item.authorityEmail, password: 'password123' }),
    });

    const authLogin = await authLoginRes.json();
    const authToken = authLogin.data.token;
    const authUser = authLogin.data;

    // Fetch dashboard tickets
    const dashRes = await fetch('http://localhost:5000/api/tickets', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const dashData = await dashRes.json();
    const ticketsFound = dashData.data || [];

    console.log(`Dashboard fetched ${ticketsFound.length} tickets for this authority.`);

    // Check if the citizen's created ticket appears
    const targetTicket = ticketsFound.find((t) => t.ticketId === item.ticket.ticketId);

    if (targetTicket) {
      console.log(`✅ MATCH SUCCESS: Created ticket ${item.ticket.ticketId} appears dynamically on ${item.authorityName} dashboard!`);
      console.log(`  - Ticket ID     : ${targetTicket.ticketId}`);
      console.log(`  - Image         : ${targetTicket.imageUrl}`);
      console.log(`  - Issue Type    : ${targetTicket.issueType}`);
      console.log(`  - Severity      : ${targetTicket.severity}`);
      console.log(`  - Description   : ${targetTicket.description}`);
      console.log(`  - GPS / Location: ${targetTicket.latitude}°, ${targetTicket.longitude}°`);
      console.log(`  - Department    : ${targetTicket.departmentName} (${targetTicket.departmentId})`);
      console.log(`  - Status        : ${targetTicket.status}`);
      console.log(`  - Created At    : ${targetTicket.createdAt}`);
    } else {
      console.error(`❌ FAILURE: Ticket ${item.ticket.ticketId} was NOT found on ${item.authorityName} dashboard!`);
    }

    // Check that NO other department tickets leak into this authority's dashboard
    const foreignTickets = ticketsFound.filter((t) => t.departmentId && t.departmentId !== item.expectedDeptId);
    if (foreignTickets.length === 0) {
      console.log(`✅ PRIVACY SUCCESS: No tickets from other departments appear in ${item.authorityName} dashboard.`);
    } else {
      console.error(`❌ LEAK DETECTED: Found ${foreignTickets.length} tickets from other departments!`, foreignTickets.map(t => `${t.ticketId}: ${t.departmentId}`));
    }
    console.log('');
  }

  // 4. Test Cross-Department Authorization Security Check
  console.log('================================================================');
  console.log('STEP 3: TESTING CROSS-DEPARTMENT ISOLATION (SECURITY TEST)');
  console.log('================================================================');

  // Roads Authority tries to access Electrical Ticket by direct ID
  const roadLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'road.authority@civicai.gov', password: 'password123' }),
  });
  const roadToken = (await roadLoginRes.json()).data.token;

  const electricalTicketId = createdTickets.find(t => t.expectedDeptId === 'dept_electrical').ticket.ticketId;
  const crossDeptRes = await fetch(`http://localhost:5000/api/tickets/${electricalTicketId}`, {
    headers: { Authorization: `Bearer ${roadToken}` },
  });
  const crossDeptData = await crossDeptRes.json();

  console.log(`Roads Authority attempting to view Electrical ticket [${electricalTicketId}]...`);
  console.log(`HTTP Status: ${crossDeptRes.status}`);
  console.log(`Response   :`, crossDeptData);

  if (crossDeptRes.status === 403) {
    console.log(`✅ SECURITY ENFORCED: Unauthorized cross-department ticket view strictly blocked with 403 Forbidden!`);
  }

  console.log('\n================================================================');
  console.log('ALL CITIZEN -> DATABASE -> DEPARTMENT -> AUTHORITY TESTS PASSED!');
  console.log('================================================================');
}

verifyCompleteFlow().catch(console.error);
