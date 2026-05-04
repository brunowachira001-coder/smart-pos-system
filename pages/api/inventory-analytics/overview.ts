import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { priceType = 'retail' } = req.query;

    const [productsRes, returnsRes] = await Promise.all([
      db.from('products').select('*').eq('tenant_id', tenantId),
      db.from('returns').select('status, amount').eq('tenant_id', tenantId),
    ]);

    const products = productsRes.data || [];
    const returns = returnsRes.data || [];

    let costValue = 0, retailValue = 0, wholesaleValue = 0;
    products.forEach(p => {
      const qty = p.stock_quantity || 0;
      costValue += (parseFloat(p.cost_price) || 0) * qty;
      retailValue += (parseFloat(p.retail_price) || 0) * qty;
      wholesaleValue += (parseFloat(p.wholesale_price) || 0) * qty;
    });

    const sellingValue = priceType === 'wholesale' ? wholesaleValue : retailValue;
    const lowStockItems = products.filter(p => (p.stock_quantity || 0) <= (p.minimum_stock_level || 10));

    return res.status(200).json({
      overview: {
        inventoryValueCost: costValue.toFixed(2),
        inventoryValueSelling: sellingValue.toFixed(2),
        potentialProfit: (sellingValue - costValue).toFixed(2),
        lowStockAlerts: lowStockItems.length,
        totalReturns: returns.filter(r => ['Approved', 'Completed'].includes(r.status)).length,
        pendingReturns: returns.filter(r => r.status === 'Pending').length,
      },
      lowStockItems: lowStockItems.slice(0, 10).map(p => ({
        id: p.id, name: p.name, sku: p.sku,
        quantity: p.stock_quantity || 0, minimumStock: p.minimum_stock_level || 10,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
