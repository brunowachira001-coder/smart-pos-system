// Test Twilio SMS Integration
// Make sure you have your Twilio credentials in .env.local

require('dotenv').config({ path: '.env.local' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function testTwilioSMS() {
  console.log('🧪 Testing Twilio SMS Integration...\n');

  // Check credentials
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log('❌ ERROR: Twilio credentials not found in .env.local\n');
    console.log('Please add these to your .env.local file:');
    console.log('TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"');
    console.log('TWILIO_AUTH_TOKEN="your_auth_token_here"');
    console.log('TWILIO_PHONE_NUMBER="+15551234567"');
    console.log('\nGet your credentials from: https://console.twilio.com');
    return;
  }

  console.log('✅ Credentials found:');
  console.log('   Account SID:', TWILIO_ACCOUNT_SID.substring(0, 10) + '...');
  console.log('   Auth Token:', TWILIO_AUTH_TOKEN.substring(0, 10) + '...');
  console.log('   From Number:', TWILIO_PHONE_NUMBER);
  console.log('');

  const testPhone = '+254743794815'; // Your phone number
  const testMessage = 'Hello from Nyla Wigs! 🎉 Your SMS system is now working with Twilio. This is a test message from your POS system.';

  console.log('📱 Sending to:', testPhone);
  console.log('💬 Message:', testMessage);
  console.log('📤 From:', TWILIO_PHONE_NUMBER);
  console.log('');

  try {
    // Create Basic Auth header
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: testPhone,
        From: TWILIO_PHONE_NUMBER,
        Body: testMessage
      })
    });

    const result = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    console.log('');

    if (response.ok && (result.status === 'queued' || result.status === 'sent' || result.status === 'delivered')) {
      console.log('✅ SUCCESS! SMS sent via Twilio');
      console.log('📱 Check your phone (0743794815) for the message');
      console.log('');
      console.log('📊 Message Details:');
      console.log('   Message SID:', result.sid);
      console.log('   Status:', result.status);
      console.log('   Price:', result.price || 'Calculating...');
      console.log('   Direction:', result.direction);
      console.log('');
      console.log('🎉 Your SMS system is ready!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Update Vercel environment variables with Twilio credentials');
      console.log('2. Set SMS_PROVIDER=twilio in Vercel');
      console.log('3. Deploy to production');
      console.log('4. Start sending SMS to customers!');
      
      if (result.status === 'queued') {
        console.log('');
        console.log('ℹ️  Note: Message is queued. It will be delivered shortly.');
        console.log('   Trial accounts may take a few seconds to deliver.');
      }
    } else {
      console.log('❌ FAILED:', result.message || 'Unknown error');
      console.log('');
      
      if (result.code === 21211) {
        console.log('⚠️  Error 21211: Invalid phone number');
        console.log('');
        console.log('Solutions:');
        console.log('1. Make sure the phone number is verified in Twilio console');
        console.log('2. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        console.log('3. Add +254743794815 as a verified caller ID');
        console.log('4. Verify with the code they send');
        console.log('5. Run this test again');
      } else if (result.code === 21608) {
        console.log('⚠️  Error 21608: Unverified number (Trial account)');
        console.log('');
        console.log('Solutions:');
        console.log('1. Verify your phone number in Twilio console');
        console.log('2. OR upgrade your account to send to any number');
        console.log('   Go to: https://console.twilio.com/billing');
      } else if (result.code === 20003) {
        console.log('⚠️  Error 20003: Authentication failed');
        console.log('');
        console.log('Solutions:');
        console.log('1. Check your Account SID is correct');
        console.log('2. Check your Auth Token is correct');
        console.log('3. Get them from: https://console.twilio.com');
      } else {
        console.log('Error code:', result.code);
        console.log('Error details:', result.more_info);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Twilio credentials are correct');
    console.log('3. Make sure you have node-fetch installed: npm install node-fetch');
  }
}

testTwilioSMS();
