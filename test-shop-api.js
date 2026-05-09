const https = require('https');

async function testAPI(url, description) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n${description}`);
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ Success:`, JSON.stringify(json).substring(0, 100) + '...');
          } catch (e) {
            console.log(`✅ Success (HTML response)`);
          }
        } else {
          console.log(`❌ Error: ${res.statusCode}`);
          console.log(data.substring(0, 200));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`\n${description}`);
      console.log(`❌ Error:`, err.message);
      resolve();
    });
  });
}

async function runTests() {
  console.log('\n🔍 TESTING SHOP DEPLOYMENT\n');
  console.log('='.repeat(60));

  await testAPI(
    'https://smart-pos-system.vercel.app/api/tenant/by-slug/nylawigs',
    '1. Testing Tenant API'
  );

  await testAPI(
    'https://smart-pos-system.vercel.app/api/ecommerce/products/simple?tenantSlug=nylawigs&limit=5',
    '2. Testing Products API'
  );

  await testAPI(
    'https://smart-pos-system.vercel.app/api/ecommerce/flash-deals?tenantSlug=nylawigs',
    '3. Testing Flash Deals API'
  );

  await testAPI(
    'https://smart-pos-system.vercel.app/shop/nylawigs',
    '4. Testing Shop Page'
  );

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 If APIs work but page shows 404:');
  console.log('   1. Wait 2-3 minutes for Vercel deployment');
  console.log('   2. Clear browser cache (Ctrl+Shift+R)');
  console.log('   3. Try incognito/private window\n');
}

runTests();
