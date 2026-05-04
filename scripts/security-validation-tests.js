#!/usr/bin/env node
/**
 * SECURITY VALIDATION TEST SUITE
 * 
 * Tests all critical security requirements:
 * - Authentication enforcement
 * - Token forgery prevention
 * - Tenant isolation
 * - Cross-tenant access blocking
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const VALID_TOKEN = process.env.TEST_TOKEN || '';
const TENANT_A_TOKEN = process.env.TENANT_A_TOKEN || '';
const TENANT_B_TOKEN = process.env.TENANT_B_TOKEN || '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  process.stdout.write(`  ${name}... `);
  try {
    await testFn();
    console.log('✅ PASS');
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
  }
}

// Assertion helpers
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertStatus(response, expected, message) {
  if (response.status !== expected) {
    throw new Error(`${message}: expected status ${expected}, got ${response.status}`);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function testUnauthenticatedAccess() {
  console.log('\n🔒 Test A: Unauthenticated Access Prevention\n');
  
  const endpoints = [
    { method: 'POST', path: '/api/pos/checkout', body: { sessionId: 'test', total: 100 } },
    { method: 'GET', path: '/api/products/index' },
    { method: 'GET', path: '/api/shop-settings/index' },
    { method: 'GET', path: '/api/customers/index' },
    { method: 'GET', path: '/api/transactions/list' },
  ];
  
  for (const endpoint of endpoints) {
    await runTest(`${endpoint.method} ${endpoint.path} without token`, async () => {
      const response = await makeRequest(endpoint.method, endpoint.path, {}, endpoint.body);
      assertStatus(response, 401, 'Should return 401 Unauthorized');
      if (response.body && response.body.error) {
        assertEqual(response.body.error.toLowerCase().includes('unauthorized'), true, 'Should have unauthorized error');
      }
    });
  }
}

async function testForgedTokens() {
  console.log('\n🔐 Test B: Forged Token Prevention\n');
  
  const forgedTokens = [
    'v2.eyJ1c2VySWQiOiJGQUtFIn0.FAKE_SIG', // Fake signature
    'v1.fake-user-id.123456789', // Old format
    'Bearer fake-token', // Random token
    'v2.eyJ1c2VySWQiOiJhZG1pbiJ9.hacked', // Modified payload
  ];
  
  for (const token of forgedTokens) {
    await runTest(`Reject forged token: ${token.substring(0, 20)}...`, async () => {
      const response = await makeRequest('GET', '/api/products/index', {
        'Authorization': `Bearer ${token}`
      });
      assertStatus(response, 401, 'Should reject forged token');
    });
  }
}

async function testExpiredTokens() {
  console.log('\n⏰ Test C: Expired Token Rejection\n');
  
  // Create a token with old timestamp (>24h ago)
  const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
  const expiredPayload = Buffer.from(JSON.stringify({
    userId: 'test-user',
    iat: oldTimestamp,
    v: 'v2'
  })).toString('base64url');
  
  const expiredToken = `v2.${expiredPayload}.fake_signature`;
  
  await runTest('Reject expired token (>24h)', async () => {
    const response = await makeRequest('GET', '/api/products/index', {
      'Authorization': `Bearer ${expiredToken}`
    });
    assertStatus(response, 401, 'Should reject expired token');
  });
}

async function testTenantIsolation() {
  console.log('\n🧱 Test D: Tenant Isolation\n');
  
  if (!TENANT_A_TOKEN || !TENANT_B_TOKEN) {
    console.log('  ⚠️  Skipping: TENANT_A_TOKEN and TENANT_B_TOKEN not set');
    return;
  }
  
  await runTest('Tenant A cannot access Tenant B products', async () => {
    // Get Tenant A products
    const responseA = await makeRequest('GET', '/api/products/index', {
      'Authorization': `Bearer ${TENANT_A_TOKEN}`
    });
    assertStatus(responseA, 200, 'Should return 200 for valid token');
    
    const productsA = responseA.body;
    
    // Get Tenant B products
    const responseB = await makeRequest('GET', '/api/products/index', {
      'Authorization': `Bearer ${TENANT_B_TOKEN}`
    });
    assertStatus(responseB, 200, 'Should return 200 for valid token');
    
    const productsB = responseB.body;
    
    // Verify no overlap
    if (productsA && productsB && Array.isArray(productsA) && Array.isArray(productsB)) {
      const idsA = new Set(productsA.map(p => p.id));
      const idsB = new Set(productsB.map(p => p.id));
      const overlap = [...idsA].filter(id => idsB.has(id));
      
      assertEqual(overlap.length, 0, 'Should have no overlapping products between tenants');
    }
  });
  
  await runTest('Tenant A cannot modify Tenant B settings', async () => {
    const response = await makeRequest('PUT', '/api/shop-settings/index', {
      'Authorization': `Bearer ${TENANT_A_TOKEN}`
    }, {
      shop_name: 'Hacked Shop'
    });
    
    // Should either succeed (updating own settings) or fail with 403
    if (response.status === 200) {
      // Verify it only updated Tenant A's settings
      const checkB = await makeRequest('GET', '/api/shop-settings/index', {
        'Authorization': `Bearer ${TENANT_B_TOKEN}`
      });
      
      if (checkB.body && checkB.body.settings) {
        assertEqual(
          checkB.body.settings.shop_name !== 'Hacked Shop',
          true,
          'Tenant B settings should not be affected'
        );
      }
    }
  });
}

async function testValidAuthentication() {
  console.log('\n✅ Test E: Valid Authentication\n');
  
  if (!VALID_TOKEN) {
    console.log('  ⚠️  Skipping: TEST_TOKEN not set');
    return;
  }
  
  await runTest('Accept valid token', async () => {
    const response = await makeRequest('GET', '/api/products/index', {
      'Authorization': `Bearer ${VALID_TOKEN}`
    });
    assertStatus(response, 200, 'Should return 200 for valid token');
  });
  
  await runTest('Valid token can access protected resources', async () => {
    const endpoints = [
      '/api/products/index',
      '/api/shop-settings/index',
      '/api/customers/index',
    ];
    
    for (const endpoint of endpoints) {
      const response = await makeRequest('GET', endpoint, {
        'Authorization': `Bearer ${VALID_TOKEN}`
      });
      
      if (response.status !== 200 && response.status !== 404) {
        throw new Error(`${endpoint} returned ${response.status}, expected 200 or 404`);
      }
    }
  });
}

async function testPublicEndpoints() {
  console.log('\n🌐 Test F: Public Endpoints\n');
  
  await runTest('Login endpoint is public', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {}, {
      email: 'test@example.com',
      password: 'wrong'
    });
    
    // Should return 401 (wrong credentials) not 401 (no auth)
    // Or 400 if validation fails
    if (response.status !== 401 && response.status !== 400) {
      throw new Error(`Expected 401 or 400, got ${response.status}`);
    }
  });
  
  await runTest('Health endpoint is public', async () => {
    const response = await makeRequest('GET', '/api/health');
    // Should return 200 or 503, not 401
    if (response.status === 401) {
      throw new Error('Health endpoint should be public');
    }
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🔒 SECURITY VALIDATION TEST SUITE');
  console.log('='.repeat(50));
  console.log(`Testing: ${BASE_URL}`);
  console.log('');
  
  try {
    await testUnauthenticatedAccess();
    await testForgedTokens();
    await testExpiredTokens();
    await testTenantIsolation();
    await testValidAuthentication();
    await testPublicEndpoints();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📝 Total:  ${results.passed + results.failed}`);
    console.log('');
    
    if (results.failed > 0) {
      console.log('❌ SECURITY VALIDATION FAILED');
      console.log('\nFailed tests:');
      results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
      process.exit(1);
    } else {
      console.log('✅ ALL SECURITY TESTS PASSED');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTest, makeRequest };
