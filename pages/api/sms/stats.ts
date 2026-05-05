import type { NextApiRequest, NextApiResponse } from 'next';
import SMSService from '../../../services/sms.service';

import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId } = req;
  if (!tenantId) {
    return res.status(403).json({ error: 'Tenant context required' });
  }

  try {
    const { days } = req.query;
    const daysNum = days ? parseInt(days as string) : 30;

    // Pass tenantId so stats are scoped to this tenant only
    const stats = await SMSService.getStatistics(tenantId, daysNum);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('SMS stats error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});
