// API: Send Manual SMS via Celcom Africa
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';
import celcomSMS from '../../../services/celcom-sms.service';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId } = req;
  if (!tenantId) return res.status(403).json({ error: 'Tenant context required' });

  try {
    const { customerIds, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!customerIds || customerIds.length === 0) {
      return res.status(400).json({ error: 'At least one customer must be selected' });
    }

    const db = getAdminDb();

    // Get customers — scoped to this tenant only
    const { data: customers, error } = await db
      .from('customers')
      .select('*')
      .in('id', customerIds)
      .eq('tenant_id', tenantId); // CRITICAL: tenant isolation

    if (error) throw error;

    if (!customers || customers.length === 0) {
      return res.status(400).json({ error: 'No customers found' });
    }

    let sent = 0;
    let failed = 0;
    const results = [];

    for (const customer of customers) {
      try {
        if (!customer.phone) {
          failed++;
          results.push({ customer: customer.name, status: 'failed', error: 'No phone number' });
          continue;
        }

        const personalizedMessage = message.replace(/{name}/g, customer.name);

        const result = await celcomSMS.sendSMS({
          phoneNumber: customer.phone,
          message: personalizedMessage,
          customerId: customer.id,
          messageType: 'manual',
          priority: 5,
          tenantId, // CRITICAL: pass tenant context
        });

        if (result.success) {
          sent++;
          results.push({ customer: customer.name, status: 'sent', messageId: result.messageId });
        } else {
          failed++;
          results.push({ customer: customer.name, status: 'failed', error: result.error });
        }
      } catch (err: any) {
        failed++;
        results.push({ customer: customer.name, status: 'failed', error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      sent,
      failed,
      total: customers.length,
      message: `Successfully sent ${sent} messages, ${failed} failed`,
      results,
    });
  } catch (error: any) {
    console.error('Manual SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send messages' });
  }
});
