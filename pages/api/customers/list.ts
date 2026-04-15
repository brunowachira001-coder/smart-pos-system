import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { branchId = 1, limit = 50, offset = 0 } = req.query;

    const customers = await prisma.customer.findMany({
      include: {
        branchCustomers: {
          where: { branchId: parseInt(branchId as string) },
        },
        transactions: {
          where: { branchId: parseInt(branchId as string) },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.customer.count();

    const formattedCustomers = customers.map((customer) => ({
      id: customer.id.toString(),
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      totalPurchases: customer.transactions.length,
      totalSpent: customer.transactions.reduce((sum, txn) => sum + parseFloat(txn.total.toString()), 0),
      creditLimit: customer.branchCustomers[0]?.localCreditLimit
        ? parseFloat(customer.branchCustomers[0].localCreditLimit.toString())
        : 0,
      creditUsed: customer.branchCustomers[0]?.localDebtBalance
        ? parseFloat(customer.branchCustomers[0].localDebtBalance.toString())
        : 0,
      status: customer.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedCustomers,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Customer list error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}
