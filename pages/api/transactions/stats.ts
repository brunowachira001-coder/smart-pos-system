import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { startDate, endDate } = req.query;

    let query = db.from('transactions').select('total_amount, payment_method, payment_status').eq('tenant_id', tenantId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: transactions, error } = await query;
    if (error) throw error;

    const txns = transactions || [];
    const totalRevenue = txns.reduce((s, t) => s + parseFloat(t.total_amount || 0), 0);
    const totalTransactions = txns.length;

    const paymentMethods = txns.reduce((acc: any, t) => {
      const m = t.payment_method || 'unknown';
      acc[m] = acc[m] || { count: 0, total: 0 };
      acc[m].count++;
      acc[m].total += parseFloat(t.total_amount || 0);
      return acc;
    }, {});

    return res.status(200).json({
      totalRevenue,
      totalTransactions,
      averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      paymentMethods,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
