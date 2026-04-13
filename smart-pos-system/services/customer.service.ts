import { prisma } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/types';
import { logger } from '@/lib/logger';

export class CustomerService {
  async createCustomer(data: { name: string; phone: string; email?: string; address?: string; creditLimit: number }) {
    try {
      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          creditLimit: data.creditLimit,
          creditUsed: 0,
          status: 'ACTIVE',
        },
      });

      logger.info(`Customer created: ${customer.name}`);
      return customer;
    } catch (error) {
      logger.error('Failed to create customer', error);
      throw error;
    }
  }

  async getCustomer(customerId: bigint) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      return customer;
    } catch (error) {
      logger.error('Failed to get customer', error);
      throw error;
    }
  }

  async updateCredit(customerId: bigint, amount: number, isPayment: boolean = false) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      const newCreditUsed = isPayment ? Math.max(0, customer.creditUsed - amount) : customer.creditUsed + amount;

      if (newCreditUsed > customer.creditLimit) {
        throw new ValidationError('Credit limit exceeded');
      }

      const updated = await prisma.customer.update({
        where: { id: customerId },
        data: { creditUsed: newCreditUsed, updatedAt: new Date() },
      });

      logger.info(`Customer credit updated: ${customerId}, amount: ${amount}, isPayment: ${isPayment}`);
      return updated;
    } catch (error) {
      logger.error('Failed to update customer credit', error);
      throw error;
    }
  }

  async getOverdueDebts(branchId?: bigint) {
    try {
      const debts = await prisma.customerDebt.findMany({
        where: {
          status: 'OVERDUE',
        },
        include: { customer: true },
      });

      return debts;
    } catch (error) {
      logger.error('Failed to get overdue debts', error);
      throw error;
    }
  }

  async recordPayment(customerId: bigint, amount: number) {
    try {
      const debt = await prisma.customerDebt.findFirst({
        where: { customerId, status: 'CURRENT' },
        orderBy: { dueDate: 'asc' },
      });

      if (!debt) {
        throw new NotFoundError('No outstanding debt found');
      }

      const updated = await prisma.customerDebt.update({
        where: { id: debt.id },
        data: {
          amount: Math.max(0, debt.amount - amount),
          status: debt.amount - amount <= 0 ? 'PAID' : 'CURRENT',
          paidDate: debt.amount - amount <= 0 ? new Date() : undefined,
        },
      });

      // Update customer credit
      await this.updateCredit(customerId, amount, true);

      logger.info(`Payment recorded for customer ${customerId}: ${amount}`);
      return updated;
    } catch (error) {
      logger.error('Failed to record payment', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
