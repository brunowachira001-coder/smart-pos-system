import { prisma } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/types';

export class CustomerService {
  async createCustomer(data: { firstName: string; lastName: string; phone: string; email?: string; address?: string; creditLimit?: number }) {
    try {
      const customer = await prisma.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          status: 'ACTIVE',
        },
      });

      return customer;
    } catch (error) {
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
      throw error;
    }
  }

  async updateCustomer(customerId: bigint, data: any) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      const updated = await prisma.customer.update({
        where: { id: customerId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async listCustomers(limit: number = 100, offset: number = 0) {
    try {
      const customers = await prisma.customer.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return customers;
    } catch (error) {
      throw error;
    }
  }
}

export const customerService = new CustomerService();
