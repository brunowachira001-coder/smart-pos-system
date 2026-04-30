// API: Check SMS Configuration (Diagnostic)
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = {
      hasApiKey: !!process.env.AFRICASTALKING_API_KEY,
      apiKeyLength: process.env.AFRICASTALKING_API_KEY?.length || 0,
      apiKeyPreview: process.env.AFRICASTALKING_API_KEY?.substring(0, 10) + '...',
      username: process.env.AFRICASTALKING_USERNAME || 'NOT SET',
      senderId: process.env.AFRICASTALKING_SENDER_ID || 'NOT SET',
      hasCronSecret: !!process.env.CRON_SECRET,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      testMode: process.env.SMS_TEST_MODE === 'true',
      nodeEnv: process.env.NODE_ENV
    };

    // Check if africastalking package is available
    let packageAvailable = false;
    let packageError = null;
    try {
      require('africastalking');
      packageAvailable = true;
    } catch (error: any) {
      packageError = error.message;
    }

    res.status(200).json({
      success: true,
      config,
      packageAvailable,
      packageError,
      warning: config.username === 'sandbox' ? 'WARNING: Using sandbox mode - messages will not be delivered!' : null
    });
  } catch (error: any) {
    console.error('Config check error:', error);
    res.status(500).json({ error: error.message });
  }
}
