import { prisma } from '@/lib/prisma';
import { Transaction, TransactionItem, Payment, ValidationError, NotFoundError } from '@/types';
import { logger } from '@/lib/logger';

export class POSService {
  async createTransaction(data: {
    branchId: bigint | number;
    customerId?: bigint | number;
    items: Array<{ productId: bigint | number; quantity: number; unitPrice: number; discountPercent?: number }>;
    discountAmount: number;
    taxAmount: number;
    createdBy: bigint | number;
  }) {
    try {
      // Validate items
      if (!data.items || data.items.length === 0) {
        throw new ValidationError('Transaction must have at least one item');
      }

      // Calculate totals
      let subtotal = 0;
      for (const item of data.items) {
        const lineTotal = item.quantity * item.unitPrice;
        const discount = lineTotal * ((item.discountPercent || 0) / 100);
        subtotal += lineTotal - discount;
      }

      const netAmount = subtotal - data.discountAmount + data.taxAmount;

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          branchId: Number(data.branchId),
          customerId: data.customerId ? BigInt(data.customerId) : null,
          transactionNumber: `TXN-${Date.now()}`,
          subtotal: subtotal,
          discount: data.discountAmount,
          tax: data.taxAmount,
          total: netAmount,
          status: 'COMPLETED',
          userId: BigInt(data.createdBy),
          items: {
            create: data.items.map((item) => ({
              productId: BigInt(item.productId),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100),
              total: item.quantity * item.unitPrice - (item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100)),
            })),
          },
        },
        include: { items: true, payments: true },
      });

      logger.info(`Transaction created: ${transaction.transactionNumber}`);
      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', error);
      throw error;
    }
  }

  async parkTransaction(transactionId: bigint | number) {
    try {
      const transaction = await prisma.transaction.update({
        where: { id: BigInt(transactionId) },
        data: { status: 'PARKED' },
        include: { items: true, payments: true },
      });

      logger.info(`Transaction parked: ${transaction.transactionNumber}`);
      return transaction;
    } catch (error) {
      logger.error('Failed to park transaction', error);
      throw error;
    }
  }

  async completeTransaction(transactionId: bigint | number, payments: Array<{ method: string; amount: number }>) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: BigInt(transactionId) },
        include: { items: true },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      // Validate payment amount
      const totalPayment = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPayment < Number(transaction.total)) {
        throw new ValidationError('Insufficient payment amount');
      }

      // Update transaction
      const updated = await prisma.transaction.update({
        where: { id: BigInt(transactionId) },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: { items: true, payments: true },
      });

      logger.info(`Transaction completed: ${transaction.transactionNumber}`);
      return updated;
    } catch (error) {
      logger.error('Failed to complete transaction', error);
      throw error;
    }
  }

  async searchProducts(query: string, branchId: bigint | number, limit: number = 20) {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [{ name: { contains: query, mode: 'insensitive' } }, { sku: { contains: query, mode: 'insensitive' } }],
          status: 'ACTIVE',
        },
        take: limit,
      });

      return products;
    } catch (error) {
      logger.error('Product search failed', error);
      throw error;
    }
  }
}

export const posService = new POSService();
