// SMS Service - Africa's Talking Integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface SMSConfig {
  provider: string;
  api_key: string;
  username: string;
  sender_id: string;
  is_active: boolean;
  test_mode: boolean;
}

interface SendSMSParams {
  phoneNumber: string;
  message: string;
  customerId?: number;
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

class SMSService {
  private config: SMSConfig | null = null;

  // Initialize SMS configuration
  async initialize(): Promise<void> {
    const { data, error } = await supabase
      .from('sms_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('SMS config not found:', error);
      return;
    }

    this.config = data;
  }

  // Send SMS via Africa's Talking
  async sendSMS(params: SendSMSParams): Promise<SMSResult> {
    try {
      // Ensure config is loaded
      if (!this.config) {
        await this.initialize();
      }

      if (!this.config || !this.config.is_active) {
        return {
          success: false,
          error: 'SMS service not configured or inactive'
        };
      }

      // Format phone number (ensure it starts with +254 for Kenya)
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);

      // In test mode, just log and return success
      if (this.config.test_mode) {
        console.log('TEST MODE - Would send SMS:', {
          to: formattedPhone,
          message: params.message,
          type: params.messageType
        });

        // Queue message in database
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

      // Real SMS sending via Africa's Talking
      const AfricasTalking = require('africastalking')({
        apiKey: this.config.api_key,
        username: this.config.username
      });

      const sms = AfricasTalking.SMS;

      const result = await sms.send({
        to: [formattedPhone],
        message: params.message,
        from: this.config.sender_id || undefined
      });

      const recipient = result.SMSMessageData.Recipients[0];

      // Queue message in database
      await this.queueMessage({
        ...params,
        phoneNumber: formattedPhone,
        status: recipient.status === 'Success' ? 'sent' : 'failed',
        cost: parseFloat(recipient.cost.replace('KES ', ''))
      });

      return {
        success: recipient.status === 'Success',
        messageId: recipient.messageId,
        status: recipient.status,
        cost: parseFloat(recipient.cost.replace('KES ', '')),
        error: recipient.status !== 'Success' ? recipient.status : undefined
      };

    } catch (error: any) {
      console.error('SMS sending error:', error);

      // Queue failed message
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

      // Update customer preferences
      if (params.customerId) {
        await this.updateCustomerPreferences(params.customerId);
      }
    } catch (error) {
      console.error('Error in queueMessage:', error);
    }
  }

  // Update customer communication preferences
  private async updateCustomerPreferences(customerId: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('upsert_customer_prefs', {
        p_customer_id: customerId
      });

      if (error) {
        // If function doesn't exist, do manual upsert
        await supabase
          .from('customer_communication_prefs')
          .upsert({
            customer_id: customerId,
            last_contacted_at: new Date().toISOString(),
            total_messages_sent: supabase.raw('total_messages_sent + 1'),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'customer_id'
          });
      }
    } catch (error) {
      console.error('Error updating customer preferences:', error);
    }
  }

  // Format phone number for Kenya
  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // If starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    }

    // If starts with 254, add +
    if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    // If doesn't start with +, assume Kenya and add +254
    if (!cleaned.startsWith('+')) {
      cleaned = '+254' + cleaned;
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
      // Get template
      const { data: template, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        throw new Error('Template not found');
      }

      // Get shop settings
      const { data: shopSettings } = await supabase
        .from('shop_settings')
        .select('*')
        .single();

      // Replace placeholders
      let message = template.message_text;

      const replacements: Record<string, string> = {
        '{customer_name}': customer.name || 'Customer',
        '{shop_name}': shopSettings?.business_name || 'Our Shop',
        '{shop_phone}': shopSettings?.business_phone || '',
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

        // Small delay to avoid rate limiting
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

export default new SMSService();
