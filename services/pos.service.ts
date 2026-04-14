import { prisma } from '@/lib/prisma';
import { Transaction, TransactionItem, Payment, ValidationError, NotFoundError } from '@/types';
import { logger } from '@/lib/logger';

export class POSService {
  async createTransaction(data: {
    branchId: bigint;
    customerId?: bigint;
    items: Array<{ productId: bigint; quantity: number; unitPrice: number; discountPercent?: number }>;
    discountAmount: number;
    taxAmount: number;
    createdBy: bigint;
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
          branchId: data.branchId,
          customerId: data.customerId,
          transactionNumber: `TXN-${Date.now()}`,
          totalAmount: subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          netAmount,
          paymentStatus: 'PENDING',
          transactionStatus: 'ACTIVE',
          createdBy: data.createdBy,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || 0,
              discountAmount: item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100),
              lineTotal: item.quantity * item.unitPrice - (item.quantity * item.unitPrice * ((item.discountPercent || 0) / 100)),
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

  async parkTransaction(transactionId: bigint) {
    try {
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { transactionStatus: 'PARKED' },
        include: { items: true, payments: true },
      });

      logger.info(`Transaction parked: ${transaction.transactionNumber}`);
      return transaction;
    } catch (error) {
      logger.error('Failed to park transaction', error);
      throw error;
    }
  }

  async completeTransaction(transactionId: bigint, payments: Array<{ method: string; amount: number }>) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { items: true },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      // Validate payment amount
      const totalPayment = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPayment < transaction.netAmount) {
        throw new ValidationError('Insufficient payment amount');
      }

      // Create payments
      const createdPayments = await Promise.all(
        payments.map((payment) =>
          prisma.payment.create({
            data: {
              transactionId,
              paymentMethod: payment.method as any,
              amount: payment.amount,
              status: 'COMPLETED',
            },
          })
        )
      );

      // Update transaction
      const updated = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          transactionStatus: 'COMPLETED',
          paymentStatus: 'COMPLETED',
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

  async searchProducts(query: string, branchId: bigint, limit: number = 20) {
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
