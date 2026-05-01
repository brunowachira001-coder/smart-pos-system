// API: Send Manual SMS via Celcom Africa
import type { NextApiRequest, NextApiResponse } from 'next';
import celcomSMS from '../../../services/celcom-sms.service';
import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Send manual SMS request (Celcom):', req.body);
    
    const { customerIds, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!customerIds || customerIds.length === 0) {
      return res.status(400).json({ error: 'At least one customer must be selected' });
    }

    // Get customers
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .in('id', customerIds);

    if (error) throw error;

    if (!customers || customers.length === 0) {
      return res.status(400).json({ error: 'No customers found' });
    }

    let sent = 0;
    let failed = 0;
    const results = [];

    // Send SMS to each customer
    for (const customer of customers) {
      try {
        if (!customer.phone) {
          console.log(`Skipping ${customer.name} - no phone number`);
          failed++;
          results.push({
            customer: customer.name,
            status: 'failed',
            error: 'No phone number'
          });
          continue;
        }

        // Personalize message with customer name
        const personalizedMessage = message.replace(/{name}/g, customer.name);

        // Send SMS
        const result = await celcomSMS.sendSMS({
          phoneNumber: customer.phone,
          message: personalizedMessage,
          customerId: customer.id,
          messageType: 'manual',
          priority: 5
        });

        if (result.success) {
          sent++;
          results.push({
            customer: customer.name,
            status: 'sent',
            messageId: result.messageId
          });
          console.log(`✅ Sent message to ${customer.name} (${customer.phone})`);
        } else {
          failed++;
          results.push({
            customer: customer.name,
            status: 'failed',
            error: result.error
          });
          console.log(`❌ Failed to send to ${customer.name}: ${result.error}`);
        }
      } catch (error: any) {
        console.error(`Failed to send to ${customer.name}:`, error);
        failed++;
        results.push({
          customer: customer.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      sent,
      failed,
      total: customers.length,
      message: `Successfully sent ${sent} messages, ${failed} failed`,
      results
    });
  } catch (error: any) {
    console.error('Manual SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send messages' });
  }
}
