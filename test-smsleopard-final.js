// Final SMS Leopard Test - Correct format
require('dotenv').config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SMSLEOPARD_ACCESS_TOKEN;
const SENDER_ID = 'NYLAWIGS';
const TEST_PHONE = '254743794815';
const TEST_MESSAGE = 'Hello from NYLAWIGS! 🎉 Your SMS system is now working perfectly with SMS Leopard. Cost: Only KSH 0.80 per message!';

async function sendSMS() {
  console.log('🚀 Sending SMS via SMS Leopard\n');

  // Decode the base64 token to get username:password
  const decoded = Buffer.from(ACCESS_TOKEN, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  console.log('✅ Credentials decoded');
  console.log('📱 Sending to:', TEST_PHONE);
  console.log('💬 Message:', TEST_MESSAGE);
  console.log('📤 Sender:', SENDER_ID);
  console.log('💰 Cost: KSH 0.80');
  console.log('');

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Use Basic Auth with decoded credentials
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
        recipients: [{ phone_number: TEST_PHONE }]
        // No source field - will use default sender
      })
    });

    const result = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    console.log('');

    if (response.ok && result.success) {
      console.log('✅ SUCCESS! SMS sent via SMS Leopard!');
      console.log('📱 Check your phone (0743794815) for the message');
      console.log('');
      console.log('🎉 Your SMS system is ready!');
      console.log('');
      console.log('💰 Cost Comparison:');
      console.log('   SMS Leopard: KSH 0.80/SMS ✅');
      console.log('   Twilio: KSH 6.50/SMS');
      console.log('   You save: KSH 5.70 per SMS!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Update Vercel environment variables');
      console.log('2. Deploy to production');
      console.log('3. Start sending SMS to customers!');
    } else {
      console.log('❌ FAILED:', result.message || 'Unknown error');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Check sender ID is approved in dashboard');
      console.log('2. Verify account has credit');
      console.log('3. Contact support@smsleopard.com');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendSMS();
