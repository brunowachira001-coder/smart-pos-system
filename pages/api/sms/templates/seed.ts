/**
 * POST /api/sms/templates/seed
 * Seeds default message templates for the calling tenant.
 * Safe to call multiple times — skips if templates already exist.
 */
import { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../../lib/secure-route';

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

  const { tenantId } = req;
  if (!tenantId) {
    return res.status(403).json({ error: 'Tenant context required' });
  }

  const db = getAdminDb();

  // Check if templates already exist — don't overwrite
  const { count } = await db
    .from('message_templates')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if ((count || 0) > 0) {
    return res.status(200).json({ success: true, message: 'Templates already exist', seeded: false });
  }

  const { error } = await db
    .from('message_templates')
    .insert(DEFAULT_TEMPLATES.map(t => ({ ...t, tenant_id: tenantId })));

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true, message: 'Default templates created', seeded: true });
});
