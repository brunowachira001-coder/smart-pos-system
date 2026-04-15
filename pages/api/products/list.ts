import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data - works without database
const mockProducts = [
  { id: '1', sku: 'PROD001', name: 'Milk (1L)', description: 'Fresh milk', category: 'Dairy', price: 150, wholesalePrice: 140, costPrice: 80, stock: 100, barcode: '123456789' },
  { id: '2', sku: 'PROD002', name: 'Bread (Loaf)', description: 'Fresh bread', category: 'Bakery', price: 80, wholesalePrice: 75, costPrice: 40, stock: 50, barcode: '123456790' },
  { id: '3', sku: 'PROD003', name: 'Eggs (Dozen)', description: 'Fresh eggs', category: 'Dairy', price: 200, wholesalePrice: 190, costPrice: 120, stock: 75, barcode: '123456791' },
  { id: '4', sku: 'PROD004', name: 'Rice (2kg)', description: 'White rice', category: 'Grains', price: 300, wholesalePrice: 280, costPrice: 180, stock: 120, barcode: '123456792' },
  { id: '5', sku: 'PROD005', name: 'Sugar (1kg)', description: 'White sugar', category: 'Groceries', price: 120, wholesalePrice: 110, costPrice: 70, stock: 90, barcode: '123456793' },
  { id: '6', sku: 'PROD006', name: 'Cooking Oil (1L)', description: 'Vegetable oil', category: 'Oils', price: 250, wholesalePrice: 240, costPrice: 150, stock: 60, barcode: '123456794' },
  { id: '7', sku: 'PROD007', name: 'Beans (1kg)', description: 'Dried beans', category: 'Grains', price: 180, wholesalePrice: 170, costPrice: 100, stock: 80, barcode: '123456795' },
  { id: '8', sku: 'PROD008', name: 'Flour (2kg)', description: 'Wheat flour', category: 'Grains', price: 140, wholesalePrice: 130, costPrice: 80, stock: 100, barcode: '123456796' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ success: true, data: mockProducts });
  } catch (error) {
    console.error('Product list error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
