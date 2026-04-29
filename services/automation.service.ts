// Automation Service - Process Automated Messages
import { createClient } from '@supabase/supabase-js';
import smsService from './sms.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

class AutomationService {
  // Process all active automation rules
  async processAutomations(): Promise<void> {
    try {
      console.log('Starting automation processing...');

      // Get all active automation rules
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (!rules || rules.length === 0) {
        console.log('No active automation rules found');
        return;
      }

      for (const rule of rules) {
        await this.processRule(rule);
      }

      console.log('Automation processing complete');
    } catch (error) {
      console.error('Automation processing error:', error);
    }
  }

  // Process individual automation rule
  private async processRule(rule: any): Promise<void> {
    try {
      console.log(`Processing rule: ${rule.name}`);

      const condition = rule.trigger_condition;
      let customers: any[] = [];

      switch (rule.trigger_type) {
        case 'after_purchase':
          customers = await this.getCustomersAfterPurchase(condition);
          break;
        case 'debt_overdue':
          customers = await this.getCustomersWithOverdueDebt(condition);
          break;
        case 'inactive_customer':
          customers = await this.getInactiveCustomers(condition);
          break;
        case 'stock_alert':
          customers = await this.getCustomersForStockAlert(condition);
          break;
        default:
          console.log(`Unknown trigger type: ${rule.trigger_type}`);
          return;
      }

      if (customers.length === 0) {
        console.log(`No customers found for rule: ${rule.name}`);
        return;
      }

      console.log(`Found ${customers.length} customers for rule: ${rule.name}`);

      // Send messages to customers
      for (const customer of customers) {
        await this.sendAutomatedMessage(customer, rule);
      }

      // Update rule stats
      await supabase
        .from('automation_rules')
        .update({
          last_run_at: new Date().toISOString(),
          total_triggered: supabase.raw('total_triggered + ' + customers.length)
        })
        .eq('id', rule.id);

    } catch (error) {
      console.error(`Error processing rule ${rule.name}:`, error);
    }
  }

  // Get customers who made a purchase recently
  private async getCustomersAfterPurchase(condition: any): Promise<any[]> {
    const hoursAgo = condition.hours_after || 1;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hoursAgo);
    const endTime = new Date();
    endTime.setHours(endTime.getHours() - (hoursAgo - 1));

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        customer_id,
        customers (
          id,
          name,
          phone
        )
      `)
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .eq('type', 'sale');

    if (error) throw error;

    // Get unique customers
    const uniqueCustomers = new Map();
    data?.forEach((t: any) => {
      if (t.customers && t.customers.phone) {
        uniqueCustomers.set(t.customer_id, t.customers);
      }
    });

    return Array.from(uniqueCustomers.values());
  }

  // Get customers with overdue debts
  private async getCustomersWithOverdueDebt(condition: any): Promise<any[]> {
    const daysOverdue = condition.days_overdue || 3;
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - daysOverdue);

    const { data, error } = await supabase
      .from('debts')
      .select(`
        customer_id,
        amount_owed,
        due_date,
        customers (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', overdueDate.toISOString());

    if (error) throw error;

    return data?.map((d: any) => ({
      ...d.customers,
      debt_amount: d.amount_owed,
      due_date: d.due_date
    })) || [];
  }

  // Get inactive customers
  private async getInactiveCustomers(condition: any): Promise<any[]> {
    const daysInactive = condition.days_inactive || 30;
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - daysInactive);

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .lte('last_purchase_date', inactiveDate.toISOString())
      .not('phone', 'is', null);

    if (error) throw error;

    return data || [];
  }

  // Get customers for stock alerts
  private async getCustomersForStockAlert(condition: any): Promise<any[]> {
    // This would be implemented based on customer preferences
    // For now, return empty array
    return [];
  }

  // Send automated message to customer
  private async sendAutomatedMessage(customer: any, rule: any): Promise<void> {
    try {
      // Check if customer was recently contacted
      const { data: prefs } = await supabase
        .from('customer_communication_prefs')
        .select('*')
        .eq('customer_id', customer.id)
        .single();

      if (prefs && prefs.last_contacted_at) {
        const lastContact = new Date(prefs.last_contacted_at);
        const hoursSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60);
        
        // Don't send if contacted in last 12 hours
        if (hoursSinceContact < 12) {
          console.log(`Skipping ${customer.name} - contacted recently`);
          return;
        }
      }

      // Generate message
      const message = await smsService.generateMessage(
        rule.message_template_id,
        customer,
        {
          amount: customer.debt_amount || '',
          due_date: customer.due_date || ''
        }
      );

      // Send SMS
      await smsService.sendSMS({
        phoneNumber: customer.phone,
        message,
        customerId: customer.id,
        messageType: rule.trigger_type,
        priority: 7
      });

      console.log(`Sent automated message to ${customer.name}`);
    } catch (error) {
      console.error(`Error sending to ${customer.name}:`, error);
    }
  }
}

export default new AutomationService();
