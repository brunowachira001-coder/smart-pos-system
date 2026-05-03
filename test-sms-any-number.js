// Test Africa's Talking with any phone number
require('dotenv').config({ path: '.env.local' });

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('❌ Please provide a phone number');
  console.log('Usage: node test-sms-any-number.js 0712345678');
  console.log('   or: node test-sms-any-number.js 254712345678');
  process.exit(1);
}

// Format phone number
let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
if (formattedPhone.startsWith('0')) {
  formattedPhone = '254' + formattedPhone.substring(1);
}
if (!formattedPhone.startsWith('+')) {
  formattedPhone = '+' + formattedPhone;
}

async function testSMS() {
  console.log('🧪 Testing Africa\'s Talking SMS\n');

  const username = process.env.AFRICASTALKING_USERNAME;
  const apiKey = process.env.AFRICASTALKING_API_KEY;

  console.log('✅ Configuration:');
  console.log('   Username:', username);
  console.log('   Test Phone:', formattedPhone);
  console.log('');

  try {
    const AfricasTalking = require('africastalking');
    const africastalking = AfricasTalking({
      apiKey: apiKey,
      username: username
    });

    const sms = africastalking.SMS;

    console.log('📱 Sending test SMS...\n');

    const result = await sms.send({
      to: [formattedPhone],
      message: 'Hello! This is a test message from Nyla Wigs. Your SMS system is working! 🎉',
    });

    console.log('📥 Response:', JSON.stringify(result, null, 2));
    console.log('');

    if (result.SMSMessageData && result.SMSMessageData.Recipients && result.SMSMessageData.Recipients.length > 0) {
      const recipient = result.SMSMessageData.Recipients[0];
      
      console.log('Status:', recipient.status);
      console.log('Status Code:', recipient.statusCode);
      
      if (recipient.status === 'Success') {
        console.log('\n✅ SUCCESS! SMS sent successfully!');
        console.log('📱 Check phone ' + formattedPhone + ' for the message');
        console.log('💰 Cost: KES', recipient.cost);
        console.log('🆔 Message ID:', recipient.messageId);
      } else {
        console.log('\n❌ Failed:', recipient.status);
        
        if (recipient.status === 'UserInBlacklist') {
          console.log('\n💡 Solution: Remove this number from blacklist in your dashboard');
          console.log('   Go to: SMS → Blacklist → Remove ' + formattedPhone);
        }
      }
    } else {
      console.log('❌ No recipients in response');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testSMS();
