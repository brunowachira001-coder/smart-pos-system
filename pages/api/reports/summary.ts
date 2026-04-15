import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mockData = {
      summary: {
        totalSales: 30340,
        totalTax: 4854,
        totalProfit: 12136,
        transactionCount: 5,
        averageTransaction: 6068,
      },
      topProducts: [
        { productId: '4', quantity: 120, revenue: 36000 },
        { productId: '3', quantity: 75, revenue: 15000 },
        { productId: '1', quantity: 100, revenue: 15000 },
        { productId: '7', quantity: 80, revenue: 14400 },
        { productId: '6', quantity: 60, revenue: 15000 },
      ],
      salesTrend: [
        { date: '2024-04-13', sales: 8000 },
        { date: '2024-04-14', sales: 12000 },
        { date: '2024-04-15', sales: 30340 },
      ],
    };

    res.status(200).json({ success: true, data: mockData });
  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({ error: 'Failed to fetch report summary' });
  }
}
