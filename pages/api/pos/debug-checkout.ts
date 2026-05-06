import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Check cart items
    const { data: cartItems, error: cartError } = await db
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId);

    // Check cart items without tenant filter
    const { data: allCartItems, error: allCartError } = await db
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);

    return res.status(200).json({
      tenantId,
      sessionId,
      cartWithTenant: {
        count: cartItems?.length || 0,
        items: cartItems || [],
        error: cartError?.message
      },
      cartWithoutTenant: {
        count: allCartItems?.length || 0,
        items: allCartItems || [],
        error: allCartError?.message
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
