// SMS Service - Main entry point
// Automatically uses the provider specified in SMS_PROVIDER env variable

import africasTalkingSMS from './africastalking-sms.service';
import smsLeopardService from './smsleopard-sms.service';
import mobitechSMS from './mobitech-sms.service';
import celcomSMS from './celcom-sms.service';

const provider = process.env.SMS_PROVIDER || 'celcom';

console.log('SMS Service initialized with provider:', provider);

// Export the appropriate service based on environment variable
const services: Record<string, any> = {
  africastalking: africasTalkingSMS,
  smsleopard: smsLeopardService,
  mobitech: mobitechSMS,
  celcom: celcomSMS,
};

export default services[provider] || celcomSMS;
