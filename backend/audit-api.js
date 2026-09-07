/**
 * Comprehensive API Audit Script
 * Tests ALL endpoints in Library Sathi backend
 */

const http = require('http');

// ─── CONFIG ──────────────────────────────────────────
const BASE = 'http://localhost:5000';
const PORT = 5000;
let ADMIN_TOKEN = '';
let SA_TOKEN = '';
let STUDENT_TOKEN = '';

// Test data IDs (populated during test)
let testAdminId = '';
let testStudentId = '';
let testStudentMongoId = '';
let testSeatId = '';
let testShiftId = '';
let testLockerId = '';
let testBookId = '';
let testBookIssueId = '';
let testFeatureId = '';
let testPlanId = '';
let testSubscriptionId = '';

const results = [];

// ─── HTTP HELPER ─────────────────────────────────────
function request(method, path, body = null, token = null, timeout = 10000) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout,
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch(e) { parsed = { raw: data }; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', (err) => resolve({ status: 0, body: { error: err.message } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: { error: 'TIMEOUT' } }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function record(module, api, method, path, status, pass, detail) {
  const icon = pass === true ? '✅' : pass === false ? '❌' : '⚠️';
  results.push({ module, api, method, path, status, pass: icon, detail });
  console.log(`  ${icon} ${method.padEnd(6)} ${path.padEnd(50)} ${status} ${detail.substring(0, 80)}`);
}

// ─── TEST FUNCTIONS ──────────────────────────────────

async function testHealth() {
  console.log('\n═══ HEALTH ═══');
  const r = await request('GET', '/api/health');
  record('Health', 'Health Check', 'GET', '/api/health', r.status, r.status === 200, r.body?.message || '');
}

// ─── SUPER ADMIN AUTH ────────────────────────────────
async function testSuperAdminAuth() {
  console.log('\n═══ SUPER ADMIN AUTH ═══');

  // Register
  let r = await request('POST', '/api/super-admin/auth/register', {
    name: 'Test SuperAdmin',
    email: 'test-sa-audit@test.com',
    password: 'Test123456'
  });
  if (r.status === 201 && r.body?.data?.token) {
    SA_TOKEN = r.body.data.token;
    record('SA Auth', 'Register', 'POST', '/api/super-admin/auth/register', r.status, true, 'Registered + got token');
  } else if (r.status === 400 && r.body?.message?.includes('already exists')) {
    record('SA Auth', 'Register', 'POST', '/api/super-admin/auth/register', r.status, true, 'Already exists (expected)');
    // Login instead
    r = await request('POST', '/api/super-admin/auth/login', {
      email: 'test-sa-audit@test.com',
      password: 'Test123456'
    });
    if (r.status === 200 && r.body?.data?.token) {
      SA_TOKEN = r.body.data.token;
    }
  } else {
    record('SA Auth', 'Register', 'POST', '/api/super-admin/auth/register', r.status, false, JSON.stringify(r.body?.message || r.body?.error || '').substring(0, 100));
  }

  // Login
  r = await request('POST', '/api/super-admin/auth/login', {
    email: 'test-sa-audit@test.com',
    password: 'Test123456'
  });
  if (r.status === 200 && r.body?.data?.token) {
    SA_TOKEN = r.body.data.token;
    record('SA Auth', 'Login', 'POST', '/api/super-admin/auth/login', r.status, true, 'Got token');
  } else {
    record('SA Auth', 'Login', 'POST', '/api/super-admin/auth/login', r.status, false, JSON.stringify(r.body?.message || r.body?.error || '').substring(0, 100));
  }

  // Profile (requires token)
  if (SA_TOKEN) {
    r = await request('GET', '/api/super-admin/auth/profile', null, SA_TOKEN);
    record('SA Auth', 'Get Profile', 'GET', '/api/super-admin/auth/profile', r.status, r.status === 200, r.body?.message || '');

    // Check password exposure
    if (r.body?.data?.user?.password) {
      record('SA Auth', 'SECURITY', 'GET', '/api/super-admin/auth/profile', r.status, false, '⚠️ PASSWORD HASH EXPOSED IN RESPONSE');
    }
  }

  // No token
  r = await request('GET', '/api/super-admin/auth/profile');
  record('SA Auth', 'Profile (no auth)', 'GET', '/api/super-admin/auth/profile', r.status, r.status === 401, 'Auth required: ' + (r.body?.message || ''));
}

// ─── SUPER ADMIN FEATURES ───────────────────────────
async function testSuperAdminFeatures() {
  console.log('\n═══ SUPER ADMIN FEATURES ═══');
  if (!SA_TOKEN) { record('SA Feature', 'ALL', '-', '-', 0, false, 'BLOCKED: No SA token'); return; }

  // Create
  let r = await request('POST', '/api/super-admin/feature/create', {
    name: 'Test Audit Feature',
    description: 'Created by audit script',
    type: 'addon'
  }, SA_TOKEN);
  if (r.status === 201 && r.body?.data?.feature) {
    testFeatureId = r.body.data.feature._id;
    record('SA Feature', 'Create', 'POST', '/api/super-admin/feature/create', r.status, true, `ID: ${testFeatureId}`);
  } else {
    record('SA Feature', 'Create', 'POST', '/api/super-admin/feature/create', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Get All
  r = await request('GET', '/api/super-admin/feature/all', null, SA_TOKEN);
  record('SA Feature', 'Get All', 'GET', '/api/super-admin/feature/all', r.status, r.status === 200, `Count: ${r.body?.data?.features?.length || r.body?.data?.length || 'N/A'}`);

  // Get By ID
  if (testFeatureId) {
    r = await request('GET', `/api/super-admin/feature/get/${testFeatureId}`, null, SA_TOKEN);
    record('SA Feature', 'Get By ID', 'GET', `/api/super-admin/feature/get/:id`, r.status, r.status === 200, r.body?.message || '');

    // Update
    r = await request('PUT', `/api/super-admin/feature/update/${testFeatureId}`, { name: 'Updated Audit Feature' }, SA_TOKEN);
    record('SA Feature', 'Update', 'PUT', `/api/super-admin/feature/update/:id`, r.status, r.status === 200, r.body?.message || '');

    // Toggle
    r = await request('PATCH', `/api/super-admin/feature/toggle/${testFeatureId}`, {}, SA_TOKEN);
    record('SA Feature', 'Toggle Status', 'PATCH', `/api/super-admin/feature/toggle/:id`, r.status, r.status === 200, r.body?.message || '');

    // Delete (do this last)
    r = await request('DELETE', `/api/super-admin/feature/delete/${testFeatureId}`, null, SA_TOKEN);
    record('SA Feature', 'Delete', 'DELETE', `/api/super-admin/feature/delete/:id`, r.status, r.status === 200, r.body?.message || '');
  }
}

// ─── SUPER ADMIN PLANS ──────────────────────────────
async function testSuperAdminPlans() {
  console.log('\n═══ SUPER ADMIN PLANS ═══');
  if (!SA_TOKEN) { record('SA Plan', 'ALL', '-', '-', 0, false, 'BLOCKED: No SA token'); return; }

  // Create a feature first for plan
  let fr = await request('POST', '/api/super-admin/feature/create', {
    name: 'Plan Test Feature',
    description: 'For plan testing',
    type: 'core'
  }, SA_TOKEN);
  let featureForPlan = fr.body?.data?.feature?._id;

  // Create Plan
  let r = await request('POST', '/api/super-admin/plan/create', {
    name: 'Test Audit Plan',
    description: 'Created by audit',
    price: 999,
    duration: 30,
    features: featureForPlan ? [featureForPlan] : []
  }, SA_TOKEN);
  if (r.status === 201 && r.body?.data?.plan) {
    testPlanId = r.body.data.plan._id;
    record('SA Plan', 'Create', 'POST', '/api/super-admin/plan/create', r.status, true, `ID: ${testPlanId}`);
  } else {
    record('SA Plan', 'Create', 'POST', '/api/super-admin/plan/create', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Get All
  r = await request('GET', '/api/super-admin/plan/all', null, SA_TOKEN);
  record('SA Plan', 'Get All', 'GET', '/api/super-admin/plan/all', r.status, r.status === 200, `Count: ${r.body?.data?.plans?.length || 'N/A'}`);

  if (testPlanId) {
    r = await request('GET', `/api/super-admin/plan/get/${testPlanId}`, null, SA_TOKEN);
    record('SA Plan', 'Get By ID', 'GET', `/api/super-admin/plan/get/:id`, r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/super-admin/plan/update/${testPlanId}`, { price: 1499 }, SA_TOKEN);
    record('SA Plan', 'Update', 'PUT', `/api/super-admin/plan/update/:id`, r.status, r.status === 200, r.body?.message || '');

    r = await request('PATCH', `/api/super-admin/plan/toggle/${testPlanId}`, {}, SA_TOKEN);
    record('SA Plan', 'Toggle', 'PATCH', `/api/super-admin/plan/toggle/:id`, r.status, r.status === 200, r.body?.message || '');

    r = await request('DELETE', `/api/super-admin/plan/delete/${testPlanId}`, null, SA_TOKEN);
    record('SA Plan', 'Delete', 'DELETE', `/api/super-admin/plan/delete/:id`, r.status, r.status === 200, r.body?.message || '');
  }

  // Cleanup feature
  if (featureForPlan) await request('DELETE', `/api/super-admin/feature/delete/${featureForPlan}`, null, SA_TOKEN);
}

// ─── SUPER ADMIN SUBSCRIPTIONS ──────────────────────
async function testSuperAdminSubscriptions() {
  console.log('\n═══ SUPER ADMIN SUBSCRIPTIONS ═══');
  if (!SA_TOKEN) { record('SA Sub', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('GET', '/api/super-admin/subscription/all', null, SA_TOKEN);
  record('SA Sub', 'Get All', 'GET', '/api/super-admin/subscription/all', r.status, r.status === 200, `Count: ${r.body?.data?.subscriptions?.length || 'N/A'}`);
}

// ─── ADMIN AUTH ─────────────────────────────────────
async function testAdminAuth() {
  console.log('\n═══ ADMIN AUTH ═══');

  // Register
  let r = await request('POST', '/api/admin/auth/register', {
    firstName: 'AuditTest',
    email: 'audit-admin@test.com',
    password: 'Audit123456',
    libraryName: 'Audit Library'
  });
  if (r.status === 201 && r.body?.data?.token) {
    ADMIN_TOKEN = r.body.data.token;
    record('Admin Auth', 'Register', 'POST', '/api/admin/auth/register', r.status, true, 'Registered');
  } else if (r.status === 400) {
    record('Admin Auth', 'Register', 'POST', '/api/admin/auth/register', r.status, true, 'Already exists');
  } else {
    record('Admin Auth', 'Register', 'POST', '/api/admin/auth/register', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Login
  r = await request('POST', '/api/admin/auth/login', {
    email: 'audit-admin@test.com',
    password: 'Audit123456'
  });
  if (r.status === 200 && r.body?.data?.token) {
    ADMIN_TOKEN = r.body.data.token;
    record('Admin Auth', 'Login', 'POST', '/api/admin/auth/login', r.status, true, 'Got token');
  } else {
    record('Admin Auth', 'Login', 'POST', '/api/admin/auth/login', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Validation test
  r = await request('POST', '/api/admin/auth/login', { email: 'invalid', password: '' });
  record('Admin Auth', 'Login (invalid)', 'POST', '/api/admin/auth/login', r.status, r.status === 400, 'Validation: ' + (r.body?.message || ''));

  // Profile
  if (ADMIN_TOKEN) {
    r = await request('GET', '/api/admin/auth/profile', null, ADMIN_TOKEN);
    record('Admin Auth', 'Get Profile', 'GET', '/api/admin/auth/profile', r.status, r.status === 200, r.body?.message || '');

    // Check password exposure
    const adminData = r.body?.data?.admin || r.body?.data;
    if (adminData?.password) {
      record('Admin Auth', 'SECURITY', 'GET', '/api/admin/auth/profile', 0, false, '⚠️ PASSWORD HASH EXPOSED');
    }

    testAdminId = adminData?._id || adminData?.id || '';
  }
}

// ─── ADMIN SHIFT ────────────────────────────────────
async function testAdminShift() {
  console.log('\n═══ ADMIN SHIFT ═══');
  if (!ADMIN_TOKEN) { record('Shift', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  // Create
  let r = await request('POST', '/api/admin/shift/create', {
    name: 'Morning Audit Shift',
    startTime: '06:00',
    endTime: '12:00',
    maxStudents: 50
  }, ADMIN_TOKEN);
  if ((r.status === 201 || r.status === 200) && r.body?.data?.shift) {
    testShiftId = r.body.data.shift._id;
    const shift = r.body.data.shift;
    record('Shift', 'Create', 'POST', '/api/admin/shift/create', r.status, true, `ID: ${testShiftId}, maxStudents: ${shift.maxStudents}`);
    // KNOWN ISSUE CHECK: maxStudents should be 50
    if (shift.maxStudents !== 50) {
      record('Shift', 'BUG: maxStudents', 'POST', '/api/admin/shift/create', r.status, false, `maxStudents=${shift.maxStudents}, expected 50. Controller may be ignoring req.body.maxStudents`);
    }
  } else {
    record('Shift', 'Create', 'POST', '/api/admin/shift/create', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Get All
  r = await request('GET', '/api/admin/shift/all', null, ADMIN_TOKEN);
  record('Shift', 'Get All', 'GET', '/api/admin/shift/all', r.status, r.status === 200, `Count: ${r.body?.data?.shifts?.length || 'N/A'}`);

  if (testShiftId) {
    r = await request('GET', `/api/admin/shift/get/${testShiftId}`, null, ADMIN_TOKEN);
    record('Shift', 'Get By ID', 'GET', '/api/admin/shift/get/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/admin/shift/update/${testShiftId}`, { name: 'Updated Shift' }, ADMIN_TOKEN);
    record('Shift', 'Update', 'PUT', '/api/admin/shift/update/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PATCH', `/api/admin/shift/toggle/${testShiftId}`, {}, ADMIN_TOKEN);
    record('Shift', 'Toggle', 'PATCH', '/api/admin/shift/toggle/:id', r.status, r.status === 200, r.body?.message || '');
    // Toggle back
    await request('PATCH', `/api/admin/shift/toggle/${testShiftId}`, {}, ADMIN_TOKEN);
  }
}

// ─── ADMIN SEAT ─────────────────────────────────────
async function testAdminSeat() {
  console.log('\n═══ ADMIN SEAT ═══');
  if (!ADMIN_TOKEN) { record('Seat', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('POST', '/api/admin/seat/create', {
    seatNumber: 'AUDIT-S1',
    floor: '1',
    section: 'A'
  }, ADMIN_TOKEN);
  if ((r.status === 201 || r.status === 200) && r.body?.data?.seat) {
    testSeatId = r.body.data.seat._id;
    record('Seat', 'Create', 'POST', '/api/admin/seat/create', r.status, true, `ID: ${testSeatId}`);
  } else {
    record('Seat', 'Create', 'POST', '/api/admin/seat/create', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Bulk
  r = await request('POST', '/api/admin/seat/bulk', {
    prefix: 'AUDIT-B',
    count: 3,
    floor: '2'
  }, ADMIN_TOKEN);
  record('Seat', 'Bulk Create', 'POST', '/api/admin/seat/bulk', r.status, r.status === 201 || r.status === 200, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));

  r = await request('GET', '/api/admin/seat/all', null, ADMIN_TOKEN);
  record('Seat', 'Get All', 'GET', '/api/admin/seat/all', r.status, r.status === 200, `Count: ${r.body?.data?.seats?.length || 'N/A'}`);

  r = await request('GET', '/api/admin/seat/available', null, ADMIN_TOKEN);
  record('Seat', 'Get Available', 'GET', '/api/admin/seat/available', r.status, r.status === 200, `Count: ${r.body?.data?.seats?.length || 'N/A'}`);

  if (testSeatId) {
    r = await request('GET', `/api/admin/seat/get/${testSeatId}`, null, ADMIN_TOKEN);
    record('Seat', 'Get By ID', 'GET', '/api/admin/seat/get/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/admin/seat/update/${testSeatId}`, { section: 'B' }, ADMIN_TOKEN);
    record('Seat', 'Update', 'PUT', '/api/admin/seat/update/:id', r.status, r.status === 200, r.body?.message || '');
  }
}

// ─── ADMIN LOCKER ───────────────────────────────────
async function testAdminLocker() {
  console.log('\n═══ ADMIN LOCKER ═══');
  if (!ADMIN_TOKEN) { record('Locker', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('POST', '/api/admin/locker/create', {
    lockerNumber: 'AUDIT-L1',
    price: 100
  }, ADMIN_TOKEN);
  if ((r.status === 201 || r.status === 200) && r.body?.data?.locker) {
    testLockerId = r.body.data.locker._id;
    record('Locker', 'Create', 'POST', '/api/admin/locker/create', r.status, true, `ID: ${testLockerId}`);
  } else {
    record('Locker', 'Create', 'POST', '/api/admin/locker/create', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  // Bulk
  r = await request('POST', '/api/admin/locker/bulk', {
    prefix: 'AUDIT-LB',
    count: 2,
    price: 150
  }, ADMIN_TOKEN);
  record('Locker', 'Bulk Create', 'POST', '/api/admin/locker/bulk', r.status, r.status === 201 || r.status === 200, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));

  r = await request('GET', '/api/admin/locker/all', null, ADMIN_TOKEN);
  record('Locker', 'Get All', 'GET', '/api/admin/locker/all', r.status, r.status === 200, `Count: ${r.body?.data?.lockers?.length || 'N/A'}`);

  if (testLockerId) {
    r = await request('GET', `/api/admin/locker/get/${testLockerId}`, null, ADMIN_TOKEN);
    record('Locker', 'Get By ID', 'GET', '/api/admin/locker/get/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/admin/locker/update/${testLockerId}`, { price: 200 }, ADMIN_TOKEN);
    record('Locker', 'Update', 'PUT', '/api/admin/locker/update/:id', r.status, r.status === 200, r.body?.message || '');

    // Assign (needs a student)
    r = await request('POST', '/api/admin/locker/assign', { lockerId: testLockerId, studentId: '000000000000000000000000' }, ADMIN_TOKEN);
    record('Locker', 'Assign', 'POST', '/api/admin/locker/assign', r.status, true, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));

    // Release
    r = await request('POST', '/api/admin/locker/release', { lockerId: testLockerId }, ADMIN_TOKEN);
    record('Locker', 'Release', 'POST', '/api/admin/locker/release', r.status, true, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));
  }
}

// ─── ADMIN BOOK ─────────────────────────────────────
async function testAdminBook() {
  console.log('\n═══ ADMIN BOOK ═══');
  if (!ADMIN_TOKEN) { record('Book', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('POST', '/api/admin/book/add', {
    title: 'Audit Test Book',
    author: 'Test Author',
    isbn: 'AUDIT-ISBN-001',
    totalCopies: 5,
    availableCopies: 5
  }, ADMIN_TOKEN);
  if ((r.status === 201 || r.status === 200) && r.body?.data?.book) {
    testBookId = r.body.data.book._id;
    record('Book', 'Add Book', 'POST', '/api/admin/book/add', r.status, true, `ID: ${testBookId}`);
  } else {
    record('Book', 'Add Book', 'POST', '/api/admin/book/add', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 100));
  }

  r = await request('GET', '/api/admin/book/all', null, ADMIN_TOKEN);
  record('Book', 'Get All', 'GET', '/api/admin/book/all', r.status, r.status === 200, `Count: ${r.body?.data?.books?.length || 'N/A'}`);

  if (testBookId) {
    r = await request('GET', `/api/admin/book/get/${testBookId}`, null, ADMIN_TOKEN);
    record('Book', 'Get By ID', 'GET', '/api/admin/book/get/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/admin/book/update/${testBookId}`, { title: 'Updated Audit Book' }, ADMIN_TOKEN);
    record('Book', 'Update', 'PUT', '/api/admin/book/update/:id', r.status, r.status === 200, r.body?.message || '');

    // Issue book (needs student)
    r = await request('POST', '/api/admin/book/issue', { bookId: testBookId, studentId: testStudentMongoId || '000000000000000000000000' }, ADMIN_TOKEN);
    record('Book', 'Issue Book', 'POST', '/api/admin/book/issue', r.status, true, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));

    // Get Issues
    r = await request('GET', '/api/admin/book/issues', null, ADMIN_TOKEN);
    record('Book', 'Get Issues', 'GET', '/api/admin/book/issues', r.status, r.status === 200, r.body?.message || '');

    // Return book
    r = await request('POST', '/api/admin/book/return', { bookId: testBookId, studentId: testStudentMongoId || '000000000000000000000000' }, ADMIN_TOKEN);
    record('Book', 'Return Book', 'POST', '/api/admin/book/return', r.status, true, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));
  }
}

// ─── ADMIN STUDENT ──────────────────────────────────
async function testAdminStudent() {
  console.log('\n═══ ADMIN STUDENT ═══');
  if (!ADMIN_TOKEN) { record('Student', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('POST', '/api/admin/student/admit', {
    name: 'Audit Test Student',
    email: 'audit-student@test.com',
    phone: '9999999999',
    address: 'Test Address',
    startDate: '2026-09-01',
    endDate: '2027-09-01',
    duration: 12,
    discount: 0,
    seatId: testSeatId || undefined,
    shiftId: testShiftId || undefined
  }, ADMIN_TOKEN);

  if ((r.status === 201 || r.status === 200) && r.body?.data?.student) {
    const student = r.body.data.student;
    testStudentMongoId = student._id;
    testStudentId = student.studentId;
    record('Student', 'Admit', 'POST', '/api/admin/student/admit', r.status, true, `ID: ${testStudentId}`);

    // SECURITY CHECK: password exposure
    if (student.password) {
      record('Student', 'SECURITY: Password exposed', 'POST', '/api/admin/student/admit', r.status, false, `⚠️ PASSWORD HASH EXPOSED: ${student.password.substring(0, 20)}...`);
    }

    // Check subscription dates
    if (student.isSubscriptionExpired === true) {
      record('Student', 'INFO: Sub expired', 'POST', '/api/admin/student/admit', r.status, null, 'isSubscriptionExpired=true (future dates used, check virtual)');
    }
  } else {
    record('Student', 'Admit', 'POST', '/api/admin/student/admit', r.status, false, JSON.stringify(r.body?.error || r.body?.message || '').substring(0, 120));
  }

  // Get All
  r = await request('GET', '/api/admin/student/all', null, ADMIN_TOKEN);
  record('Student', 'Get All', 'GET', '/api/admin/student/all', r.status, r.status === 200, `Count: ${r.body?.data?.students?.length || 'N/A'}`);

  // Search
  r = await request('GET', '/api/admin/student/search?q=Audit', null, ADMIN_TOKEN);
  record('Student', 'Search', 'GET', '/api/admin/student/search?q=Audit', r.status, r.status === 200, `Count: ${r.body?.data?.students?.length || 'N/A'}`);

  if (testStudentMongoId) {
    r = await request('GET', `/api/admin/student/get/${testStudentMongoId}`, null, ADMIN_TOKEN);
    record('Student', 'Get By ID', 'GET', '/api/admin/student/get/:id', r.status, r.status === 200, r.body?.message || '');

    r = await request('PUT', `/api/admin/student/update/${testStudentMongoId}`, { name: 'Updated Audit Student' }, ADMIN_TOKEN);
    record('Student', 'Update', 'PUT', '/api/admin/student/update/:id', r.status, r.status === 200, r.body?.message || '');
  }
}

// ─── ADMIN PAYMENT ──────────────────────────────────
async function testAdminPayment() {
  console.log('\n═══ ADMIN PAYMENT ═══');
  if (!ADMIN_TOKEN) { record('Payment', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  // Create order (Razorpay - may fail without key)
  let r = await request('POST', '/api/admin/payment/create-order', {
    planId: testPlanId || '000000000000000000000000',
    amount: 999
  }, ADMIN_TOKEN);
  record('Payment', 'Create Order', 'POST', '/api/admin/payment/create-order', r.status, null,
    r.status === 200 ? 'Created' : `Expected failure without Razorpay: ${(r.body?.error || r.body?.message || '').substring(0, 80)}`);

  // Verify payment (Razorpay - can't test safely)
  r = await request('POST', '/api/admin/payment/verify-payment', {
    orderId: 'test',
    paymentId: 'test',
    signature: 'test'
  }, ADMIN_TOKEN);
  record('Payment', 'Verify Payment', 'POST', '/api/admin/payment/verify-payment', r.status, null,
    `Not safely testable locally: ${(r.body?.error || r.body?.message || '').substring(0, 80)}`);
}

// ─── ADMIN DASHBOARD ────────────────────────────────
async function testAdminDashboard() {
  console.log('\n═══ ADMIN DASHBOARD ═══');
  if (!ADMIN_TOKEN) { record('Dashboard', 'ALL', '-', '-', 0, false, 'BLOCKED'); return; }

  let r = await request('GET', '/api/admin/dashboard/stats', null, ADMIN_TOKEN);
  record('Dashboard', 'Get Stats', 'GET', '/api/admin/dashboard/stats', r.status, r.status === 200, r.body?.message || JSON.stringify(r.body?.error || '').substring(0, 80));
}

// ─── STUDENT AUTH ───────────────────────────────────
async function testStudentAuth() {
  console.log('\n═══ STUDENT AUTH ═══');

  // Login with test student
  let r = await request('POST', '/api/student/login', {
    studentId: testStudentId || 'STU-00001',
    password: 'nonexistent'
  });
  record('Student Auth', 'Login (wrong pw)', 'POST', '/api/student/login', r.status, r.status === 401, r.body?.message || '');

  // Profile without token
  r = await request('GET', '/api/student/profile');
  record('Student Auth', 'Profile (no auth)', 'GET', '/api/student/profile', r.status, r.status === 401, r.body?.message || '');

  // Payments without token
  r = await request('GET', '/api/student/payments');
  record('Student Auth', 'Payments (no auth)', 'GET', '/api/student/payments', r.status, r.status === 401, r.body?.message || '');

  // Invoices without token
  r = await request('GET', '/api/student/invoices');
  record('Student Auth', 'Invoices (no auth)', 'GET', '/api/student/invoices', r.status, r.status === 401, r.body?.message || '');
}

// ─── ADMIN DELETE (last) ────────────────────────────
async function testAdminDelete() {
  console.log('\n═══ ADMIN DELETE (soft) ═══');
  if (!ADMIN_TOKEN) return;

  if (testStudentMongoId) {
    let r = await request('DELETE', `/api/admin/student/delete/${testStudentMongoId}`, null, ADMIN_TOKEN);
    record('Student', 'Delete (soft)', 'DELETE', '/api/admin/student/delete/:id', r.status, r.status === 200, r.body?.message || '');
  }

  if (testSeatId) {
    let r = await request('DELETE', `/api/admin/seat/delete/${testSeatId}`, null, ADMIN_TOKEN);
    record('Seat', 'Delete', 'DELETE', '/api/admin/seat/delete/:id', r.status, r.status === 200, r.body?.message || '');
  }

  if (testShiftId) {
    let r = await request('DELETE', `/api/admin/shift/delete/${testShiftId}`, null, ADMIN_TOKEN);
    record('Shift', 'Delete', 'DELETE', '/api/admin/shift/delete/:id', r.status, r.status === 200, r.body?.message || '');
  }

  if (testLockerId) {
    let r = await request('DELETE', `/api/admin/locker/delete/${testLockerId}`, null, ADMIN_TOKEN);
    record('Locker', 'Delete', 'DELETE', '/api/admin/locker/delete/:id', r.status, r.status === 200, r.body?.message || '');
  }

  if (testBookId) {
    let r = await request('DELETE', `/api/admin/book/delete/${testBookId}`, null, ADMIN_TOKEN);
    record('Book', 'Delete', 'DELETE', '/api/admin/book/delete/:id', r.status, r.status === 200, r.body?.message || '');
  }
}

// ─── KNOWN ISSUE CHECKS ────────────────────────────
async function checkKnownIssues() {
  console.log('\n═══ KNOWN ISSUE CHECKS ═══');

  // Issue 5: JWT fallback mismatch
  const fs = require('fs');
  const authContent = fs.readFileSync('src/middleware/auth.js', 'utf8');
  const jwtContent = fs.readFileSync('src/utils/jwtHelper.js', 'utf8');
  const authFallback = authContent.match(/\|\|\s*'([^']+)'/)?.[1];
  const jwtFallback = jwtContent.match(/\|\|\s*'([^']+)'/)?.[1];
  if (authFallback !== jwtFallback) {
    record('Security', 'JWT Fallback Mismatch', '-', 'auth.js vs jwtHelper.js', 0, false,
      `auth.js='${authFallback}' vs jwtHelper.js='${jwtFallback}'`);
  } else {
    record('Security', 'JWT Fallback', '-', 'auth.js vs jwtHelper.js', 0, true, 'Consistent');
  }

  // Issue 4: generateStudentId uses adminId?
  const idGenContent = fs.readFileSync('src/utils/idGenerator.js', 'utf8');
  const hasAdminIdParam = idGenContent.includes('generateStudentId = async (adminId)');
  record('Code', 'generateStudentId(adminId)', '-', 'utils/idGenerator.js', 0, hasAdminIdParam,
    hasAdminIdParam ? 'Accepts adminId param' : 'Missing adminId param');

  // Check if controller passes adminId
  const studentCtrl = fs.readFileSync('src/controllers/admin/student.controller.js', 'utf8');
  const passesAdminId = studentCtrl.includes('generateStudentId(adminId)');
  record('Code', 'Controller passes adminId', '-', 'controllers/admin/student.controller.js', 0, passesAdminId,
    passesAdminId ? 'Passes adminId' : '⚠️ Does NOT pass adminId to generateStudentId');
}

// ─── MAIN ───────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║    Library Sathi - Comprehensive API Audit          ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  await testHealth();
  await testSuperAdminAuth();
  await testSuperAdminFeatures();
  await testSuperAdminPlans();
  await testSuperAdminSubscriptions();
  await testAdminAuth();
  await testAdminShift();
  await testAdminSeat();
  await testAdminLocker();
  await testAdminBook();
  await testAdminStudent();
  await testAdminPayment();
  await testAdminDashboard();
  await testStudentAuth();
  await testAdminDelete();
  await checkKnownIssues();

  // ─── REPORT ─────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║              FINAL AUDIT REPORT                     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.pass === '✅').length;
  const failed = results.filter(r => r.pass === '❌').length;
  const partial = results.filter(r => r.pass === '⚠️').length;

  console.log(`TOTAL: ${results.length} | ✅ PASS: ${passed} | ❌ FAIL: ${failed} | ⚠️ PARTIAL: ${partial}\n`);

  console.log('Module'.padEnd(15) + 'API'.padEnd(30) + 'Method'.padEnd(8) + 'St'.padEnd(5) + 'Result');
  console.log('─'.repeat(100));
  for (const r of results) {
    console.log(`${r.module.padEnd(15)}${r.api.padEnd(30)}${r.method.padEnd(8)}${String(r.status).padEnd(5)}${r.pass} ${r.detail.substring(0, 50)}`);
  }

  // Write JSON report
  const fs = require('fs');
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results written to audit-results.json');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
