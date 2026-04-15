import type { NextApiRequest, NextApiResponse } from 'next';

const mockTransactions = [
  { id: '1', transactionNumber: 'TXN-001', date: '2024-04-15', time: '10:30:00', cashier: 'admin', customer: 'John Doe', itemCount: 3, subtotal: 5000, tax: 800, total: 5800, status: 'COMPLETED' },
  { id: '2', transactionNumber: 'TXN-002', date: '2024-04-15', time: '11:15:00', cashier: 'admin', customer: 'Walk-in', itemCount: 2, subtotal: 3000, tax: 480, total: 3480, status: 'COMPLETED' },
  { id: '3', transactionNumber: 'TXN-003', date: '2024-04-15', time: '12:00:00', cashier: 'admin', customer: 'Jane Smith', itemCount: 4, subtotal: 7500, tax: 1200, total: 8700, status: 'COMPLETED' },
  { id: '4', transactionNumber: 'TXN-004', date: '2024-04-15', time: '14:30:00', cashier: 'admin', customer: 'Walk-in', itemCount: 1, subtotal: 2000, tax: 320, total: 2320, status: 'COMPLETED' },
  { id: '5', transactionNumber: 'TXN-005', date: '2024-04-15', time: '15:45:00', cashier: 'admin', customer: 'Bob Johnson', itemCount: 5, subtotal: 9000, tax: 1440, total: 10440, status: 'COMPLETED' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ success: true, data: mockTransactions, total: mockTransactions.length });
  } catch (error) {
    console.error('Transaction list error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
