import { app } from './server/index.js';

const PORT = 5055;

async function runTests() {
  console.log('====================================================');
  console.log('STEP 10: Dynamic Backend, Database & REST API Test');
  console.log('====================================================');

  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`[TEST SERVER] Running on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, options);
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(`API Error [${res.status}] ${path}: ${json.message || JSON.stringify(json)}`);
    }
    return json.data !== undefined ? json.data : json;
  }

  try {
    // 1. Test Auth: Login as Citizen, Authority, Worker
    console.log('\n--- 1. Testing Auth Endpoints ---');
    const citizenLogin = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@civicai.gov', password: 'Citizen123!' })
    });
    if (!citizenLogin.token || citizenLogin.role !== 'citizen') {
      throw new Error(`Citizen login failed: ${JSON.stringify(citizenLogin)}`);
    }
    console.log(`[PASS] Citizen login successful. Name: ${citizenLogin.name}, Role: ${citizenLogin.role}`);

    const authLogin = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'authority@civicai.gov', password: 'Authority123!' })
    });
    if (!authLogin.token || authLogin.role !== 'authority') {
      throw new Error(`Authority login failed: ${JSON.stringify(authLogin)}`);
    }
    console.log(`[PASS] Authority login successful. Role: ${authLogin.role}`);

    const workerLogin = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.worker@civicai.gov', password: 'Worker123!' })
    });
    if (!workerLogin.token || workerLogin.role !== 'worker') {
      throw new Error(`Worker login failed: ${JSON.stringify(workerLogin)}`);
    }
    console.log(`[PASS] Worker login successful. Role: ${workerLogin.role}`);

    // 2. Test Departments & Wards
    console.log('\n--- 2. Testing Department & Ward APIs ---');
    const depts = await api('/api/departments');
    console.log(`[PASS] Retrieved ${depts.length} departments: ${depts.map(d => d.name).join(', ')}`);

    const wards = await api('/api/wards');
    console.log(`[PASS] Retrieved ${wards.length} wards: ${wards.map(w => w.name).join(', ')}`);

    // 3. Test Ticket Creation with Auto-Routing & Notifications
    console.log('\n--- 3. Testing Ticket Creation with Auto-Routing ---');
    const newTicketPayload = {
      issueType: 'Pothole / Road Damage',
      description: 'Dangerous pothole on main ring road near south junction',
      severity: 'High',
      confidence: 0.94,
      latitude: 12.9720,
      longitude: 77.5950,
      address: 'Ring Road, Sector 4',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'
    };

    const createdTicket = await api('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenLogin.token}`
      },
      body: JSON.stringify(newTicketPayload)
    });
    if (!createdTicket._id || !createdTicket.ticketId) {
      throw new Error(`Failed to create ticket: ${JSON.stringify(createdTicket)}`);
    }
    console.log(`[PASS] Created Ticket ${createdTicket.ticketId} (_id: ${createdTicket._id})`);
    console.log(`       - Auto-Routed Department: ${createdTicket.departmentName}`);
    console.log(`       - Auto-Detected Ward: ${createdTicket.wardName}`);
    console.log(`       - Status: ${createdTicket.status}`);

    // 4. Test Worker Recommendation Engine
    console.log('\n--- 4. Testing Worker Recommendation Engine ---');
    const recommendedWorkers = await api(`/api/workers/recommended/${createdTicket._id}`, {
      headers: { 'Authorization': `Bearer ${authLogin.token}` }
    });
    if (!Array.isArray(recommendedWorkers) || recommendedWorkers.length === 0) {
      throw new Error(`No worker recommendations returned: ${JSON.stringify(recommendedWorkers)}`);
    }
    const topWorker = recommendedWorkers[0];
    console.log(`[PASS] Top Recommended Worker: ${topWorker.name} (${topWorker.departmentName}) with match score: ${topWorker.score}%`);

    // 5. Test Worker Assignment
    console.log('\n--- 5. Testing Worker Assignment ---');
    const assignedTicket = await api(`/api/tickets/${createdTicket._id}/assign-worker`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authLogin.token}`
      },
      body: JSON.stringify({
        workerId: topWorker.workerId,
        notes: 'Priority repair requested by ward authority'
      })
    });
    if (assignedTicket.status !== 'Assigned' || assignedTicket.assignedWorkerId !== topWorker.workerId) {
      throw new Error(`Worker assignment failed: ${JSON.stringify(assignedTicket)}`);
    }
    console.log(`[PASS] Ticket ${assignedTicket.ticketId} assigned to ${assignedTicket.assignedWorkerName}. Status: ${assignedTicket.status}`);

    // 6. Test Worker Status Change to In Progress
    console.log('\n--- 6. Testing Worker Status Update to In Progress ---');
    const inProgressTicket = await api(`/api/tickets/${createdTicket._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerLogin.token}`
      },
      body: JSON.stringify({ status: 'In Progress' })
    });
    if (inProgressTicket.status !== 'In Progress') {
      throw new Error(`Status update failed: ${JSON.stringify(inProgressTicket)}`);
    }
    console.log(`[PASS] Status updated to: ${inProgressTicket.status}`);

    // 7. Test AI Resolution Verification
    console.log('\n--- 7. Testing AI Resolution Verification ---');
    const resolutionPayload = {
      resolutionImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80',
      resolutionNotes: 'Asphalt filled, leveled, and road re-opened to traffic.'
    };
    const resolvedTicket = await api(`/api/tickets/${createdTicket._id}/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerLogin.token}`
      },
      body: JSON.stringify(resolutionPayload)
    });
    if (!resolvedTicket.verification || !resolvedTicket.verification.verificationStatus) {
      throw new Error(`Resolution failed: ${JSON.stringify(resolvedTicket)}`);
    }
    console.log(`[PASS] AI Verification result:`);
    console.log(`       - Verification Status: ${resolvedTicket.verification.verificationStatus}`);
    console.log(`       - AI Confidence: ${(resolvedTicket.verification.confidence * 100).toFixed(0)}%`);
    console.log(`       - AI Reasoning: ${resolvedTicket.verification.reason}`);
    console.log(`       - Ticket Status: ${resolvedTicket.status}`);

    // 8. Test In-App Citizen Notifications
    console.log('\n--- 8. Testing Citizen In-App Notifications ---');
    const notifications = await api('/api/notifications', {
      headers: { 'Authorization': `Bearer ${citizenLogin.token}` }
    });
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw new Error(`Expected notifications for citizen but received none.`);
    }
    console.log(`[PASS] Citizen received ${notifications.length} notifications:`);
    notifications.slice(0, 3).forEach(n => {
      console.log(`       • [${n.type}] ${n.title}: ${n.message}`);
    });

    console.log('\n====================================================');
    console.log('ALL STEP 10 REST APIS AND BACKEND SERVICES PASSED!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('FAILED TEST:', err);
  process.exit(1);
});
