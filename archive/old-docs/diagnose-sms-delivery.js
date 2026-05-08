// Diagnose SMS Delivery Issues
// Run: node diagnose-sms-delivery.js [phone_number]

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function diagnoseSMSDelivery() {
  const apiKey = process.env.CELCOM_API_KEY;
  const partnerID = process.env.CELCOM_PARTNER_ID;
  const shortcode = process.env.CELCOM_SENDER_ID || 'TEXTME';

  // Get phone number from command line
  const customerPhone = process.argv[2];

  if (!customerPhone) {
    console.log('❌ Please provide a phone number');
    console.log('Usage: node diagnose-sms-delivery.js 0712345678');
    console.log('   or: node diagnose-sms-delivery.js 254712345678');
    return;
  }

  console.log('🔍 SMS Delivery Diagnostic Tool\n');
  console.log('Customer Phone (as entered):', customerPhone);
  console.log('');

  // Format phone number
  function formatPhone(phone) {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  }

  const formattedPhone = formatPhone(customerPhone);
  console.log('✅ Formatted Phone:', formattedPhone);
  console.log('');

  // Validate phone number
  if (!formattedPhone.match(/^254[17]\d{8}$/)) {
    console.log('⚠️  WARNING: Phone number format looks unusual');
    console.log('   Expected: 254 + 7XX XXX XXX or 254 + 1XX XXX XXX');
    console.log('   Got:', formattedPhone);
    console.log('');
  }

  // Check balance
  console.log('💰 Checking Celcom balance...');
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

    const balance = parseFloat(balanceResponse.data.credit);
    console.log(`✅ Balance: KSH ${balance.toFixed(2)}`);
    
    if (balance < 1) {
      console.log('❌ Insufficient balance to send SMS!');
      return;
    }
  } catch (error) {
    console.error('❌ Failed to check balance:', error.message);
    return;
  }

  console.log('');
  console.log('📤 Sending test SMS to customer...');
  console.log('To:', formattedPhone);
  console.log('');

  // Send test SMS
  try {
    const testMessage = `Hello! This is a test message from your shop. If you receive this, SMS is working correctly.`;
    
    const response = await axios.post(
      'https://isms.celcomafrica.com/api/services/sendsms/',
      {
        partnerID: partnerID,
        apikey: apiKey,
        mobile: formattedPhone,
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

    console.log('📊 API Response:', JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.data && response.data.responses && response.data.responses.length > 0) {
      const result = response.data.responses[0];
      const responseCode = result['response-code'] || result['respose-code'];
      
      if (responseCode === 200) {
        console.log('✅ SMS SENT SUCCESSFULLY!');
        console.log('📱 Message ID:', result.messageid);
        console.log('📞 Sent to:', formattedPhone);
        console.log('');
        console.log('⏰ Wait 1-2 minutes for delivery');
        console.log('');
        console.log('If customer still doesn\'t receive it:');
        console.log('1. Verify the phone number is correct');
        console.log('2. Check if customer\'s phone is on and has signal');
        console.log('3. Try sending to your own phone to test');
        console.log('4. Check Celcom dashboard for delivery status');
        console.log('   https://isms.celcomafrica.com/');
        
        // Get delivery report after 10 seconds
        console.log('');
        console.log('⏳ Waiting 10 seconds to check delivery status...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('📊 Checking delivery report...');
        try {
          const dlrResponse = await axios.post(
            'https://isms.celcomafrica.com/api/services/getdlr/',
            {
              partnerID: partnerID,
              apikey: apiKey,
              messageID: result.messageid
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Delivery Report:', JSON.stringify(dlrResponse.data, null, 2));
        } catch (dlrError) {
          console.log('⚠️  Could not fetch delivery report (this is normal for recent messages)');
        }
        
      } else if (responseCode === 402) {
        console.log('❌ FAILED: Insufficient balance');
        console.log(result['response-description']);
      } else {
        console.log('❌ FAILED:', result['response-description']);
        console.log('Response Code:', responseCode);
      }
    }

  } catch (error) {
    console.error('❌ SMS send failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('TROUBLESHOOTING TIPS:');
  console.log('='.repeat(60));
  console.log('1. Verify phone number with customer');
  console.log('2. Try sending to your own phone first');
  console.log('3. Check if phone is a Kenyan number (254...)');
  console.log('4. Some networks have delays (wait 5 minutes)');
  console.log('5. Check Celcom dashboard for delivery reports');
  console.log('');
}

diagnoseSMSDelivery().catch(console.error);
