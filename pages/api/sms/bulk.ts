import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';
import smsService from '../../../services/africastalking-sms.service';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const { templateId, customerIds, context } = req.body;

  if (!templateId) return res.status(400).json({ error: 'Template ID required' });

  const db = getAdminDb();

  let query = db.from('customers').select('id, name, phone').eq('tenant_id', tenantId);
  if (customerIds?.length) query = query.in('id', customerIds);

  const { data: customers, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!customers?.length) return res.status(400).json({ error: 'No customers found' });

  const result = await smsService.sendBulkSMS(customers, templateId, tenantId, context || {});

  return res.status(200).json({ success: true, ...result, total: customers.length });
});
