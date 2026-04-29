// AI Message Service - Generate Personalized Messages
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface MessageContext {
  customer: any;
  messageType: string;
  context?: any;
}

class AIMessageService {
  // Generate AI-powered personalized message
  async generateMessage(params: MessageContext): Promise<string> {
    const { customer, messageType, context = {} } = params;

    try {
      // Get customer history for personalization
      const history = await this.getCustomerHistory(customer.id);

      // Get shop settings
      const { data: shopSettings } = await supabase
        .from('shop_settings')
        .select('*')
        .single();

      // Generate personalized message based on type
      let message = '';

      switch (messageType) {
        case 'thank_you':
          message = this.generateThankYouMessage(customer, history, shopSettings);
          break;
        case 'follow_up':
          message = this.generateFollowUpMessage(customer, history, shopSettings);
          break;
        case 'debt_reminder':
          message = this.generateDebtReminderMessage(customer, context, shopSettings);
          break;
        case 'promotion':
          message = this.generatePromotionMessage(customer, history, context, shopSettings);
          break;
        case 're_engagement':
          message = this.generateReEngagementMessage(customer, history, shopSettings);
          break;
        default:
          message = `Hi ${customer.name}! Thank you for your business. - ${shopSettings?.business_name || 'Our Shop'}`;
      }

      // Track AI analytics
      await this.trackMessageGeneration(customer.id, messageType, message);

      return message;
    } catch (error) {
      console.error('AI message generation error:', error);
      return `Hi ${customer.name}! Thank you for your business.`;
    }
  }

  // Generate thank you message
  private generateThankYouMessage(customer: any, history: any, shopSettings: any): string {
    const shopName = shopSettings?.business_name || 'Our Shop';
    const isFirstPurchase = history.totalPurchases === 1;

    if (isFirstPurchase) {
      return `Hi ${customer.name}! 🎉 Thank you for choosing ${shopName} for your first purchase! We're excited to serve you. If you need anything, just call us. Welcome to the family!`;
    }

    if (history.totalPurchases > 10) {
      return `Hi ${customer.name}! 💎 Thank you for your continued loyalty to ${shopName}! You're a valued VIP customer. We truly appreciate your business!`;
    }

    return `Hi ${customer.name}! Thank you for shopping at ${shopName} today. We hope you love your purchase! 😊 See you again soon!`;
  }

  // Generate follow-up message
  private generateFollowUpMessage(customer: any, history: any, shopSettings: any): string {
    const shopName = shopSettings?.business_name || 'Our Shop';
    const phone = shopSettings?.business_phone || '';

    return `Hi ${customer.name}! How are you enjoying your recent purchase from ${shopName}? We'd love to hear your feedback! ${phone ? `Call us: ${phone}` : 'Visit us anytime!'}`;
  }

  // Generate debt reminder message
  private generateDebtReminderMessage(customer: any, context: any, shopSettings: any): string {
    const shopName = shopSettings?.business_name || 'Our Shop';
    const amount = context.amount || '0';
    const daysOverdue = context.days_overdue || 0;
    const phone = shopSettings?.business_phone || '';

    if (daysOverdue <= 3) {
      return `Hi ${customer.name}, friendly reminder about your KES ${amount} balance at ${shopName}. No rush! Pay when convenient. ${phone ? `M-PESA: ${phone}` : ''} Thank you! 😊`;
    }

    if (daysOverdue <= 7) {
      return `Hi ${customer.name}, your KES ${amount} balance is now ${daysOverdue} days overdue. Please pay at your earliest convenience. ${phone ? `M-PESA: ${phone}` : ''} Thank you!`;
    }

    return `Hi ${customer.name}, urgent reminder: Your KES ${amount} balance is ${daysOverdue} days overdue. Please settle this today. ${phone ? `M-PESA: ${phone}` : ''} Thank you.`;
  }

  // Generate promotion message
  private generatePromotionMessage(customer: any, history: any, context: any, shopSettings: any): string {
    const shopName = shopSettings?.business_name || 'Our Shop';
    const discount = context.discount || '10';
    const isVIP = history.totalSpent > 10000;

    if (isVIP) {
      return `Hi ${customer.name}! 💎 Exclusive VIP offer: ${discount}% OFF your next purchase at ${shopName}! You're special to us. Visit today!`;
    }

    return `Hi ${customer.name}! 🎉 Special offer: ${discount}% OFF at ${shopName} this week! Don't miss out. See you soon!`;
  }

  // Generate re-engagement message
  private generateReEngagementMessage(customer: any, history: any, shopSettings: any): string {
    const shopName = shopSettings?.business_name || 'Our Shop';
    const daysSinceLastPurchase = history.daysSinceLastPurchase || 30;

    if (daysSinceLastPurchase > 60) {
      return `Hi ${customer.name}! We miss you! 😊 It's been a while since your last visit to ${shopName}. Come see what's new! Special 15% discount waiting for you!`;
    }

    return `Hi ${customer.name}! We miss you at ${shopName}! 😊 New arrivals just in. Visit us this week and get 10% OFF!`;
  }

  // Get customer history for personalization
  private async getCustomerHistory(customerId: number): Promise<any> {
    try {
      // Get transaction count and total spent
      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount, created_at')
        .eq('customer_id', customerId)
        .eq('type', 'sale');

      const totalPurchases = transactions?.length || 0;
      const totalSpent = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      // Get last purchase date
      const lastPurchase = transactions?.[0]?.created_at;
      const daysSinceLastPurchase = lastPurchase
        ? Math.floor((Date.now() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        totalPurchases,
        totalSpent,
        daysSinceLastPurchase
      };
    } catch (error) {
      console.error('Error getting customer history:', error);
      return {
        totalPurchases: 0,
        totalSpent: 0,
        daysSinceLastPurchase: 0
      };
    }
  }

  // Track message generation for analytics
  private async trackMessageGeneration(customerId: number, messageType: string, message: string): Promise<void> {
    try {
      // This would be expanded to track AI performance
      console.log(`AI generated ${messageType} message for customer ${customerId}`);
    } catch (error) {
      console.error('Error tracking message generation:', error);
    }
  }

  // Learn from message success
  async learnFromSuccess(messageId: number, success: boolean, context: any): Promise<void> {
    try {
      await supabase
        .from('ai_message_analytics')
        .insert({
          message_id: messageId,
          customer_id: context.customerId,
          message_type: context.messageType,
          sent_at: new Date().toISOString(),
          customer_responded: success,
          resulted_in_sale: context.resultedInSale || false,
          resulted_in_payment: context.resultedInPayment || false,
          customer_sentiment: context.sentiment || 'neutral'
        });
    } catch (error) {
      console.error('Error learning from success:', error);
    }
  }
}

export default new AIMessageService();
