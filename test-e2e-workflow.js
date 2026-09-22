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

async function runTests() {
  console.log('===============================================================');
  console.log('CIVICAI FULL WORKFLOW & ROLE-BASED VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  try {
    // STEP 0: API Health Check
    console.log('[STEP 0] API Health Check');
    const health = await request('/health');
    assert(health.status === 200, `API is healthy: status ${health.status}`);

    // STEP 1: Register Citizen A
    console.log('\n[STEP 1] Citizen A Registration & Login');
    const citizenEmail = `citizen_test_${Date.now()}@example.com`;
    const regCitA = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: citizenEmail,
        password: 'password123',
        role: 'citizen',
        phone: '+91 98765 43210',
      }),
    });
    assert(regCitA.status === 201 && regCitA.json.data?.token, 'Citizen A registered successfully and received token');
    const citizenAToken = regCitA.json.data.token;
    const citizenAId = regCitA.json.data._id || regCitA.json.data.id;

    // STEP 2: Citizen A creates a report (Roads issue)
    console.log('\n[STEP 2] Citizen A Reports Issue (AI Auto-Routing to Roads Department)');
    const createReport = await request('/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenAToken}` },
      body: JSON.stringify({
        issueType: 'Pothole / Road Damage',
        description: 'Large deep pothole causing severe traffic slowdown and bike accidents near Trinity Circle.',
        severity: 'High',
        aiConfidence: 0.94,
        latitude: 12.9756,
        longitude: 77.6066,
        imageUrl: '/uploads/demo-pothole.jpg',
      }),
    });
    assert(createReport.status === 201, `Report created successfully with status ${createReport.status}`);
    const ticket = createReport.json.data;
    const ticketId = ticket.ticketId || ticket._id || ticket.id;
    assert(ticket.departmentId === 'dept_roads', `Auto-routed to Roads Department: ${ticket.departmentId}`);
    assert(ticket.status === 'Reported', `Initial status is 'Reported': ${ticket.status}`);

    // STEP 3: Citizen A verifies My Reports
    console.log('\n[STEP 3] Citizen A checks "My Reports"');
    const myReportsA = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${citizenAToken}` },
    });
    assert(myReportsA.status === 200, 'My Reports endpoint returned 200');
    assert(Array.isArray(myReportsA.json.data) && myReportsA.json.data.some(t => t.ticketId === ticket.ticketId), 'Citizen A sees newly created ticket in My Reports');

    // STEP 4: Register Citizen B and verify Isolation
    console.log('\n[STEP 4] Citizen Isolation — Citizen B cannot see or access Citizen A\'s Report');
    const citizenBEmail = `citizen_b_${Date.now()}@example.com`;
    const regCitB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bhavna Patel',
        email: citizenBEmail,
        password: 'password123',
        role: 'citizen',
      }),
    });
    const citizenBToken = regCitB.json.data.token;
    
    const myReportsB = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${citizenBToken}` },
    });
    assert(!myReportsB.json.data.some(t => t.ticketId === ticket.ticketId), 'Citizen B does NOT see Citizen A\'s ticket in My Reports');

    const directAccessB = await request(`/tickets/${ticket.ticketId}`, {
      headers: { Authorization: `Bearer ${citizenBToken}` },
    });
    assert(directAccessB.status === 403, `Citizen B direct access to Citizen A ticket returns 403 Forbidden (got ${directAccessB.status})`);

    // STEP 5: Road Authority Login & Department Isolation
    console.log('\n[STEP 5] Road Authority Login & Department Isolation');
    const authLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'road.authority@civicai.gov',
        password: 'Authority123!',
      }),
    });
    assert(authLogin.status === 200 && authLogin.json.data?.token, 'Road Authority logged in');
    const authorityToken = authLogin.json.data.token;

    const authTickets = await request('/tickets', {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    assert(authTickets.status === 200, 'Authority fetched tickets');
    assert(authTickets.json.data.some(t => t.ticketId === ticket.ticketId), 'Road Authority sees Citizen A\'s road ticket');

    // STEP 6: Worker Registration with Approval Flow
    console.log('\n[STEP 6] Worker Registration -> Pending Approval Status');
    const workerEmail = `worker_zain_${Date.now()}@civicai.gov`;
    const regWorker = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Zain Field Worker',
        email: workerEmail,
        password: 'password123',
        role: 'worker',
        departmentId: 'dept_roads',
        ward: 'Ward 112',
        phone: '+91 91234 56789',
      }),
    });
    assert(regWorker.status === 201, `Worker registered with status 201`);
    assert(regWorker.json.data?.status === 'pending_approval', `Worker account status is pending_approval: ${regWorker.json.data?.status}`);

    // STEP 7: Worker Login Attempt Before Approval
    console.log('\n[STEP 7] Worker Login Attempt Before Approval -> Rejection');
    const unapprovedLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: workerEmail,
        password: 'password123',
      }),
    });
    assert(unapprovedLogin.status === 403, `Unapproved worker login rejected with 403 (got ${unapprovedLogin.status})`);

    // STEP 8: Authority Views Pending Worker Requests
    console.log('\n[STEP 8] Authority Views Pending Worker Requests');
    const workerRequests = await request('/workers/requests', {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    assert(workerRequests.status === 200, 'Authority fetched pending worker requests');
    const pendingReq = workerRequests.json.data.find(r => r.email === workerEmail);
    assert(pendingReq !== undefined, `Found pending request for ${workerEmail}`);

    // STEP 9: Authority Approves Worker
    console.log('\n[STEP 9] Authority Approves Worker Request');
    const approveWorker = await request(`/workers/requests/${pendingReq._id || pendingReq.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    assert(approveWorker.status === 200, 'Authority approved worker request');
    const approvedWorkerRecord = approveWorker.json.data?.worker;

    // STEP 10: Worker Logs in Successfully
    console.log('\n[STEP 10] Approved Worker Logs In Successfully');
    const workerLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: workerEmail,
        password: 'password123',
      }),
    });
    assert(workerLogin.status === 200 && workerLogin.json.data?.token, 'Worker logged in after approval');
    const workerToken = workerLogin.json.data.token;
    const workerUserId = workerLogin.json.data._id || workerLogin.json.data.id;

    // STEP 11: Authority Assigns Ticket to Approved Worker
    console.log('\n[STEP 11] Authority Assigns Ticket to Worker');
    // Fetch worker from roster matching our specific logged in worker user ID
    const workersList = await request('/workers', {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    const workerInList = workersList.json.data.find(w => String(w.userId) === String(workerUserId) || w.workerId === approvedWorkerRecord?.workerId);
    const workerDocId = workerInList ? (workerInList._id || workerInList.id) : (approvedWorkerRecord?._id || workerDocId);

    const assignRes = await request(`/tickets/${ticket.ticketId}/assign-worker`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authorityToken}` },
      body: JSON.stringify({
        workerId: workerDocId,
      }),
    });
    assert(assignRes.status === 200, `Authority assigned ticket: status ${assignRes.json.data?.status}`);

    // STEP 12: Worker Sees Only Assigned Tasks
    console.log('\n[STEP 12] Worker Views Assigned Tasks');
    const workerTasks = await request('/tickets', {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assert(workerTasks.status === 200, 'Worker fetched tasks');
    const hasAssignedTicket = workerTasks.json.data.some(t => t.ticketId === ticket.ticketId);
    assert(hasAssignedTicket, 'Worker sees the assigned ticket');

    // STEP 13: Worker Starts Task (Status -> In Progress)
    console.log('\n[STEP 13] Worker Starts Task -> In Progress');
    const startRes = await request(`/tickets/${ticket.ticketId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assert(startRes.status === 200, 'Worker started task');
    assert(startRes.json.data?.status === 'In Progress', `Ticket status updated to 'In Progress': ${startRes.json.data?.status}`);

    // STEP 14: Worker Submits Work Finished (Status -> Pending Verification)
    console.log('\n[STEP 14] Worker Submits Work Finished with Proof');
    const resolveRes = await request(`/tickets/${ticket.ticketId}/resolution`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        resolutionPhoto: '/uploads/demo-resolved-road.jpg',
        resolutionNote: 'Filled pothole with fast-curing bitumen asphalt and rolled flat. Inspected for drainage.',
      }),
    });
    assert(resolveRes.status === 200, 'Resolution submitted');
    assert(resolveRes.json.data?.status === 'Pending Verification', `Ticket status updated to 'Pending Verification': ${resolveRes.json.data?.status}`);

    // STEP 15: Authority Reviews & Approves Resolution (Status -> Resolved)
    console.log('\n[STEP 15] Authority Approves Resolution -> Resolved');
    const verifyRes = await request(`/tickets/${ticket.ticketId}/approve-resolution`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorityToken}` },
      body: JSON.stringify({
        notes: 'Verified via photo inspection. High quality repair.',
      }),
    });
    assert(verifyRes.status === 200, 'Authority approved resolution');
    assert(verifyRes.json.data?.status === 'Resolved', `Ticket status updated to 'Resolved': ${verifyRes.json.data?.status}`);

    // STEP 16: Citizen Notification Check
    console.log('\n[STEP 16] Citizen Receives Notification of Resolution');
    const citNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenAToken}` },
    });
    assert(citNotifs.status === 200, 'Citizen notifications fetched');
    assert(citNotifs.json.data.length > 0, `Citizen received ${citNotifs.json.data.length} notification(s)`);

    // STEP 17: Citizen Checks My Reports -> Shows Resolved
    console.log('\n[STEP 17] Citizen My Reports Reflects "Resolved" Status');
    const myReportsUpdated = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${citizenAToken}` },
    });
    const updatedTicket = myReportsUpdated.json.data.find(t => t.ticketId === ticket.ticketId);
    assert(updatedTicket && updatedTicket.status === 'Resolved', `Citizen sees ticket marked as Resolved: ${updatedTicket?.status}`);

    // STEP 18: Authority Permanently Deletes / Removes Task
    console.log('\n[STEP 18] Authority Permanently Removes Task');
    const deleteRes = await request(`/tickets/${ticket.ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    assert(deleteRes.status === 200, 'Authority deleted ticket');

    // STEP 19: Verify Task is Removed Everywhere
    console.log('\n[STEP 19] Verify Task is Removed Everywhere');
    const myReportsAfterDelete = await request('/tickets/my', {
      headers: { Authorization: `Bearer ${citizenAToken}` },
    });
    assert(!myReportsAfterDelete.json.data.some(t => t.ticketId === ticket.ticketId), 'Ticket no longer exists in Citizen My Reports');

    // STEP 20: Security & Role-Based Authorization Enforcement Checks
    console.log('\n[STEP 20] Security & Role-Based Authorization Enforcement');
    // a. Citizen cannot delete ticket
    const citDelete = await request(`/tickets/${ticket.ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenAToken}` },
    });
    assert(citDelete.status === 403, `Citizen DELETE returns 403 Forbidden (got ${citDelete.status})`);

    // b. Worker cannot delete ticket
    const wrkDelete = await request(`/tickets/${ticket.ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assert(wrkDelete.status === 403, `Worker DELETE returns 403 Forbidden (got ${wrkDelete.status})`);

    // c. Unauthenticated request to /tickets/my returns 401
    const unauthMy = await request('/tickets/my');
    assert(unauthMy.status === 401, `Unauthenticated /tickets/my returns 401 (got ${unauthMy.status})`);

    console.log('\n===============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runTests();
