import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { branchId = 1, period = 'today' } = req.query;

    let dateFrom = new Date();
    dateFrom.setHours(0, 0, 0, 0);

    if (period === 'week') {
      dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (period === 'month') {
      dateFrom.setMonth(dateFrom.getMonth() - 1);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        branchId: parseInt(branchId as string),
        createdAt: { gte: dateFrom },
      },
      include: { items: true },
    });

    const totalSales = transactions.reduce((sum, txn) => sum + parseFloat(txn.total.toString()), 0);
    const totalTax = transactions.reduce((sum, txn) => sum + parseFloat(txn.tax.toString()), 0);
    const totalProfit = transactions.reduce((sum, txn) => {
      const profit = txn.items.reduce((itemProfit, item) => {
        const costTotal = parseFloat(item.unitPrice.toString()) * 0.6 * item.quantity; // Assume 40% margin
        return itemProfit + (parseFloat(item.total.toString()) - costTotal);
      }, 0);
      return sum + profit;
    }, 0);

    // Top products
    const productSales: any = {};
    transactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const productId = item.productId.toString();
        if (!productSales[productId]) {
          productSales[productId] = { quantity: 0, revenue: 0 };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += parseFloat(item.total.toString());
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]: any) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily sales trend
    const dailySales: any = {};
    transactions.forEach((txn) => {
      const date = txn.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += parseFloat(txn.total.toString());
    });

    const salesTrend = Object.entries(dailySales)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalTax,
          totalProfit,
          transactionCount: transactions.length,
          averageTransaction: transactions.length > 0 ? totalSales / transactions.length : 0,
        },
        topProducts,
        salesTrend,
      },
    });
  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({ error: 'Failed to fetch report summary' });
  }
}
