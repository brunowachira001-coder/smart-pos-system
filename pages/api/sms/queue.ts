// API: View Message Queue
import type { NextApiRequest, NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;
  const db = getAdminDb();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, limit = 50 } = req.query;

    // CRITICAL: tenant isolation — only show this tenant's message queue
    let query = db
      .from('message_queue')
      .select('*, customers(name, phone)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({ queue: data || [] });
  } catch (error: any) {
    console.error('Queue fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});
