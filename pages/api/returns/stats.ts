import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { data: returns, error } = await db.from('returns').select('*').eq('tenant_id', tenantId);
    if (error) throw error;

    const all = returns || [];
    return res.status(200).json({
      totalReturns: all.length,
      pendingReturns: all.filter(r => r.status === 'Pending').length,
      completedReturns: all.filter(r => r.status === 'Completed').length,
      totalReturnValue: all.reduce((s, r) => s + parseFloat(r.amount || 0), 0),
      returns: all,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
