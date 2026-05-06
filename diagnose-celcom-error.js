// Diagnose Celcom SMS Error
// Run: node diagnose-celcom-error.js

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function diagnoseCelcomError() {
  const apiKey = process.env.CELCOM_API_KEY;
  const partnerID = process.env.CELCOM_PARTNER_ID;
  const shortcode = process.env.CELCOM_SENDER_ID || 'TEXTME';

  console.log('🔍 Diagnosing Celcom SMS Error...\n');
  console.log('Current Configuration:');
  console.log('- API Key:', apiKey);
  console.log('- Partner ID:', partnerID);
  console.log('- Sender ID:', shortcode);
  console.log('');

  if (!apiKey || !partnerID) {
    console.error('❌ Missing credentials!');
    return;
  }

  // Test with exact same format as your failed messages
  const testPhone = '254737948415'; // From your SQL results
  const testMessage = 'Test message from Smart POS';

  console.log('📱 Sending test SMS...');
  console.log('To:', testPhone);
  console.log('Message:', testMessage);
  console.log('');

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
        },
        validateStatus: () => true // Don't throw on any status
      }
    );

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.status === 422) {
      console.log('❌ ERROR 422: Unprocessable Entity');
      console.log('This usually means:');
      console.log('1. Invalid API credentials');
      console.log('2. Wrong request format');
      console.log('3. Invalid phone number format');
      console.log('4. Sender ID not approved');
      console.log('');
    }

    if (response.status === 401) {
      console.log('❌ ERROR 401: Unauthorized');
      console.log('This means:');
      console.log('1. API Key is incorrect');
      console.log('2. Partner ID is incorrect');
      console.log('3. Account is not active');
      console.log('');
    }

    // Try to get balance to verify credentials
    console.log('💰 Checking account balance...');
    const balanceResponse = await axios.post(
      'https://isms.celcomafrica.com/api/services/getbalance/',
      {
        partnerID: partnerID,
        apikey: apiKey
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      }
    );

    console.log('Balance Response Status:', balanceResponse.status);
    console.log('Balance Response Data:', JSON.stringify(balanceResponse.data, null, 2));
    console.log('');

    if (balanceResponse.status === 200) {
      console.log('✅ Credentials are valid!');
      console.log('The issue might be with:');
      console.log('- Phone number format');
      console.log('- Sender ID not approved');
      console.log('- Message content');
    } else {
      console.log('❌ Credentials verification failed!');
      console.log('Please check your API Key and Partner ID');
    }

  } catch (error) {
    console.error('❌ Request Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Verify your Celcom credentials at: https://isms.celcomafrica.com/');
  console.log('2. Check if your sender ID "TEXTME" is approved');
  console.log('3. Ensure your account has sufficient balance');
  console.log('4. Contact Celcom support if credentials are correct');
  console.log('');
}

diagnoseCelcomError().catch(console.error);
