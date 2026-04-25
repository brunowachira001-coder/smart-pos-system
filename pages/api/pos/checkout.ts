import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const {
      sessionId,
      customerId,
      customerName,
      customerPhone,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      amountPaid,
      paymentMethod,
      paymentReference,
      notes,
      cashierId,
      cashierName
    } = req.body;

    if (!sessionId || !total || paymentMethod !== 'debt' && !amountPaid || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For debt payment, validate customer and credit limit
    if (paymentMethod === 'debt') {
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required for debt payment' });
      }

      // Get customer's debt limit
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('debt_limit')
        .eq('id', customerId)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const debtLimit = parseFloat(customer.debt_limit || '0');
      if (debtLimit <= 0) {
        return res.status(400).json({ error: 'Customer does not have credit limit' });
      }

      // Get customer's current debt (use 'balance' field, not 'amount_remaining')
      const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('balance')
        .eq('customer_id', customerId)
        .neq('status', 'paid');

      if (debtsError) {
        return res.status(500).json({ error: debtsError.message });
      }

      const currentDebt = debts?.reduce((sum, debt) => sum + parseFloat(debt.balance || '0'), 0) || 0;
      const availableCredit = debtLimit - currentDebt;

      if (total > availableCredit) {
        return res.status(400).json({ 
          error: `Insufficient credit. Available: KSH ${availableCredit.toFixed(2)}` 
        });
      }
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }

    // Generate transaction number
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const changeAmount = paymentMethod === 'debt' ? 0 : amountPaid - total;

    // Create transaction (use 'transactions' table, not 'sales_transactions')
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        transaction_number: transactionNumber,
        customer_id: customerId,
        user_id: cashierId,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'completed',
        notes: notes
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: transactionError.message });
    }

    // Create transaction items (use 'transaction_items' table)
    const transactionItems = cartItems.map(item => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) {
      // Rollback transaction if items insert fails
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return res.status(500).json({ error: itemsError.message });
    }

    // If debt payment, create debt record
    if (paymentMethod === 'debt') {
      const { error: debtError } = await supabase
        .from('debts')
        .insert({
          customer_id: customerId,
          transaction_id: transaction.id,
          amount: total,
          amount_paid: 0,
          balance: total,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `Credit sale - ${transactionNumber}`
        });

      if (debtError) {
        // Rollback transaction if debt insert fails
        await supabase.from('transaction_items').delete().eq('transaction_id', transaction.id);
        await supabase.from('transactions').delete().eq('id', transaction.id);
        return res.status(500).json({ error: debtError.message });
      }
    }

    // Update product inventory (reduce stock)
    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({
            stock_quantity: product.stock_quantity - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);
      }
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    return res.status(201).json({
      success: true,
      transaction: {
        ...transaction,
        items: transactionItems
      },
      message: 'Transaction completed successfully'
    });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
