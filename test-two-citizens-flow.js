import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTwoCitizenTest() {
  console.log('===============================================================');
  console.log('CITIZEN MY REPORTS DATA FLOW & ISOLATION VERIFICATION');
  console.log('===============================================================\n');

  try {
    const timestamp = Date.now();
    const emailA = `citizen_a_${timestamp}@civicai.gov`;
    const emailB = `citizen_b_${timestamp}@civicai.gov`;

    // -------------------------------------------------------------
    // PHASE 1: CITIZEN A REGISTRATION & REPORT SUBMISSION
    // -------------------------------------------------------------
    console.log('[PHASE 1] Register Citizen A');
    const regA = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Aarav Sharma (Citizen A)',
        email: emailA,
        password: 'Password123!',
        role: 'citizen',
      }),
    });
    assert(regA.status === 201 && regA.json.data?.token, 'Citizen A registered successfully');
    const tokenA = regA.json.data.token;
    const userAId = regA.json.data._id || regA.json.data.id;

    // Verify /api/auth/me returns Citizen A
    console.log('[PHASE 1] Verify /api/auth/me with Citizen A Token');
    const meA = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(meA.status === 200 && String(meA.json.data._id) === String(userAId), `req.user._id matches Citizen A ID: ${userAId}`);

    // Citizen A submits Pothole report
    console.log('[PHASE 1] Citizen A Submits Pothole Report');
    const reportA = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        issueType: 'Pothole / Road Damage',
        description: 'Large deep crater pothole near Trinity Circle.',
        severity: 'High',
        aiConfidence: 0.95,
        latitude: 12.9756,
        longitude: 77.6066,
        imageUrl: '/uploads/pothole_a.jpg',
      }),
    });
    assert(reportA.status === 201, `Ticket A created with status ${reportA.status}`);
    const ticketA = reportA.json.data;
    const ticketAId = ticketA.ticketId;
    assert(String(ticketA.citizenId) === String(userAId), `Ticket A citizenId (${ticketA.citizenId}) EQUALS Citizen A user ID (${userAId})`);

    // Citizen A checks My Reports
    console.log('[PHASE 1] Citizen A Fetches GET /api/tickets/my');
    const myReportsA1 = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(myReportsA1.status === 200, 'GET /api/tickets/my returned 200');
    assert(myReportsA1.json.data.length === 1, `Citizen A sees exactly 1 report (got ${myReportsA1.json.data.length})`);
    assert(myReportsA1.json.data[0].ticketId === ticketAId, `Citizen A sees Pothole report ${ticketAId}`);

    // -------------------------------------------------------------
    // PHASE 2: CITIZEN B REGISTRATION & ISOLATION CHECK
    // -------------------------------------------------------------
    console.log('\n[PHASE 2] Register Citizen B');
    const regB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bhavna Patel (Citizen B)',
        email: emailB,
        password: 'Password123!',
        role: 'citizen',
      }),
    });
    assert(regB.status === 201 && regB.json.data?.token, 'Citizen B registered successfully');
    const tokenB = regB.json.data.token;
    const userBId = regB.json.data._id || regB.json.data.id;

    // Verify /api/auth/me returns Citizen B
    console.log('[PHASE 2] Verify /api/auth/me with Citizen B Token');
    const meB = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(meB.status === 200 && String(meB.json.data._id) === String(userBId), `req.user._id matches Citizen B ID: ${userBId}`);

    // Citizen B checks My Reports BEFORE submitting anything
    console.log('[PHASE 2] Citizen B Fetches GET /api/tickets/my (Initially Empty)');
    const myReportsB1 = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(myReportsB1.status === 200, 'GET /api/tickets/my returned 200 for Citizen B');
    assert(myReportsB1.json.data.length === 0, `Citizen B sees EMPTY reports array [] (got ${myReportsB1.json.data.length})`);
    assert(!myReportsB1.json.data.some(t => t.ticketId === ticketAId), 'Citizen A report is NOT present in Citizen B My Reports');

    // Citizen B attempts direct access to Citizen A's ticket
    console.log('[PHASE 2] Citizen B Direct Access to Citizen A Ticket (GET /api/tickets/:id)');
    const directAccessB = await request(`/tickets/${ticketAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(directAccessB.status === 403, `Citizen B direct access to Citizen A ticket is FORBIDDEN (403 got ${directAccessB.status})`);

    // Citizen B submits Garbage / Solid Waste report
    console.log('[PHASE 2] Citizen B Submits Garbage Report');
    const reportB = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        issueType: 'Garbage / Solid Waste Dump',
        description: 'Overflowing dumpster blocking pedestrian footpath.',
        severity: 'Medium',
        aiConfidence: 0.91,
        latitude: 12.981,
        longitude: 77.671,
        imageUrl: '/uploads/garbage_b.jpg',
      }),
    });
    assert(reportB.status === 201, `Ticket B created with status ${reportB.status}`);
    const ticketB = reportB.json.data;
    const ticketBId = ticketB.ticketId;
    assert(String(ticketB.citizenId) === String(userBId), `Ticket B citizenId (${ticketB.citizenId}) EQUALS Citizen B user ID (${userBId})`);

    // Citizen B checks My Reports AFTER submitting
    console.log('[PHASE 2] Citizen B Fetches GET /api/tickets/my (Contains Only Ticket B)');
    const myReportsB2 = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(myReportsB2.json.data.length === 1, `Citizen B sees exactly 1 report (got ${myReportsB2.json.data.length})`);
    assert(myReportsB2.json.data[0].ticketId === ticketBId, `Citizen B sees ONLY Garbage report ${ticketBId}`);
    assert(!myReportsB2.json.data.some(t => t.ticketId === ticketAId), 'Citizen A Pothole report is STILL NOT present in Citizen B My Reports');

    // -------------------------------------------------------------
    // PHASE 3: CITIZEN A LOGS IN AGAIN & CHECKS MY REPORTS
    // -------------------------------------------------------------
    console.log('\n[PHASE 3] Re-login as Citizen A');
    const loginA = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailA,
        password: 'Password123!',
      }),
    });
    assert(loginA.status === 200 && loginA.json.data?.token, 'Citizen A logged in successfully');
    const freshTokenA = loginA.json.data.token;

    console.log('[PHASE 3] Citizen A Fetches GET /api/tickets/my (Contains Only Ticket A)');
    const myReportsA2 = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${freshTokenA}` },
    });
    assert(myReportsA2.json.data.length === 1, `Citizen A sees exactly 1 report (got ${myReportsA2.json.data.length})`);
    assert(myReportsA2.json.data[0].ticketId === ticketAId, `Citizen A sees ONLY Pothole report ${ticketAId}`);
    assert(!myReportsA2.json.data.some(t => t.ticketId === ticketBId), 'Citizen B Garbage report is NOT present in Citizen A My Reports');

    // Citizen A attempts direct access to Citizen B's ticket
    console.log('[PHASE 3] Citizen A Direct Access to Citizen B Ticket (GET /api/tickets/:id)');
    const directAccessA = await request(`/tickets/${ticketBId}`, {
      headers: { Authorization: `Bearer ${freshTokenA}` },
    });
    assert(directAccessA.status === 403, `Citizen A direct access to Citizen B ticket is FORBIDDEN (403 got ${directAccessA.status})`);

    console.log('\n===============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during two-citizen test:', err);
    process.exit(1);
  }
}

runTwoCitizenTest();
