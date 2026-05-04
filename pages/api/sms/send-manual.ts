import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';
import smsService from '../../../services/africastalking-sms.service';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const { customerIds, message } = req.body;

  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
  if (!customerIds?.length) return res.status(400).json({ error: 'At least one customer required' });

  const db = getAdminDb();

  // Fetch customers scoped to tenant only
  const { data: customers, error } = await db
    .from('customers')
    .select('id, name, phone')
    .eq('tenant_id', tenantId)
    .in('id', customerIds);

  if (error) return res.status(500).json({ error: error.message });
  if (!customers?.length) return res.status(400).json({ error: 'No customers found' });

  let sent = 0, failed = 0;

  for (const customer of customers) {
    if (!customer.phone) { failed++; continue; }
    try {
      await smsService.sendSMS({
        phoneNumber: customer.phone,
        message: message.replace(/{name}/g, customer.name),
        customerId: customer.id,
        messageType: 'manual',
        priority: 5,
        tenantId,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return res.status(200).json({ success: true, sent, failed, total: customers.length });
});
