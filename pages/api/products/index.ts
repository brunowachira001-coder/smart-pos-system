import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;
  const db = getAdminDb();

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId) // TENANT ISOLATION
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, sku, price, stock, category } = req.body;
    
    const { data, error } = await db
      .from('products')
      .insert([{
        name,
        sku,
        price,
        stock,
        category,
        status: stock < 50 ? 'Low Stock' : 'Active',
        tenant_id: tenantId // TENANT ISOLATION
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
