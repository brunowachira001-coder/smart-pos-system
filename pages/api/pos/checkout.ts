import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { tenantId } = req;
  const db = getAdminDb();

  try {
    const {
      sessionId,
      customerId,
      customerName,
      customerPhone,
      total,
      amountPaid,
      paymentMethod,
      notes,
      cashierName
    } = req.body;

    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    if (!total) return res.status(400).json({ error: 'Total amount is required' });
    if (!paymentMethod) return res.status(400).json({ error: 'Payment method is required' });
    if (paymentMethod !== 'debt' && !amountPaid) {
      return res.status(400).json({ error: 'Amount paid is required' });
    }

    if (paymentMethod === 'debt') {
      if (!customerId) {
        return res.status(400).json({ error: 'Customer is required for debt payment' });
      }

      const { data: customer, error: customerError } = await db
        .from('customers')
        .select('debt_limit, name')
        .eq('id', customerId)
        .eq('tenant_id', tenantId)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const debtLimit = parseFloat(customer.debt_limit || '0');
      if (debtLimit <= 0) {
        return res.status(400).json({ error: 'Customer does not have a credit limit set' });
      }

      const { data: debts } = await db
        .from('debts')
        .select('amount_remaining')
        .eq('customer_id', customerId)
        .eq('tenant_id', tenantId)
        .neq('status', 'Paid');

      const currentDebt = debts?.reduce((sum, d) => sum + parseFloat(d.amount_remaining || '0'), 0) || 0;
      const availableCredit = debtLimit - currentDebt;

      if (total > availableCredit) {
        return res.status(400).json({
          error: `Insufficient credit. Available: KES ${availableCredit.toFixed(2)}`
        });
      }
    }

    const { data: cartItems, error: cartError } = await db
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId);

    if (cartError) {
      return res.status(500).json({ error: `Cart error: ${cartError.message}` });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const saleNumber = `SALE-${Math.floor(Math.random() * 900000 + 100000)}`;
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: transaction, error: transactionError } = await db
      .from('transactions')
      .insert({
        tenant_id: tenantId,
        transaction_id: transactionNumber,
        customer_id: customerId || null,
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone || null,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'completed',
        notes: notes || null,
        created_by: cashierName || null
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: `Transaction error: ${transactionError.message}` });
    }

    const transactionItems = cartItems.map(item => ({
      tenant_id: tenantId,
      transaction_id: transaction.transaction_id,
      product_id: item.product_id,
      product_name: item.product_name || 'Unknown Product',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.subtotal
    }));

    const { error: itemsError } = await db
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) {
      await db.from('transactions').delete().eq('id', transaction.id).eq('tenant_id', tenantId);
      return res.status(500).json({ error: `Items error: ${itemsError.message}` });
    }

    if (paymentMethod === 'debt') {
      const { data: customer } = await db
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .eq('tenant_id', tenantId)
        .single();

      const { error: debtError } = await db
        .from('debts')
        .insert({
          tenant_id: tenantId,
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
        await db.from('transaction_items').delete().eq('transaction_id', transaction.transaction_id).eq('tenant_id', tenantId);
        await db.from('transactions').delete().eq('id', transaction.id).eq('tenant_id', tenantId);
        return res.status(500).json({ error: `Debt error: ${debtError.message}` });
      }
    }

    for (const item of cartItems) {
      const { data: product } = await db
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .eq('tenant_id', tenantId)
        .single();

      if (product) {
        const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
        await db
          .from('products')
          .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', item.product_id)
          .eq('tenant_id', tenantId);
      }
    }

    await db.from('cart_items').delete().eq('session_id', sessionId).eq('tenant_id', tenantId);

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
});
