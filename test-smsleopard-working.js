// Test SMS Leopard with correct format
require('dotenv').config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SMSLEOPARD_ACCESS_TOKEN;
const TEST_PHONE = '254743794815';
const TEST_MESSAGE = 'Hello from Nyla Wigs! 🎉 Your SMS system is working perfectly with SMS Leopard. Only KSH 0.80 per message!';

async function sendSMS() {
  console.log('🚀 Sending SMS via SMS Leopard\n');

  // Decode credentials
  const decoded = Buffer.from(ACCESS_TOKEN, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  console.log('✅ Credentials decoded');
  console.log('📱 Sending to:', TEST_PHONE);
  console.log('💬 Message:', TEST_MESSAGE);
  console.log('📤 Sender: SMSLEOPARD (default)');
  console.log('💰 Cost: KSH 0.80');
  console.log('');

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Try with different recipient formats
    const formats = [
      {
        name: 'Format 1: recipients array with phone_number',
        body: {
          message: TEST_MESSAGE,
          recipients: [{ phone_number: TEST_PHONE }],
          source: 'SMSLEOPARD'
        }
      },
      {
        name: 'Format 2: destination string',
        body: {
          message: TEST_MESSAGE,
          destination: TEST_PHONE,
          source: 'SMSLEOPARD'
        }
      },
      {
        name: 'Format 3: recipients array with number',
        body: {
          message: TEST_MESSAGE,
          recipients: [{ number: TEST_PHONE }],
          source: 'SMSLEOPARD'
        }
      },
      {
        name: 'Format 4: recipients as phone array',
        body: {
          message: TEST_MESSAGE,
          recipients: [TEST_PHONE],
          source: 'SMSLEOPARD'
        }
      }
    ];

    for (const format of formats) {
      console.log(`\n🧪 Testing: ${format.name}`);
      console.log('Body:', JSON.stringify(format.body, null, 2));
      
      const response = await fetch('https://api.smsleopard.com/v1/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify(format.body)
      });

      const result = await response.json();
      
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (response.ok && result.success) {
        console.log('\n✅ SUCCESS! SMS sent via SMS Leopard!');
        console.log('📱 Check your phone (0743794815) for the message');
        console.log('\n🎉 Your SMS system is ready!');
        console.log('\n💰 Cost: KSH 0.80 per SMS');
        console.log('\n📋 Working format:', format.name);
        return;
      }
    }

    console.log('\n❌ All formats failed');
    console.log('\n📞 Contact SMS Leopard support for help');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendSMS();
