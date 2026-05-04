/**
 * GET  /api/onboarding/progress  → returns current step
 * POST /api/onboarding/progress  → advances step (body: { step: number })
 *
 * Reuses secureRoute for auth + tenant isolation.
 * Does NOT duplicate any business logic — just reads/writes onboarding_step on tenants.
 */
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

const TOTAL_STEPS = 5;

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const db = getAdminDb();
  const { tenantId } = req;

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('tenants')
      .select('onboarding_step, business_name')
      .eq('id', tenantId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Tenant not found' });

    const step = data.onboarding_step ?? 1;
    return res.status(200).json({
      step,
      total: TOTAL_STEPS,
      complete: step >= TOTAL_STEPS,
      business_name: data.business_name,
    });
  }

  if (req.method === 'POST') {
    const { step } = req.body;
    if (typeof step !== 'number' || step < 1 || step > TOTAL_STEPS) {
      return res.status(400).json({ error: `step must be 1–${TOTAL_STEPS}` });
    }

    const { error } = await db
      .from('tenants')
      .update({ onboarding_step: step })
      .eq('id', tenantId);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({
      step,
      total: TOTAL_STEPS,
      complete: step >= TOTAL_STEPS,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
