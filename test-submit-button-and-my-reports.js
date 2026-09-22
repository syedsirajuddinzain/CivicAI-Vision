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

async function runSubmitTest() {
  console.log('===============================================================');
  console.log('CITIZEN SUBMIT REPORT & MY REPORTS REAL-TIME VERIFICATION');
  console.log('===============================================================\n');

  try {
    const timestamp = Date.now();
    const citizenA_email = `citizen_live_${timestamp}@civicai.gov`;

    // 1. Citizen A registers & logs in
    console.log('[STEP 1] Citizen A registers');
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Zain Citizen',
        email: citizenA_email,
        password: 'Password123!',
        role: 'citizen',
      }),
    });
    assert(regRes.status === 201 && regRes.json.data?.token, 'Citizen A registered');
    const tokenA = regRes.json.data.token;
    const userA_id = regRes.json.data._id;

    // 2. Check My Reports initially (must be empty)
    console.log('[STEP 2] Check My Reports before submitting');
    const myReportsBefore = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(myReportsBefore.status === 200, 'GET /api/tickets/my returned 200');
    assert(myReportsBefore.json.data.length === 0, `Initial reports count is 0 (got ${myReportsBefore.json.data.length})`);

    // 3. Citizen submits report with real base64 canvas compressed image (Simulating PhotoUploader)
    console.log('[STEP 3] Citizen clicks Submit Report with base64 evidence photo');
    // Real 1x1 base64 transparent PNG to test saveImageFile buffer writing
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const submitRes = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        issueType: 'Pothole / Road Damage',
        severity: 'High',
        aiConfidence: 0.96,
        description: 'Large pothole on 100ft road near Indiranagar KFC junction.',
        latitude: 12.9716,
        longitude: 77.5946,
        ward: 'Ward 101 — Central Business District',
        department: 'Roads & Infrastructure Department',
        image: {
          previewUrl: sampleBase64,
          name: 'pothole_evidence.png',
        },
      }),
    });
    assert(submitRes.status === 201, `Submit Report succeeded with HTTP 201 (got ${submitRes.status})`);
    const createdTicket = submitRes.json.data;
    assert(createdTicket?.ticketId !== undefined, `Received Ticket ID: ${createdTicket?.ticketId}`);
    assert(String(createdTicket.citizenId) === String(userA_id), `Ticket citizenId matches logged-in Citizen A: ${createdTicket.citizenId}`);
    assert(createdTicket.imageUrl && createdTicket.imageUrl.startsWith('/uploads/'), `Evidence photo safely saved to: ${createdTicket.imageUrl}`);

    // 4. Check My Reports immediately after submitting
    console.log('[STEP 4] Fetch My Reports immediately after submission');
    const myReportsAfter = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(myReportsAfter.status === 200, 'GET /api/tickets/my returned 200');
    assert(myReportsAfter.json.data.length === 1, `My Reports now contains exactly 1 report (got ${myReportsAfter.json.data.length})`);
    assert(myReportsAfter.json.data[0].ticketId === createdTicket.ticketId, `Report in list matches submitted ticket ID: ${myReportsAfter.json.data[0].ticketId}`);
    assert(myReportsAfter.json.data[0].imageUrl === createdTicket.imageUrl, `Report in list contains correct photo URL: ${myReportsAfter.json.data[0].imageUrl}`);

    // 5. Submit a SECOND report for Citizen A
    console.log('\n[STEP 5] Citizen A submits a second report (Streetlight Issue)');
    const submitRes2 = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        issueType: 'Streetlight / Electrical Issue',
        severity: 'Medium',
        aiConfidence: 0.92,
        description: 'Streetlight flickering and sparked during rain.',
        latitude: 13.01,
        longitude: 77.605,
        ward: 'Ward 102 — Indiranagar Civic Zone',
        department: 'Electrical Department',
        image: {
          previewUrl: sampleBase64,
          name: 'lamp_evidence.png',
        },
      }),
    });
    assert(submitRes2.status === 201, `Second report submitted with status 201`);
    const ticket2 = submitRes2.json.data;

    const myReportsAfter2 = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(myReportsAfter2.json.data.length === 2, `My Reports contains 2 reports (got ${myReportsAfter2.json.data.length})`);
    assert(myReportsAfter2.json.data[0].ticketId === ticket2.ticketId, `Newest report is first in list: ${myReportsAfter2.json.data[0].ticketId}`);

    // 6. Citizen B logs in and verifies total isolation
    console.log('\n[STEP 6] Citizen B logs in & verifies empty My Reports');
    const citizenB_email = `citizen_b_${timestamp}@civicai.gov`;
    const regResB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Priya Sharma',
        email: citizenB_email,
        password: 'Password123!',
        role: 'citizen',
      }),
    });
    const tokenB = regResB.json.data.token;

    const myReportsB = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(myReportsB.json.data.length === 0, `Citizen B sees 0 reports in My Reports (got ${myReportsB.json.data.length})`);

    console.log('\n===============================================================');
    console.log(`TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during submit test:', err);
    process.exit(1);
  }
}

runSubmitTest();
