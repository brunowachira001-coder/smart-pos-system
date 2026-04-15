import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class AnalyticsService {
  async getDailySalesReport(branchId: bigint | number, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const transactions = await prisma.transaction.findMany({
        where: {
          branchId: Number(branchId),
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
        },
        include: { items: true },
      });

      const totalSales = transactions.reduce((sum: number, t: any) => sum + t.netAmount, 0);
      const totalDiscount = transactions.reduce((sum: number, t: any) => sum + t.discountAmount, 0);
      const totalTax = transactions.reduce((sum: number, t: any) => sum + t.taxAmount, 0);

      const report = {
        branchId,
        reportDate: date,
        totalSales,
        totalTransactions: transactions.length,
        averageTransactionValue: transactions.length > 0 ? totalSales / transactions.length : 0,
        totalDiscount,
        totalTax,
        totalReturns: 0,
        totalRefunds: 0,
      };

      logger.info(`Daily sales report generated for branch ${branchId}`);
      return report;
    } catch (error) {
      logger.error('Failed to generate daily sales report', error);
      throw error;
    }
  }

  async getProductAnalytics(productId: bigint | number, branchId: bigint | number, period: 'DAILY' | 'WEEKLY' | 'MONTHLY', periodDate: Date) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          branchId: Number(branchId),
          items: { some: { productId: Number(productId) } },
          status: 'COMPLETED',
        },
        include: { items: true },
      });

      let unitsSold = 0;
      let revenue = 0;

      for (const transaction of transactions) {
        const item = transaction.items.find((i: any) => i.productId === Number(productId));
        if (item) {
          unitsSold += item.quantity;
          revenue += Number(item.total);
        }
      }

      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      const costOfGoodsSold = unitsSold * Number(product?.costPrice || 0);
      const profit = revenue - costOfGoodsSold;

      const analytics = {
        productId,
        branchId,
        period,
        periodDate,
        unitsSold,
        revenue,
        profit,
        returnRate: 0,
      };

      logger.info(`Product analytics generated for product ${productId}`);
      return analytics;
    } catch (error) {
      logger.error('Failed to generate product analytics', error);
      throw error;
    }
  }

  async getTopProducts(branchId: bigint | number, limit: number = 10) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          branchId: Number(branchId),
          status: 'COMPLETED',
        },
        include: { items: { include: { product: true } } },
      });

      const productMap = new Map<bigint, { product: any; quantity: number; revenue: number }>();

      for (const transaction of transactions) {
        for (const item of transaction.items) {
          const existing = productMap.get(item.productId);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += Number(item.total);
          } else {
            productMap.set(item.productId, {
              product: item.product,
              quantity: item.quantity,
              revenue: Number(item.total),
            });
          }
        }
      }

      const topProducts = Array.from(productMap.values())
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      logger.error('Failed to get top products', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
