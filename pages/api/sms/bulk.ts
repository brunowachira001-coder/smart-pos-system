// API: Send Bulk SMS
import type { NextApiRequest, NextApiResponse } from 'next';
import smsService from '../../../services/sms.service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId, customerIds, context } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Get customers
    let query = supabase.from('customers').select('*');
    
    if (customerIds && customerIds.length > 0) {
      query = query.in('id', customerIds);
    }

    const { data: customers, error } = await query;

    if (error) throw error;

    if (!customers || customers.length === 0) {
      return res.status(400).json({ error: 'No customers found' });
    }

    // Send bulk SMS
    const result = await smsService.sendBulkSMS(customers, templateId, context);

    res.status(200).json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: customers.length
    });
  } catch (error: any) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ error: error.message });
  }
}
