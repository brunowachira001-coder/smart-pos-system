// API: Cron Job - Process Automations
import type { NextApiRequest, NextApiResponse } from 'next';
import automationService from '../../../services/automation.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify cron secret for security
  const cronSecret = req.headers['x-cron-secret'];
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await automationService.processAutomations();
    
    res.status(200).json({
      success: true,
      message: 'Automations processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: error.message });
  }
}
