// Mobitech SMS Service Integration
import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

interface SendSMSParams {
  phoneNumber: string;
  message: string;
  customerId?: string;
  messageType: string;
  priority?: number;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  status?: string;
  cost?: number;
  error?: string;
}

class MobitechSMSService {
  private apiKey: string;
  private apiUrl: string = 'https://api.mobitechtechnologies.com/sms/sendsms';

  constructor() {
    this.apiKey = process.env.MOBITECH_API_KEY || '';
  }

  // Send SMS via Mobitech
  async sendSMS(params: SendSMSParams): Promise<SMSResult> {
    try {
      if (!this.apiKey) {
        console.error('MOBITECH_API_KEY not set in environment variables');
        return {
          success: false,
          error: 'SMS service not configured - API key missing'
        };
      }

      // Format phone number (ensure it starts with 254 for Kenya)
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);

      // Check if in test mode
      const testMode = process.env.SMS_TEST_MODE === 'true';

      if (testMode) {
        console.log('TEST MODE - Would send SMS via Mobitech:', {
          to: formattedPhone,
          message: params.message,
          type: params.messageType
        });

        await this.queueMessage({
          ...params,
          phoneNumber: formattedPhone,
          status: 'sent',
          cost: 0.80
        });

        return {
          success: true,
          messageId: 'TEST-' + Date.now(),
          status: 'Success',
          cost: 0.80
        };
      }

      // Real SMS sending via Mobitech
      console.log('Sending SMS via Mobitech:', {
        to: formattedPhone,
        messageLength: params.message.length
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          mobile: formattedPhone,
          response_type: 'json',
          sender_name: 'NYLAWIGS',
          service_id: 0,
          message: params.message,
          apikey: this.apiKey
        })
      });

      const result = await response.json();
      console.log('Mobitech response:', JSON.stringify(result, null, 2));

      // Mobitech response format: { success: true/false, message: "...", ... }
      const success = result.success === true || result.status === 'success';

      await this.queueMessage({
        ...params,
        phoneNumber: formattedPhone,
        status: success ? 'sent' : 'failed',
        cost: success ? 0.80 : 0,
        error: success ? undefined : result.message || 'Unknown error'
      });

      return {
        success,
        messageId: result.message_id || result.id || Date.now().toString(),
        status: success ? 'Success' : 'Failed',
        cost: success ? 0.80 : 0,
        error: success ? undefined : result.message
      };

    } catch (error: any) {
      console.error('Mobitech SMS error:', error);

      await this.queueMessage({
        ...params,
        status: 'failed',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Queue message in database
  private async queueMessage(params: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_queue')
        .insert({
          customer_id: params.customerId,
          phone_number: params.phoneNumber,
          message_text: params.message,
          message_type: params.messageType,
          priority: params.priority || 5,
          status: params.status || 'pending',
          sent_at: params.status === 'sent' ? new Date().toISOString() : null,
          cost: params.cost || null,
          error_message: params.error || null,
          ai_generated: true
        });

      if (error) {
        console.error('Error queuing message:', error);
      }

      if (params.customerId) {
        await this.updateCustomerPreferences(params.customerId);
      }
    } catch (error) {
      console.error('Error in queueMessage:', error);
    }
  }

  // Update customer communication preferences
  private async updateCustomerPreferences(customerId: string): Promise<void> {
    try {
      const { data: currentPrefs } = await supabase
        .from('customer_communication_prefs')
        .select('total_messages_sent')
        .eq('customer_id', customerId)
        .single();

      const currentCount = currentPrefs?.total_messages_sent || 0;

      await supabase
        .from('customer_communication_prefs')
        .upsert({
          customer_id: customerId,
          last_contacted_at: new Date().toISOString(),
          total_messages_sent: currentCount + 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'customer_id'
        });
    } catch (error) {
      console.error('Error updating customer preferences:', error);
    }
  }

  // Format phone number for Kenya
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  // Generate personalized message using template
  async generateMessage(
    templateId: number,
    customer: any,
    context: any = {}
  ): Promise<string> {
    try {
      const { data: template, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        throw new Error('Template not found');
      }

      const { data: shopSettings } = await supabase
        .from('shop_settings')
        .select('*')
        .single();

      let message = template.message_text;

      const replacements: Record<string, string> = {
        '{customer_name}': customer.name || 'Customer',
        '{shop_name}': shopSettings?.business_name || 'Nyla Wigs',
        '{shop_phone}': shopSettings?.business_phone || '0789715533',
        '{product_name}': context.product_name || 'product',
        '{amount}': context.amount || '0',
        '{discount}': context.discount || '10',
        ...context
      };

      Object.keys(replacements).forEach(key => {
        message = message.replace(new RegExp(key, 'g'), replacements[key]);
      });

      return message;
    } catch (error) {
      console.error('Error generating message:', error);
      return 'Thank you for your business!';
    }
  }

  // Send bulk SMS
  async sendBulkSMS(
    customers: any[],
    templateId: number,
    context: any = {}
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const customer of customers) {
      try {
        const message = await this.generateMessage(templateId, customer, context);

        const result = await this.sendSMS({
          phoneNumber: customer.phone,
          message,
          customerId: customer.id,
          messageType: 'bulk',
          priority: 5
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending to customer ${customer.id}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  // Get SMS statistics
  async getStatistics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('message_queue')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total_sent: data?.filter(m => m.status === 'sent').length || 0,
        total_failed: data?.filter(m => m.status === 'failed').length || 0,
        total_pending: data?.filter(m => m.status === 'pending').length || 0,
        total_cost: data?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0,
        delivery_rate: 0
      };

      if (stats.total_sent > 0) {
        stats.delivery_rate = (stats.total_sent / (stats.total_sent + stats.total_failed)) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

export default new MobitechSMSService();
