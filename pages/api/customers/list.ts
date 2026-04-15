import type { NextApiRequest, NextApiResponse } from 'next';

const mockCustomers = [
  { id: '1', name: 'John Doe', phone: '+254712345678', email: 'john@example.com', address: '123 Main St', city: 'Nairobi', totalPurchases: 15, totalSpent: 45000, creditLimit: 50000, creditUsed: 10000, status: 'ACTIVE' },
  { id: '2', name: 'Jane Smith', phone: '+254712345679', email: 'jane@example.com', address: '456 Oak Ave', city: 'Nairobi', totalPurchases: 8, totalSpent: 28000, creditLimit: 30000, creditUsed: 5000, status: 'ACTIVE' },
  { id: '3', name: 'Bob Johnson', phone: '+254712345680', email: 'bob@example.com', address: '789 Pine Rd', city: 'Mombasa', totalPurchases: 12, totalSpent: 52000, creditLimit: 60000, creditUsed: 15000, status: 'ACTIVE' },
  { id: '4', name: 'Alice Williams', phone: '+254712345681', email: 'alice@example.com', address: '321 Elm St', city: 'Kisumu', totalPurchases: 5, totalSpent: 18000, creditLimit: 20000, creditUsed: 2000, status: 'ACTIVE' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ success: true, data: mockCustomers, total: mockCustomers.length });
  } catch (error) {
    console.error('Customer list error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}
