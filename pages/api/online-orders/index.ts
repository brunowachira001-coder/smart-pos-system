import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '@/lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;
  const db = getAdminDb();

  if (!tenantId) return res.status(400).json({ error: 'Tenant required' });

  if (req.method === 'GET') {
    const { status } = req.query;

    let query = db
      .from('online_orders')
      .select(`*, online_order_items(*)`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('order_status', status as string);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ orders: data || [] });
  }

  if (req.method === 'PATCH') {
    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ error: 'orderId and status required' });

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const updates: any = { order_status: status, updated_at: new Date().toISOString() };
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

    const { data, error } = await db
      .from('online_orders')
      .update(updates)
      .eq('id', orderId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ order: data });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: 'Method not allowed' });
});
