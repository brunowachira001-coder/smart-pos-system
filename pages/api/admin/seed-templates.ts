/**
 * POST /api/admin/seed-templates
 * Seeds default message templates for ALL tenants that have none.
 * Superadmin only. Safe to run multiple times (skips tenants that already have templates).
 */
import { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, requireSuperAdmin, getAdminDb } from '../../../lib/secure-route';

const DEFAULT_TEMPLATES = [
  {
    name: 'Thank You - After Purchase',
    category: 'after_purchase',
    message_text: 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! Call us: {shop_phone}',
    language: 'en',
    is_active: true,
  },
  {
    name: 'Debt Reminder',
    category: 'debt_reminder',
    message_text: 'Hi {customer_name}, you have an outstanding balance of KES {amount} at {shop_name}. Please settle by your due date. Call: {shop_phone}',
    language: 'en',
    is_active: true,
  },
  {
    name: 'Debt Overdue',
    category: 'debt_overdue',
    message_text: 'Hi {customer_name}, your payment of KES {amount} at {shop_name} is overdue. Please contact us urgently at {shop_phone}.',
    language: 'en',
    is_active: true,
  },
  {
    name: 'Welcome New Customer',
    category: 'welcome',
    message_text: 'Welcome to {shop_name}, {customer_name}! We are glad to have you. Visit us again soon. {shop_phone}',
    language: 'en',
    is_active: true,
  },
  {
    name: 'Win Back - Inactive Customer',
    category: 'win_back',
    message_text: 'Hi {customer_name}, we miss you at {shop_name}! Come back and check out our latest products. Call: {shop_phone}',
    language: 'en',
    is_active: true,
  },
  {
    name: 'Promotional Offer',
    category: 'promotion',
    message_text: 'Hi {customer_name}, {shop_name} has a special offer just for you! Visit us today or call {shop_phone} for details.',
    language: 'en',
    is_active: true,
  },
];

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireSuperAdmin(req, res)) return;

  const db = getAdminDb();

  try {
    // Get all active tenants
    const { data: tenants, error: tenantsError } = await db
      .from('tenants')
      .select('id, business_name')
      .eq('is_active', true);

    if (tenantsError) throw tenantsError;

    const results: { tenant: string; seeded: boolean; reason?: string }[] = [];

    for (const tenant of tenants || []) {
      // Check if this tenant already has templates
      const { count } = await db
        .from('message_templates')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);

      if ((count || 0) > 0) {
        results.push({ tenant: tenant.business_name, seeded: false, reason: 'already has templates' });
        continue;
      }

      // Seed default templates
      const { error: insertError } = await db
        .from('message_templates')
        .insert(DEFAULT_TEMPLATES.map(t => ({ ...t, tenant_id: tenant.id })));

      if (insertError) {
        results.push({ tenant: tenant.business_name, seeded: false, reason: insertError.message });
      } else {
        results.push({ tenant: tenant.business_name, seeded: true });
      }
    }

    const seededCount = results.filter(r => r.seeded).length;
    const skippedCount = results.filter(r => !r.seeded).length;

    return res.status(200).json({
      success: true,
      message: `Seeded ${seededCount} tenants, skipped ${skippedCount}`,
      results,
    });
  } catch (error: any) {
    console.error('[seed-templates] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});
