import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

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

    // Validate required fields
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    if (!total) return res.status(400).json({ error: 'Total amount is required' });
    if (!paymentMethod) return res.status(400).json({ error: 'Payment method is required' });
    if (paymentMethod !== 'debt' && !amountPaid) {
      return res.status(400).json({ error: 'Amount paid is required' });
    }

    // For debt payment, validate customer and credit limit
    if (paymentMethod === 'debt') {
      if (!customerId) {
        return res.status(400).json({ error: 'Customer is required for debt payment' });
      }

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('debt_limit, name')
        .eq('id', customerId)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const debtLimit = parseFloat(customer.debt_limit || '0');
      if (debtLimit <= 0) {
        return res.status(400).json({ error: 'Customer does not have a credit limit set' });
      }

      // Check current outstanding debt using correct column name
      const { data: debts } = await supabase
        .from('debts')
        .select('amount_remaining')
        .eq('customer_id', customerId)
        .neq('status', 'Paid');

      const currentDebt = debts?.reduce((sum, d) => sum + parseFloat(d.amount_remaining || '0'), 0) || 0;
      const availableCredit = debtLimit - currentDebt;

      if (total > availableCredit) {
        return res.status(400).json({
          error: `Insufficient credit. Available: KES ${availableCredit.toFixed(2)}`
        });
      }
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);

    if (cartError) {
      return res.status(500).json({ error: `Cart error: ${cartError.message}` });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Generate transaction/sale number
    const saleNumber = `SALE-${Math.floor(Math.random() * 900000 + 100000)}`;
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create transaction in sales_transactions table
    const { data: transaction, error: transactionError } = await supabase
      .from('sales_transactions')
      .insert({
        transaction_number: transactionNumber,
        customer_id: customerId || null,
        customer_name: customerName || 'Walk-in Customer',
        user_id: cashierId || null,
        subtotal: subtotal,
        tax: tax,
        total: total,
        payment_method: paymentMethod,
        payment_status: 'completed',
        notes: notes || null
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: `Transaction error: ${transactionError.message}` });
    }

    // Create transaction items in transaction_items table
    const transactionItems = cartItems.map(item => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      product_name: item.product_name || 'Unknown Product',
      sku: item.sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) {
      await supabase.from('sales_transactions').delete().eq('id', transaction.id);
      return res.status(500).json({ error: `Items error: ${itemsError.message}` });
    }

    // If debt payment, create debt record using correct column names
    if (paymentMethod === 'debt') {
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .single();

      const { error: debtError } = await supabase
        .from('debts')
        .insert({
          customer_id: customerId,
          customer_name: customer?.name || customerName || 'Unknown',
          sale_id: saleNumber,
          total_amount: total,
          amount_paid: 0,
          amount_remaining: total,
          status: 'Outstanding',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `Credit sale - ${transactionNumber}`
        });

      if (debtError) {
        await supabase.from('transaction_items').delete().eq('transaction_id', transaction.id);
        await supabase.from('sales_transactions').delete().eq('id', transaction.id);
        return res.status(500).json({ error: `Debt error: ${debtError.message}` });
      }
    }

    // Update product inventory
    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', item.product_id);
      }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('session_id', sessionId);

    const changeAmount = paymentMethod === 'debt' ? 0 : (amountPaid || 0) - total;

    return res.status(201).json({
      success: true,
      transaction: {
        ...transaction,
        items: transactionItems,
        change: changeAmount
      },
      message: 'Sale completed successfully'
    });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
