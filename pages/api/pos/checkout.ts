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

    if (!sessionId || !total || !amountPaid || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    const changeAmount = amountPaid - total;

    // Create sales transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('sales_transactions')
      .insert({
        transaction_number: transactionNumber,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        subtotal,
        discount,
        tax,
        total,
        amount_paid: amountPaid,
        change_amount: changeAmount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        status: 'completed',
        notes,
        cashier_id: cashierId,
        cashier_name: cashierName
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: transactionError.message });
    }

    // Create transaction items
    const transactionItems = cartItems.map(item => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      price_type: item.price_type,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('sales_transaction_items')
      .insert(transactionItems);

    if (itemsError) {
      // Rollback transaction if items insert fails
      await supabase.from('sales_transactions').delete().eq('id', transaction.id);
      return res.status(500).json({ error: itemsError.message });
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
