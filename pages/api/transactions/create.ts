import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, paymentMethod, amountPaid, customerId, branchId = 1, userId = 1 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: BigInt(item.id) },
      });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.id} not found` });
      }

      const itemTotal = parseFloat(product.retailPrice.toString()) * item.quantity;
      subtotal += itemTotal;

      transactionItems.push({
        productId: BigInt(item.id),
        quantity: item.quantity,
        unitPrice: product.retailPrice,
        discount: item.discount || 0,
        total: itemTotal - (item.discount || 0),
      });
    }

    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    if (amountPaid < total) {
      return res.status(400).json({ error: 'Insufficient payment' });
    }

    // Create transaction
    const transactionNumber = `TXN-${Date.now()}`;
    const transaction = await prisma.transaction.create({
      data: {
        branchId: parseInt(branchId),
        transactionNumber,
        userId: BigInt(userId),
        customerId: customerId ? BigInt(customerId) : null,
        subtotal,
        tax,
        discount: 0,
        total,
        status: 'COMPLETED',
        completedAt: new Date(),
        items: {
          create: transactionItems,
        },
        payments: {
          create: {
            paymentMethodId: 1, // Default to cash
            amount: total,
            currency: 'KES',
            branchId: parseInt(branchId),
            userId: BigInt(userId),
            status: 'COMPLETED',
            referenceNumber: transactionNumber,
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Update inventory
    for (const item of items) {
      const inventory = await prisma.branchInventory.findUnique({
        where: {
          branchId_productId: {
            branchId: parseInt(branchId),
            productId: BigInt(item.id),
          },
        },
      });

      if (inventory) {
        await prisma.branchInventory.update({
          where: { id: inventory.id },
          data: {
            stockLevel: Math.max(0, inventory.stockLevel - item.quantity),
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        transactionId: transaction.id,
        transactionNumber: transaction.transactionNumber,
        total: transaction.total,
        change: amountPaid - total,
        items: transaction.items,
      },
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}
