import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { startDate, endDate } = req.query;

    let debtsQuery = db.from('debts').select('*').eq('tenant_id', tenantId);
    if (startDate && endDate) {
      debtsQuery = debtsQuery.gte('created_at', startDate).lte('created_at', endDate);
    }

    const [debtsRes, customersRes] = await Promise.all([
      debtsQuery,
      db.from('customers').select('debt_limit').eq('tenant_id', tenantId),
    ]);

    const debts = debtsRes.data || [];
    const customers = customersRes.data || [];

    const totalOutstanding = debts.reduce((s, d) => s + Math.max(0, parseFloat(d.amount_remaining || 0)), 0);
    const totalCreditLimit = customers.reduce((s, c) => s + parseFloat(c.debt_limit || 0), 0);
    const activeDebts = debts.filter(d => d.status !== 'Paid' && parseFloat(d.amount_remaining || 0) > 0).length;
    const paidDebts = debts.filter(d => d.status === 'Paid' || parseFloat(d.amount_remaining || 0) <= 0).length;

    return res.status(200).json({
      totalOutstanding,
      totalCreditLimit,
      utilizationPercent: totalCreditLimit > 0 ? Math.round((totalOutstanding / totalCreditLimit) * 100) : 0,
      activeDebts,
      paidDebts,
      debts,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
