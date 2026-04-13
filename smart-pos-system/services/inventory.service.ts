import { prisma } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/types';
import { logger } from '@/lib/logger';

export class InventoryService {
  async getInventory(productId: bigint, branchId: bigint) {
    try {
      const inventory = await prisma.inventoryItem.findUnique({
        where: {
          productId_branchId: { productId, branchId },
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

  async updateStock(productId: bigint, branchId: bigint, quantity: number, reason: string, userId: bigint) {
    try {
      const inventory = await prisma.inventoryItem.findUnique({
        where: { productId_branchId: { productId, branchId } },
      });

      if (!inventory) {
        throw new NotFoundError('Inventory item not found');
      }

      const newQuantity = inventory.quantityOnHand + quantity;

      if (newQuantity < 0) {
        throw new ValidationError('Insufficient stock');
      }

      // Update inventory
      const updated = await prisma.inventoryItem.update({
        where: { productId_branchId: { productId, branchId } },
        data: {
          quantityOnHand: newQuantity,
          quantityAvailable: Math.max(0, newQuantity - inventory.quantityReserved),
          updatedAt: new Date(),
        },
      });

      // Log movement
      await prisma.stockMovement.create({
        data: {
          productId,
          branchId,
          movementType: quantity > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantity),
          reason,
          createdBy: userId,
        },
      });

      logger.info(`Stock updated for product ${productId}: ${quantity}`);
      return updated;
    } catch (error) {
      logger.error('Failed to update stock', error);
      throw error;
    }
  }

  async checkLowStock(branchId: bigint) {
    try {
      const lowStockItems = await prisma.inventoryItem.findMany({
        where: {
          branchId,
          quantityAvailable: {
            lte: prisma.inventoryItem.fields.reorderLevel,
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

  async reconcileInventory(branchId: bigint, items: Array<{ productId: bigint; actualQuantity: number }>, userId: bigint) {
    try {
      const results = [];

      for (const item of items) {
        const inventory = await prisma.inventoryItem.findUnique({
          where: { productId_branchId: { productId: item.productId, branchId } },
        });

        if (!inventory) continue;

        const difference = item.actualQuantity - inventory.quantityOnHand;

        if (difference !== 0) {
          const updated = await prisma.inventoryItem.update({
            where: { productId_branchId: { productId: item.productId, branchId } },
            data: {
              quantityOnHand: item.actualQuantity,
              quantityAvailable: Math.max(0, item.actualQuantity - inventory.quantityReserved),
              updatedAt: new Date(),
            },
          });

          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              branchId,
              movementType: 'ADJUSTMENT',
              quantity: Math.abs(difference),
              reason: 'Inventory reconciliation',
              createdBy: userId,
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
