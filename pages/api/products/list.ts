import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { branchId = 1, category } = req.query;

    let where: any = { status: 'ACTIVE' };

    if (category) {
      where.category = { categoryName: category };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        branchInventory: {
          where: { branchId: parseInt(branchId as string) },
        },
        branchPricing: {
          where: { branchId: parseInt(branchId as string) },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id.toString(),
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category?.categoryName,
      price: parseFloat(product.branchPricing[0]?.retailPrice.toString() || product.retailPrice.toString()),
      wholesalePrice: parseFloat(product.branchPricing[0]?.wholesalePrice.toString() || product.wholesalePrice.toString()),
      costPrice: parseFloat(product.costPrice.toString()),
      stock: product.branchInventory[0]?.stockLevel || 0,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
    }));

    res.status(200).json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Product list error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
