import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint helps debug environment variables on Vercel
  
  const smsProvider = process.env.SMS_PROVIDER;
  const apiKey = process.env.CELCOM_API_KEY;
  const partnerId = process.env.CELCOM_PARTNER_ID;
  const senderId = process.env.CELCOM_SENDER_ID;
  const testMode = process.env.SMS_TEST_MODE;

  // Check for common issues
  const issues = [];
  
  if (!smsProvider) issues.push('SMS_PROVIDER not set');
  if (smsProvider && smsProvider !== 'celcom') issues.push(`SMS_PROVIDER is "${smsProvider}" but should be "celcom"`);
  if (smsProvider && (smsProvider.startsWith('"') || smsProvider.startsWith("'"))) issues.push('SMS_PROVIDER has quotes around it');
  if (smsProvider && (smsProvider.startsWith(' ') || smsProvider.endsWith(' '))) issues.push('SMS_PROVIDER has spaces around it');
  
  if (!apiKey) issues.push('CELCOM_API_KEY not set');
  if (apiKey && (apiKey.startsWith('"') || apiKey.startsWith("'"))) issues.push('CELCOM_API_KEY has quotes around it');
  if (apiKey && (apiKey.startsWith(' ') || apiKey.endsWith(' '))) issues.push('CELCOM_API_KEY has spaces around it');
  
  if (!partnerId) issues.push('CELCOM_PARTNER_ID not set');
  if (partnerId && partnerId !== '36') issues.push(`CELCOM_PARTNER_ID is "${partnerId}" but should be "36"`);
  if (partnerId && (partnerId.startsWith('"') || partnerId.startsWith("'"))) issues.push('CELCOM_PARTNER_ID has quotes around it');
  if (partnerId && (partnerId.startsWith(' ') || partnerId.endsWith(' '))) issues.push('CELCOM_PARTNER_ID has spaces around it');
  
  if (!senderId) issues.push('CELCOM_SENDER_ID not set');
  if (senderId && senderId !== 'TEXTME') issues.push(`CELCOM_SENDER_ID is "${senderId}" but should be "TEXTME"`);
  if (senderId && (senderId.startsWith('"') || senderId.startsWith("'"))) issues.push('CELCOM_SENDER_ID has quotes around it');
  if (senderId && (senderId.startsWith(' ') || senderId.endsWith(' '))) issues.push('CELCOM_SENDER_ID has spaces around it');

  if (testMode && testMode !== 'false') issues.push(`SMS_TEST_MODE is "${testMode}" but should be "false" for production`);
  
  const envCheck = {
    SMS_PROVIDER: {
      value: smsProvider || 'NOT SET',
      length: smsProvider?.length || 0,
      hasQuotes: smsProvider ? (smsProvider.startsWith('"') || smsProvider.startsWith("'")) : false,
      hasSpaces: smsProvider ? (smsProvider.startsWith(' ') || smsProvider.endsWith(' ')) : false,
    },
    CELCOM_API_KEY: {
      value: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
      length: apiKey?.length || 0,
      expectedLength: 32,
      hasQuotes: apiKey ? (apiKey.startsWith('"') || apiKey.startsWith("'")) : false,
      hasSpaces: apiKey ? (apiKey.startsWith(' ') || apiKey.endsWith(' ')) : false,
    },
    CELCOM_PARTNER_ID: {
      value: partnerId || 'NOT SET',
      length: partnerId?.length || 0,
      expectedValue: '36',
      hasQuotes: partnerId ? (partnerId.startsWith('"') || partnerId.startsWith("'")) : false,
      hasSpaces: partnerId ? (partnerId.startsWith(' ') || partnerId.endsWith(' ')) : false,
    },
    CELCOM_SENDER_ID: {
      value: senderId || 'NOT SET',
      length: senderId?.length || 0,
      expectedValue: 'TEXTME',
      hasQuotes: senderId ? (senderId.startsWith('"') || senderId.startsWith("'")) : false,
      hasSpaces: senderId ? (senderId.startsWith(' ') || senderId.endsWith(' ')) : false,
    },
    SMS_TEST_MODE: {
      value: testMode || 'NOT SET',
      expectedValue: 'false',
    },
    NODE_ENV: process.env.NODE_ENV,
  };

  return res.status(200).json({
    message: 'Environment variables diagnostic',
    status: issues.length === 0 ? 'ALL GOOD ✅' : 'ISSUES FOUND ❌',
    issues: issues.length > 0 ? issues : ['No issues detected'],
    env: envCheck,
    timestamp: new Date().toISOString(),
    instructions: issues.length > 0 ? 'Go to Vercel → Settings → Environment Variables and fix the issues above. Make sure values have NO quotes and NO spaces.' : 'Environment variables look correct. If SMS still not working, check Vercel logs for the actual error.'
  });
}
