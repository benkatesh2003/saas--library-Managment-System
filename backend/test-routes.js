/**
 * Route Validation Script
 * Tests that all routes are wired correctly to real controller functions
 * Does NOT need MongoDB - only checks Express routing layer
 */

const http = require('http');

// Suppress console logs during testing
const originalLog = console.log;
const originalWarn = console.warn;
console.log = () => {};
console.warn = () => {};

const app = require('./src/app');
console.log = originalLog;
console.warn = originalWarn;

const server = http.createServer(app);

const routes = [
  // ─── Health ─────────────────────────────────────
  { method: 'GET',    path: '/api/health',                         expect: 200, label: 'Health Check' },

  // ─── Super Admin Auth ──────────────────────────
  { method: 'POST',   path: '/api/super-admin/auth/register',      expect: [400, 500], label: 'SA Register' },
  { method: 'POST',   path: '/api/super-admin/auth/login',         expect: [400, 500], label: 'SA Login' },
  { method: 'GET',    path: '/api/super-admin/auth/profile',       expect: 401, label: 'SA Profile (no auth)' },

  // ─── Super Admin Features ─────────────────────
  { method: 'POST',   path: '/api/super-admin/feature/create',     expect: 401, label: 'SA Create Feature' },
  { method: 'GET',    path: '/api/super-admin/feature/all',        expect: 401, label: 'SA Get Features' },
  { method: 'GET',    path: '/api/super-admin/feature/get/abc',    expect: 401, label: 'SA Get Feature By ID' },
  { method: 'PUT',    path: '/api/super-admin/feature/update/abc', expect: 401, label: 'SA Update Feature' },
  { method: 'DELETE', path: '/api/super-admin/feature/delete/abc', expect: 401, label: 'SA Delete Feature' },
  { method: 'PATCH',  path: '/api/super-admin/feature/toggle/abc', expect: 401, label: 'SA Toggle Feature' },

  // ─── Super Admin Plans ────────────────────────
  { method: 'POST',   path: '/api/super-admin/plan/create',        expect: 401, label: 'SA Create Plan' },
  { method: 'GET',    path: '/api/super-admin/plan/all',           expect: 401, label: 'SA Get Plans' },
  { method: 'GET',    path: '/api/super-admin/plan/get/abc',       expect: 401, label: 'SA Get Plan By ID' },
  { method: 'PUT',    path: '/api/super-admin/plan/update/abc',    expect: 401, label: 'SA Update Plan' },
  { method: 'DELETE', path: '/api/super-admin/plan/delete/abc',    expect: 401, label: 'SA Delete Plan' },
  { method: 'PATCH',  path: '/api/super-admin/plan/toggle/abc',    expect: 401, label: 'SA Toggle Plan' },

  // ─── Super Admin Subscriptions ────────────────
  { method: 'GET',    path: '/api/super-admin/subscription/all',        expect: 401, label: 'SA Get Subscriptions' },
  { method: 'GET',    path: '/api/super-admin/subscription/get/abc',    expect: 401, label: 'SA Get Sub By ID' },
  { method: 'GET',    path: '/api/super-admin/subscription/admin/abc',  expect: 401, label: 'SA Get Sub By Admin' },
  { method: 'PATCH',  path: '/api/super-admin/subscription/status/abc', expect: 401, label: 'SA Update Sub Status' },

  // ─── Admin Auth ───────────────────────────────
  { method: 'POST',   path: '/api/admin/auth/register',            expect: [400, 500], label: 'Admin Register' },
  { method: 'POST',   path: '/api/admin/auth/login',               expect: [400, 500], label: 'Admin Login' },
  { method: 'POST',   path: '/api/admin/auth/google/login',        expect: 500, label: 'Admin Google Login' },
  { method: 'GET',    path: '/api/admin/auth/profile',             expect: 401, label: 'Admin Profile' },
  { method: 'PUT',    path: '/api/admin/auth/profile',             expect: 401, label: 'Admin Update Profile' },

  // ─── Admin Students ───────────────────────────
  { method: 'POST',   path: '/api/admin/student/admit',            expect: 401, label: 'Admin Admit Student' },
  { method: 'GET',    path: '/api/admin/student/all',              expect: 401, label: 'Admin Get Students' },
  { method: 'GET',    path: '/api/admin/student/search',           expect: 401, label: 'Admin Search Students' },
  { method: 'GET',    path: '/api/admin/student/get/abc',          expect: 401, label: 'Admin Get Student' },
  { method: 'PUT',    path: '/api/admin/student/update/abc',       expect: 401, label: 'Admin Update Student' },
  { method: 'DELETE', path: '/api/admin/student/delete/abc',       expect: 401, label: 'Admin Delete Student' },

  // ─── Admin Seats ──────────────────────────────
  { method: 'POST',   path: '/api/admin/seat/create',              expect: 401, label: 'Admin Create Seat' },
  { method: 'POST',   path: '/api/admin/seat/bulk',                expect: 401, label: 'Admin Bulk Seats' },
  { method: 'GET',    path: '/api/admin/seat/all',                 expect: 401, label: 'Admin Get Seats' },
  { method: 'GET',    path: '/api/admin/seat/available',           expect: 401, label: 'Admin Available Seats' },
  { method: 'GET',    path: '/api/admin/seat/get/abc',             expect: 401, label: 'Admin Get Seat' },
  { method: 'PUT',    path: '/api/admin/seat/update/abc',          expect: 401, label: 'Admin Update Seat' },
  { method: 'DELETE', path: '/api/admin/seat/delete/abc',          expect: 401, label: 'Admin Delete Seat' },

  // ─── Admin Shifts ─────────────────────────────
  { method: 'POST',   path: '/api/admin/shift/create',             expect: 401, label: 'Admin Create Shift' },
  { method: 'GET',    path: '/api/admin/shift/all',                expect: 401, label: 'Admin Get Shifts' },
  { method: 'GET',    path: '/api/admin/shift/get/abc',            expect: 401, label: 'Admin Get Shift' },
  { method: 'PUT',    path: '/api/admin/shift/update/abc',         expect: 401, label: 'Admin Update Shift' },
  { method: 'DELETE', path: '/api/admin/shift/delete/abc',         expect: 401, label: 'Admin Delete Shift' },
  { method: 'PATCH',  path: '/api/admin/shift/toggle/abc',         expect: 401, label: 'Admin Toggle Shift' },

  // ─── Admin Lockers ────────────────────────────
  { method: 'POST',   path: '/api/admin/locker/create',            expect: 401, label: 'Admin Create Locker' },
  { method: 'POST',   path: '/api/admin/locker/bulk',              expect: 401, label: 'Admin Bulk Lockers' },
  { method: 'GET',    path: '/api/admin/locker/all',               expect: 401, label: 'Admin Get Lockers' },
  { method: 'GET',    path: '/api/admin/locker/get/abc',           expect: 401, label: 'Admin Get Locker' },
  { method: 'PUT',    path: '/api/admin/locker/update/abc',        expect: 401, label: 'Admin Update Locker' },
  { method: 'DELETE', path: '/api/admin/locker/delete/abc',        expect: 401, label: 'Admin Delete Locker' },
  { method: 'POST',   path: '/api/admin/locker/assign',            expect: 401, label: 'Admin Assign Locker' },
  { method: 'POST',   path: '/api/admin/locker/release',           expect: 401, label: 'Admin Release Locker' },

  // ─── Admin Books ──────────────────────────────
  { method: 'POST',   path: '/api/admin/book/add',                 expect: 401, label: 'Admin Add Book' },
  { method: 'GET',    path: '/api/admin/book/all',                 expect: 401, label: 'Admin Get Books' },
  { method: 'GET',    path: '/api/admin/book/get/abc',             expect: 401, label: 'Admin Get Book' },
  { method: 'PUT',    path: '/api/admin/book/update/abc',          expect: 401, label: 'Admin Update Book' },
  { method: 'DELETE', path: '/api/admin/book/delete/abc',          expect: 401, label: 'Admin Delete Book' },
  { method: 'POST',   path: '/api/admin/book/issue',               expect: 401, label: 'Admin Issue Book' },
  { method: 'POST',   path: '/api/admin/book/return',              expect: 401, label: 'Admin Return Book' },
  { method: 'GET',    path: '/api/admin/book/issues',              expect: 401, label: 'Admin Book Issues' },

  // ─── Admin Payment ────────────────────────────
  { method: 'POST',   path: '/api/admin/payment/create-order',     expect: 401, label: 'Admin Create Order' },
  { method: 'POST',   path: '/api/admin/payment/verify-payment',   expect: 401, label: 'Admin Verify Payment' },

  // ─── Admin Dashboard ──────────────────────────
  { method: 'GET',    path: '/api/admin/dashboard/stats',          expect: 401, label: 'Admin Dashboard' },

  // ─── Student Auth ─────────────────────────────
  { method: 'POST',   path: '/api/student/login',                  expect: 500, label: 'Student Login' },
  { method: 'GET',    path: '/api/student/profile',                expect: 401, label: 'Student Profile' },
  { method: 'GET',    path: '/api/student/payments',               expect: 401, label: 'Student Payments' },
  { method: 'GET',    path: '/api/student/invoices',               expect: 401, label: 'Student Invoices' },

  // ─── 404 ──────────────────────────────────────
  { method: 'GET',    path: '/api/nonexistent',                    expect: 404, label: '404 Handler' },
];

let passed = 0;
let failed = 0;
let tested = 0;

const PORT = 5099;

function testRoute(route) {
  return new Promise((resolve) => {
    const body = ['POST', 'PUT', 'PATCH'].includes(route.method) ? JSON.stringify({}) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: route.path,
      method: route.method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const expectedArr = Array.isArray(route.expect) ? route.expect : [route.expect];
        const ok = !expectedArr.includes(404) 
          ? res.statusCode !== 404 || expectedArr.includes(404)
          : res.statusCode === 404;
        
        // A route is "working" if it doesn't return 404 (unless we expect 404)
        // AND it returns one of the expected status codes
        const isWorking = expectedArr.includes(res.statusCode);
        
        if (isWorking) {
          console.log(`  ✅ ${route.method.padEnd(6)} ${route.path.padEnd(50)} → ${res.statusCode}  ${route.label}`);
          passed++;
        } else {
          console.log(`  ❌ ${route.method.padEnd(6)} ${route.path.padEnd(50)} → ${res.statusCode} (expected ${route.expect})  ${route.label}`);
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) console.log(`     Error: ${parsed.error}`);
            if (parsed.message) console.log(`     Message: ${parsed.message}`);
          } catch(e) {}
          failed++;
        }
        tested++;
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`  ❌ ${route.method.padEnd(6)} ${route.path.padEnd(50)} → ERROR: ${err.message}  ${route.label}`);
      failed++;
      tested++;
      resolve();
    });

    req.on('timeout', () => {
      console.log(`  ❌ ${route.method.padEnd(6)} ${route.path.padEnd(50)} → TIMEOUT  ${route.label}`);
      req.destroy();
      failed++;
      tested++;
      resolve();
    });

    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n🔍 Testing all routes...\n');
  console.log('─'.repeat(90));
  
  for (const route of routes) {
    await testRoute(route);
  }

  console.log('─'.repeat(90));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${tested} total\n`);
  
  if (failed === 0) {
    console.log('🎉 ALL ROUTES WORKING!\n');
  } else {
    console.log(`⚠️  ${failed} route(s) need attention\n`);
  }

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

server.listen(PORT, () => {
  runTests();
});
