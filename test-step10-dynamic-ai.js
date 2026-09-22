import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5056;

async function runTests() {
  console.log('====================================================');
  console.log('STEP 10 DYNAMIC AI & DATABASE VERIFICATION');
  console.log('====================================================');

  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`[TEST SERVER] Running on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. Test AI endpoint when credentials are not set
    console.log('\n--- 1. Testing AI Endpoint Without Credentials ---');
    // Ensure keys are empty for this test
    const origGemini = process.env.GEMINI_API_KEY;
    const origOpenai = process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    // Create a temporary dummy image
    const testImgPath = path.join(__dirname, 'test-temp.jpg');
    fs.writeFileSync(testImgPath, Buffer.from('fake-jpeg-binary-data'));

    const formData = new FormData();
    formData.append('image', new Blob([fs.readFileSync(testImgPath)], { type: 'image/jpeg' }), 'test-temp.jpg');

    const noKeyRes = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      body: formData,
    });
    const noKeyJson = await noKeyRes.json();

    if (noKeyRes.status === 503 && noKeyJson.code === 'AI_NOT_CONFIGURED') {
      console.log('[PASS] Correctly returned HTTP 503 with code: AI_NOT_CONFIGURED');
      console.log(`       Message: "${noKeyJson.message}"`);
      console.log('       [CONFIRMED] Zero fake/mock fallback was returned.');
    } else {
      throw new Error(`Expected 503 AI_NOT_CONFIGURED, but got: ${noKeyRes.status} ${JSON.stringify(noKeyJson)}`);
    }

    // Clean up temp file
    if (fs.existsSync(testImgPath)) fs.unlinkSync(testImgPath);

    // Restore env if any
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    if (origOpenai) process.env.OPENAI_API_KEY = origOpenai;

    // 2. Test Real Ticket Creation with different issue types
    console.log('\n--- 2. Testing Real Ticket Creation & Automatic Department Routing ---');
    
    // Login as Citizen to obtain token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@civicai.gov', password: 'Citizen123!' }),
    });
    const loginJson = await loginRes.json();
    const token = loginJson.data.token;
    console.log(`[PASS] Citizen authenticated. Token acquired.`);

    // Test Garbage Issue Creation
    console.log('\nSubmitting Garbage / Sanitation Report...');
    const garbageTicketRes = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        issueType: 'Garbage / Sanitation Issue',
        description: 'Overflowing municipal dumpster spilling into pedestrian lane',
        severity: 'High',
        aiConfidence: 0.88,
        latitude: 12.9716,
        longitude: 77.5946,
        imageUrl: '/uploads/garbage_evidence.jpg',
      }),
    });
    const garbageTicket = (await garbageTicketRes.json()).data;
    console.log(`[PASS] Ticket Created: ${garbageTicket.ticketId}`);
    console.log(`       - Issue Type: ${garbageTicket.issueType}`);
    console.log(`       - Department: ${garbageTicket.departmentName}`);
    console.log(`       - Ward: ${garbageTicket.wardName}`);
    console.log(`       - Confidence: ${(garbageTicket.aiConfidence * 100).toFixed(0)}%`);

    if (garbageTicket.departmentName !== 'Sanitation Department') {
      throw new Error(`Expected Sanitation Department for Garbage issue, got: ${garbageTicket.departmentName}`);
    }

    // Test Electrical / Streetlight Issue Creation
    console.log('\nSubmitting Streetlight / Electrical Report...');
    const lightTicketRes = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        issueType: 'Streetlight / Electrical Issue',
        description: 'Broken streetlight fixture creating dark spot at intersection',
        severity: 'Medium',
        aiConfidence: 0.91,
        latitude: 13.01,
        longitude: 77.605,
        imageUrl: '/uploads/streetlight_evidence.jpg',
      }),
    });
    const lightTicket = (await lightTicketRes.json()).data;
    console.log(`[PASS] Ticket Created: ${lightTicket.ticketId}`);
    console.log(`       - Issue Type: ${lightTicket.issueType}`);
    console.log(`       - Department: ${lightTicket.departmentName}`);
    console.log(`       - Ward: ${lightTicket.wardName}`);

    if (lightTicket.departmentName !== 'Electrical Department') {
      throw new Error(`Expected Electrical Department for Streetlight issue, got: ${lightTicket.departmentName}`);
    }

    // Test Drainage Issue Creation
    console.log('\nSubmitting Drainage / Wastewater Report...');
    const drainageTicketRes = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        issueType: 'Drainage / Wastewater Issue',
        description: 'Storm drain blocked with mud causing waterlogging',
        severity: 'Critical',
        aiConfidence: 0.95,
        latitude: 12.93,
        longitude: 77.58,
        imageUrl: '/uploads/drainage_evidence.jpg',
      }),
    });
    const drainageTicket = (await drainageTicketRes.json()).data;
    console.log(`[PASS] Ticket Created: ${drainageTicket.ticketId}`);
    console.log(`       - Issue Type: ${drainageTicket.issueType}`);
    console.log(`       - Department: ${drainageTicket.departmentName}`);

    if (drainageTicket.departmentName !== 'Water & Drainage Department') {
      throw new Error(`Expected Water & Drainage Department, got: ${drainageTicket.departmentName}`);
    }

    // 3. Test Database Count & Authority Dashboard Metrics
    console.log('\n--- 3. Testing Real Database Count & Dashboard Retrieval ---');
    const allTicketsRes = await fetch(`${baseUrl}/api/tickets`);
    const allTicketsJson = await allTicketsRes.json();
    const tickets = allTicketsJson.data;

    console.log(`[PASS] GET /api/tickets returned ${tickets.length} total database tickets.`);
    const totalReports = tickets.length;
    const reportedCount = tickets.filter(t => t.status === 'Reported').length;
    const inProgressCount = tickets.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
    const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : '0.0';

    console.log(`       - Total Reports (from DB): ${totalReports}`);
    console.log(`       - New / Reported (from DB): ${reportedCount}`);
    console.log(`       - In Progress (from DB): ${inProgressCount}`);
    console.log(`       - Resolved (from DB): ${resolvedCount}`);
    console.log(`       - Resolution Rate (from DB): ${resolutionRate}%`);

    // 4. Test Persistence of Status Change
    console.log('\n--- 4. Testing Status Change & Persistence in Database ---');
    const targetTicket = garbageTicket;
    console.log(`Changing status of ${targetTicket.ticketId} from "${targetTicket.status}" to "In Progress"...`);

    const updateRes = await fetch(`${baseUrl}/api/tickets/${targetTicket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });
    const updatedTicket = (await updateRes.json()).data;

    if (updatedTicket.status !== 'In Progress') {
      throw new Error(`Status update failed: ${JSON.stringify(updatedTicket)}`);
    }
    console.log(`[PASS] Server responded with updated status: ${updatedTicket.status}`);

    // Re-query ticket directly from database to verify persistence
    console.log('Re-fetching ticket from database to verify persistence...');
    const verifyRes = await fetch(`${baseUrl}/api/tickets/${targetTicket._id}`);
    const verifiedTicket = (await verifyRes.json()).data;

    if (verifiedTicket.status !== 'In Progress') {
      throw new Error(`Database persistence check failed! Status is: ${verifiedTicket.status}`);
    }
    console.log(`[PASS] Status change verified in database: ${verifiedTicket.status}`);

    console.log('\n====================================================');
    console.log('ALL DYNAMIC BACKEND & DATABASE TESTS PASSED!');
    console.log('====================================================\n');

    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('TEST SUITE FAILED:', err);
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();
