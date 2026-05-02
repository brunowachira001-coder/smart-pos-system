// Test SMS Leopard with common default sender IDs
require('dotenv').config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SMSLEOPARD_ACCESS_TOKEN;
const TEST_PHONE = '254743794815';
const TEST_MESSAGE = 'Test from Nyla Wigs POS - Your SMS system is working!';

// Common default sender IDs used by SMS providers
const COMMON_SENDERS = [
  'SMSLEOPARD',
  'INFO',
  'ALERTS',
  'SMS',
  'NOTIFY',
  '23456',  // Generic shortcode
  'SENDER'
];

async function testSender(senderName) {
  console.log(`\n🧪 Testing with sender: "${senderName}"`);
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Decode credentials
    const decoded = Buffer.from(ACCESS_TOKEN, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    const response = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        message: TEST_MESSAGE,
        recipients: [{ phone_number: TEST_PHONE }],
        source: senderName
      })
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log(`\n✅ SUCCESS! Sender "${senderName}" works!`);
      console.log('📱 Check your phone (0743794815) for the message');
      console.log('\n🎉 Found working sender ID!');
      console.log(`\nUse this sender ID: ${senderName}`);
      return true;
    } else if (result.message && result.message.includes('not assigned')) {
      console.log(`❌ Sender "${senderName}" not approved`);
    } else {
      console.log(`❌ Failed: ${result.message}`);
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing Common Default Sender IDs\n');
  console.log('This will try common sender IDs that might work by default...\n');
  
  for (const sender of COMMON_SENDERS) {
    const success = await testSender(sender);
    if (success) {
      return; // Stop if we find one that works
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n\n❌ None of the common sender IDs worked');
  console.log('\n📞 You need to:');
  console.log('1. Contact SMS Leopard support: support@smsleopard.com');
  console.log('2. Ask them: "What sender ID can I use? I want to register NYLAWIGS"');
  console.log('3. Or register NYLAWIGS in your dashboard and wait for approval');
  console.log('\n💡 Alternative: Switch to Africa\'s Talking (same price, easier setup)');
}

runTests();
