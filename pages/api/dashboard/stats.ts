import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const [productsRes, customersRes, todayTxnRes, recentTxnRes] = await Promise.all([
      db.from('products').select('id, stock_quantity, minimum_stock_level').eq('tenant_id', tenantId),
      db.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      db.from('transactions').select('total_amount').eq('tenant_id', tenantId).gte('created_at', todayStart).lt('created_at', tomorrowStart),
      db.from('transactions').select('id, transaction_id, total_amount, payment_method, customer_name, created_at').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5),
    ]);

    const products = productsRes.data || [];
    const todayTxns = todayTxnRes.data || [];
    const todaySales = todayTxns.reduce((s, t) => s + parseFloat(t.total_amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        sales: {
          totalSales: todaySales,
          transactionCount: todayTxns.length,
          averageTransaction: todayTxns.length > 0 ? todaySales / todayTxns.length : 0,
        },
        inventory: {
          totalProducts: products.length,
          lowStockCount: products.filter(p => (p.stock_quantity || 0) <= (p.minimum_stock_level || 10)).length,
        },
        customers: { totalCustomers: customersRes.count || 0 },
        recentTransactions: (recentTxnRes.data || []).map(t => ({
          id: t.id,
          transactionNumber: t.transaction_id,
          customer: t.customer_name || 'Walk-in Customer',
          total: parseFloat(t.total_amount) || 0,
          createdAt: t.created_at,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});
