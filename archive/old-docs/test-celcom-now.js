// Test Celcom SMS with Credits
// Run: node test-celcom-now.js [phone_number]

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testCelcomSMS() {
  const apiKey = process.env.CELCOM_API_KEY;
  const partnerID = process.env.CELCOM_PARTNER_ID;
  const shortcode = process.env.CELCOM_SENDER_ID || 'TEXTME';

  // Get phone number from command line or use default
  const testPhone = process.argv[2] || '254737948415';

  console.log('📱 Testing Celcom SMS with New Credits\n');
  console.log('Configuration:');
  console.log('- API Key:', apiKey);
  console.log('- Partner ID:', partnerID);
  console.log('- Sender ID:', shortcode);
  console.log('- Test Phone:', testPhone);
  console.log('');

  if (!apiKey || !partnerID) {
    console.error('❌ Missing credentials!');
    return;
  }

  // Step 1: Check balance
  console.log('💰 Step 1: Checking account balance...');
  try {
    const balanceResponse = await axios.post(
      'https://isms.celcomafrica.com/api/services/getbalance/',
      {
        partnerID: partnerID,
        apikey: apiKey
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Balance Response:', JSON.stringify(balanceResponse.data, null, 2));
    
    if (balanceResponse.data.credit) {
      const balance = parseFloat(balanceResponse.data.credit);
      console.log(`\n💵 Current Balance: KSH ${balance.toFixed(2)}`);
      
      if (balance < 1) {
        console.log('⚠️  WARNING: Balance is less than KSH 1.00 (cost per SMS)');
        console.log('   You may not be able to send SMS messages.');
        return;
      } else {
        console.log(`✅ Sufficient balance! You can send ~${Math.floor(balance)} SMS messages`);
      }
    }
  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(60));

  // Step 2: Send test SMS
  console.log('\n📤 Step 2: Sending test SMS...');
  const testMessage = 'Test from Smart POS - Your SMS system is working!';
  
  try {
    const response = await axios.post(
      'https://isms.celcomafrica.com/api/services/sendsms/',
      {
        partnerID: partnerID,
        apikey: apiKey,
        mobile: testPhone,
        message: testMessage,
        shortcode: shortcode,
        pass_type: 'plain'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📊 SMS Response:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.responses && response.data.responses.length > 0) {
      const result = response.data.responses[0];
      const responseCode = result['response-code'] || result['respose-code'];
      
      if (responseCode === 200) {
        console.log('\n✅ SUCCESS! SMS sent successfully!');
        console.log('📱 Message ID:', result.messageid);
        console.log('📞 Sent to:', testPhone);
        console.log('💬 Message:', testMessage);
        console.log('\n🎉 Your SMS system is now working!');
      } else if (responseCode === 402) {
        console.log('\n❌ FAILED: Insufficient balance');
        console.log('💰 Current balance:', result['response-description']);
        console.log('💡 Please top up your Celcom account');
      } else {
        console.log('\n❌ FAILED:', result['response-description']);
      }
    }

  } catch (error) {
    console.error('\n❌ SMS send failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nNEXT STEPS:');
  console.log('1. If successful, try sending from the Customer Messages page');
  console.log('2. Check customer\'s phone to confirm delivery');
  console.log('3. Monitor your Celcom balance at: https://isms.celcomafrica.com/');
  console.log('');
}

testCelcomSMS().catch(console.error);
