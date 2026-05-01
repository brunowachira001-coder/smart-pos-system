import type { NextApiRequest, NextApiResponse } from 'next';
import mobitechSMSService from '../../../services/mobitech-sms.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message, customerId, messageType, templateId, context } = req.body;

    if (!phoneNumber || (!message && !templateId)) {
      return res.status(400).json({ 
        error: 'Phone number and either message or templateId are required' 
      });
    }

    let finalMessage = message;

    // If template ID provided, generate message from template
    if (templateId && customerId) {
      // Get customer details
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customer) {
        finalMessage = await mobitechSMSService.generateMessage(
          templateId,
          customer,
          context || {}
        );
      }
    }

    const result = await mobitechSMSService.sendSMS({
      phoneNumber,
      message: finalMessage,
      customerId,
      messageType: messageType || 'manual',
      priority: 5
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        messageId: result.messageId,
        cost: result.cost
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send SMS'
      });
    }

  } catch (error: any) {
    console.error('Error in send-mobitech API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
