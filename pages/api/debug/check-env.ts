import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint helps debug environment variables on Vercel
  
  const envCheck = {
    SMS_PROVIDER: process.env.SMS_PROVIDER || 'NOT SET',
    CELCOM_API_KEY: process.env.CELCOM_API_KEY ? `${process.env.CELCOM_API_KEY.substring(0, 10)}...` : 'NOT SET',
    CELCOM_PARTNER_ID: process.env.CELCOM_PARTNER_ID || 'NOT SET',
    CELCOM_SENDER_ID: process.env.CELCOM_SENDER_ID || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return res.status(200).json({
    message: 'Environment variables check',
    env: envCheck,
    timestamp: new Date().toISOString()
  });
}
