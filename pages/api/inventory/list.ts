import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { branchId = 1 } = req.query;

    const inventory = await prisma.branchInventory.findMany({
      where: { branchId: parseInt(branchId as string) },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });

    const formattedInventory = inventory.map((item) => ({
      id: item.id.toString(),
      productId: item.product.id.toString(),
      sku: item.product.sku,
      name: item.product.name,
      category: item.product.category?.categoryName,
      price: parseFloat(item.product.retailPrice.toString()),
      stock: item.stockLevel,
      reorderPoint: item.reorderPoint,
      status: item.stockLevel <= (item.reorderPoint || 20) ? 'LOW_STOCK' : 'OK',
    }));

    res.status(200).json({ success: true, data: formattedInventory });
  } catch (error) {
    console.error('Inventory list error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}
