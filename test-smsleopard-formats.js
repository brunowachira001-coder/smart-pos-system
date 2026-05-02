// Test different SMS Leopard authentication formats
require('dotenv').config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SMSLEOPARD_ACCESS_TOKEN;
const KEY_NAME = 'NEW_KEY'; // New key generated
const SENDER_ID = 'NYLAWIGS';
const TEST_PHONE = '254743794815';
const TEST_MESSAGE = 'Test from SMS Leopard - Authentication test';

async function testFormat(formatName, headers, body) {
  console.log(`\n🧪 Testing Format: ${formatName}`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Body:', JSON.stringify(body, null, 2));
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ SUCCESS! This format works!');
      return true;
    } else {
      console.log('❌ Failed:', result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing SMS Leopard Authentication Formats\n');
  console.log('Access Token:', ACCESS_TOKEN.substring(0, 20) + '...');
  console.log('Key Name:', KEY_NAME);
  console.log('');

  // Format 1: Bearer with access token
  await testFormat(
    'Format 1: Bearer Token',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    {
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  // Format 2: API Key header
  await testFormat(
    'Format 2: X-API-Key Header',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Key': ACCESS_TOKEN
    },
    {
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  // Format 3: Key name + token
  await testFormat(
    'Format 3: Key Name + Token',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${KEY_NAME}:${ACCESS_TOKEN}`
    },
    {
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  // Format 4: Basic auth with key name
  const basicAuth = Buffer.from(`${KEY_NAME}:${ACCESS_TOKEN}`).toString('base64');
  await testFormat(
    'Format 4: Basic Auth (Key:Token)',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    {
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  // Format 5: Just the key name as Bearer
  await testFormat(
    'Format 5: Bearer with Key Name',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${KEY_NAME}`
    },
    {
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  // Format 6: API key in body
  await testFormat(
    'Format 6: API Key in Body',
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    {
      api_key: ACCESS_TOKEN,
      message: TEST_MESSAGE,
      recipients: [{ phone_number: TEST_PHONE }],
      sender_name: SENDER_ID
    }
  );

  console.log('\n\n📋 Summary:');
  console.log('If none of these worked, we need to:');
  console.log('1. Check SMS Leopard API documentation');
  console.log('2. Contact their support for correct authentication format');
  console.log('3. Or try a different SMS provider (Twilio, Africa\'s Talking)');
}

runTests();
