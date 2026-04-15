import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, paymentMethod, amountPaid } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const transactionItems = [];

    for (const item of items) {
      // Mock product prices
      const prices: any = {
        '1': 150, '2': 80, '3': 200, '4': 300, '5': 120, '6': 250, '7': 180, '8': 140,
      };
      const price = prices[item.id] || 100;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      transactionItems.push({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: price,
        discount: item.discount || 0,
        total: itemTotal - (item.discount || 0),
      });
    }

    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    if (amountPaid < total) {
      return res.status(400).json({ error: 'Insufficient payment' });
    }

    const transactionNumber = `TXN-${Date.now()}`;

    res.status(201).json({
      success: true,
      data: {
        transactionId: Math.random().toString(),
        transactionNumber,
        total,
        change: amountPaid - total,
        items: transactionItems,
      },
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}
