import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { branchId = 1, limit = 50, offset = 0 } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: { branchId: parseInt(branchId as string) },
      include: {
        user: { select: { username: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
        items: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.transaction.count({
      where: { branchId: parseInt(branchId as string) },
    });

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id.toString(),
      transactionNumber: txn.transactionNumber,
      date: txn.createdAt.toISOString().split('T')[0],
      time: txn.createdAt.toLocaleTimeString(),
      cashier: txn.user.username,
      customer: txn.customer
        ? `${txn.customer.firstName} ${txn.customer.lastName}`
        : 'Walk-in',
      itemCount: txn.items.length,
      subtotal: parseFloat(txn.subtotal.toString()),
      tax: parseFloat(txn.tax.toString()),
      total: parseFloat(txn.total.toString()),
      status: txn.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Transaction list error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
