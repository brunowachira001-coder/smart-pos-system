import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { startDate, endDate, search = '' } = req.query;

    let txnQuery = db.from('transactions').select('transaction_id').eq('tenant_id', tenantId);
    if (startDate) txnQuery = txnQuery.gte('created_at', startDate);
    if (endDate) txnQuery = txnQuery.lte('created_at', endDate);

    const [productsRes, txnRes] = await Promise.all([
      db.from('products').select('*').eq('tenant_id', tenantId),
      txnQuery,
    ]);

    const products = productsRes.data || [];
    const txnIds = (txnRes.data || []).map(t => t.transaction_id).filter(Boolean);

    let salesItems: any[] = [];
    if (txnIds.length > 0) {
      const { data } = await db.from('transaction_items').select('*').eq('tenant_id', tenantId).in('transaction_id', txnIds);
      salesItems = data || [];
    }

    let result = products.map(product => {
      const items = salesItems.filter(i => i.product_id === product.id);
      const unitsSold = items.reduce((s, i) => s + (i.quantity || 0), 0);
      const revenue = items.reduce((s, i) => s + parseFloat(i.total_price || 0), 0);
      const cost = unitsSold * (parseFloat(product.cost_price) || 0);
      const profit = revenue - cost;
      return {
        id: product.id, name: product.name, sku: product.sku,
        unitsSold, netRevenue: revenue.toFixed(2),
        netProfit: profit.toFixed(2),
        profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
      };
    });

    if (search) {
      const s = search.toString().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
    }

    result.sort((a, b) => b.unitsSold - a.unitsSold);
    return res.status(200).json({ products: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
