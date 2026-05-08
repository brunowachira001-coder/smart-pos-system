// Test script to activate Africa's Talking account
// Run this with: node test-activate-account.js

const AfricasTalking = require('africastalking')({
  apiKey: 'atsk_eff3a4e2e08357a814e1ffe1b3d66c96fddc7067fb2e5213845e6e3ad3159900c2ac512e',
  username: 'sandbox'
});

const sms = AfricasTalking.SMS;

// IMPORTANT: Replace this with an AIRTEL or TELKOM number (NOT Safaricom)
// Format: +254XXXXXXXXX
// Airtel: 071X, 073X, 075X | Telkom: 077X
const TEST_PHONE = '+254789715533'; // Your Airtel number - READY TO TEST!

async function activateAccount() {
  try {
    console.log('Sending activation SMS to:', TEST_PHONE);
    console.log('Note: This must be an Airtel or Telkom number\n');

    const result = await sms.send({
      to: [TEST_PHONE],
      message: 'Test message from Nyla Wigs POS System - Account Activation',
      // No 'from' field since we don't have approved sender ID yet
    });

    console.log('✅ SUCCESS! Account should now be activated!');
    console.log('\nResponse:', JSON.stringify(result, null, 2));
    console.log('\nYou can now send SMS to any network (Safaricom, Airtel, Telkom)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

activateAccount();
