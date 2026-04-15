import { prisma } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/types';
import { logger } from '@/lib/logger';

export class InventoryService {
  async getInventory(productId: bigint | number, branchId: bigint | number) {
    try {
      const inventory = await prisma.branchInventory.findFirst({
        where: {
          productId: BigInt(productId),
          branchId: Number(branchId),
        },
      });

      if (!inventory) {
        throw new NotFoundError('Inventory item not found');
      }

      return inventory;
    } catch (error) {
      logger.error('Failed to get inventory', error);
      throw error;
    }
  }

  async updateStock(productId: bigint | number, branchId: bigint | number, quantity: number, reason: string, userId: bigint | number) {
    try {
      const inventory = await prisma.branchInventory.findFirst({
        where: { productId: BigInt(productId), branchId: Number(branchId) },
      });

      if (!inventory) {
        throw new NotFoundError('Inventory item not found');
      }

      const newQuantity = inventory.stockLevel + quantity;

      if (newQuantity < 0) {
        throw new ValidationError('Insufficient stock');
      }

      // Update inventory
      const updated = await prisma.branchInventory.update({
        where: { id: inventory.id },
        data: {
          stockLevel: newQuantity,
          lastStockCheck: new Date(),
        },
      });

      logger.info(`Stock updated for product ${productId}: ${quantity}`);
      return updated;
    } catch (error) {
      logger.error('Failed to update stock', error);
      throw error;
    }
  }

  async checkLowStock(branchId: bigint | number) {
    try {
      const lowStockItems = await prisma.branchInventory.findMany({
        where: {
          branchId: Number(branchId),
          stockLevel: {
            lte: 10, // Default reorder level
          },
        },
        include: { product: true },
      });

      return lowStockItems;
    } catch (error) {
      logger.error('Failed to check low stock', error);
      throw error;
    }
  }

  async reconcileInventory(branchId: bigint | number, items: Array<{ productId: bigint | number; actualQuantity: number }>, userId: bigint | number) {
    try {
      const results = [];

      for (const item of items) {
        const inventory = await prisma.branchInventory.findFirst({
          where: { productId: BigInt(item.productId), branchId: Number(branchId) },
        });

        if (!inventory) continue;

        const difference = item.actualQuantity - inventory.stockLevel;

        if (difference !== 0) {
          const updated = await prisma.branchInventory.update({
            where: { id: inventory.id },
            data: {
              stockLevel: item.actualQuantity,
              lastStockCheck: new Date(),
            },
          });

          results.push(updated);
        }
      }

      logger.info(`Inventory reconciled for branch ${branchId}: ${results.length} items adjusted`);
      return results;
    } catch (error) {
      logger.error('Failed to reconcile inventory', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
