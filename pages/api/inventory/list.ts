import type { NextApiRequest, NextApiResponse } from 'next';

const mockInventory = [
  { id: '1', productId: '1', sku: 'PROD001', name: 'Milk (1L)', category: 'Dairy', price: 150, stock: 100, reorderPoint: 20, status: 'OK' },
  { id: '2', productId: '2', sku: 'PROD002', name: 'Bread (Loaf)', category: 'Bakery', price: 80, stock: 15, reorderPoint: 20, status: 'LOW_STOCK' },
  { id: '3', productId: '3', sku: 'PROD003', name: 'Eggs (Dozen)', category: 'Dairy', price: 200, stock: 75, reorderPoint: 30, status: 'OK' },
  { id: '4', productId: '4', sku: 'PROD004', name: 'Rice (2kg)', category: 'Grains', price: 300, stock: 120, reorderPoint: 50, status: 'OK' },
  { id: '5', productId: '5', sku: 'PROD005', name: 'Sugar (1kg)', category: 'Groceries', price: 120, stock: 90, reorderPoint: 30, status: 'OK' },
  { id: '6', productId: '6', sku: 'PROD006', name: 'Cooking Oil (1L)', category: 'Oils', price: 250, stock: 5, reorderPoint: 20, status: 'LOW_STOCK' },
  { id: '7', productId: '7', sku: 'PROD007', name: 'Beans (1kg)', category: 'Grains', price: 180, stock: 80, reorderPoint: 20, status: 'OK' },
  { id: '8', productId: '8', sku: 'PROD008', name: 'Flour (2kg)', category: 'Grains', price: 140, stock: 100, reorderPoint: 30, status: 'OK' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ success: true, data: mockInventory });
  } catch (error) {
    console.error('Inventory list error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}
