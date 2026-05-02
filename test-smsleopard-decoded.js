// Test SMS Leopard with decoded credentials
require('dotenv').config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SMSLEOPARD_ACCESS_TOKEN;
const SENDER_ID = 'NYLAWIGS';
const TEST_PHONE = '254743794815';
const TEST_MESSAGE = 'Hello from NYLAWIGS! 🎉 Your SMS system is working! This message costs only KSH 0.80.';

async function testWithDecodedCredentials() {
  console.log('🧪 Testing SMS Leopard with Decoded Credentials\n');

  // Decode the base64 token
  const decoded = Buffer.from(ACCESS_TOKEN, 'base64').toString('utf-8');
  console.log('✅ Decoded credentials:', decoded.substring(0, 20) + '...');
  console.log('');

  const [username, password] = decoded.split(':');
  console.log('📝 Username:', username);
  console.log('📝 Password:', password.substring(0, 10) + '...');
  console.log('');

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Basic Auth with decoded credentials
    console.log('🧪 Test 1: Basic Auth with decoded username:password');
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    const response1 = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        message: TEST_MESSAGE,
        recipients: [{ phone_number: TEST_PHONE }],
        sender_name: SENDER_ID
      })
    });

    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    
    if (response1.ok && result1.success) {
      console.log('\n✅ SUCCESS! SMS sent with Basic Auth!');
      console.log('📱 Check your phone (0743794815) for the message!');
      console.log('\n🎉 Your SMS system is ready!');
      return;
    }
    console.log('❌ Basic Auth failed\n');

    // Test 2: Bearer with username only
    console.log('🧪 Test 2: Bearer with username');
    const response2 = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${username}`
      },
      body: JSON.stringify({
        message: TEST_MESSAGE,
        recipients: [{ phone_number: TEST_PHONE }],
        sender_name: SENDER_ID
      })
    });

    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
    
    if (response2.ok && result2.success) {
      console.log('\n✅ SUCCESS! SMS sent with Bearer username!');
      console.log('📱 Check your phone (0743794815) for the message!');
      return;
    }
    console.log('❌ Bearer username failed\n');

    // Test 3: API key as username in body
    console.log('🧪 Test 3: Username as api_key in body');
    const response3 = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        api_key: username,
        api_secret: password,
        message: TEST_MESSAGE,
        recipients: [{ phone_number: TEST_PHONE }],
        sender_name: SENDER_ID
      })
    });

    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(result3, null, 2));
    
    if (response3.ok && result3.success) {
      console.log('\n✅ SUCCESS! SMS sent with api_key/api_secret!');
      console.log('📱 Check your phone (0743794815) for the message!');
      return;
    }
    console.log('❌ API key/secret in body failed\n');

    console.log('\n❌ All authentication methods failed');
    console.log('\n📞 Next Steps:');
    console.log('1. Check SMS Leopard API documentation');
    console.log('2. Contact support@smsleopard.com');
    console.log('3. Or switch to Africa\'s Talking (same price, better docs)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithDecodedCredentials();
