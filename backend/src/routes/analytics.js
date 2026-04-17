const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard metrics
router.get('/dashboard/:branchId', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { branchId: req.params.branchId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalSales, totalTransactions, totalCustomers, topProducts] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _sum: { total: true }
      }),
      prisma.transaction.count({ where }),
      prisma.customer.count({ where: { branchId: req.params.branchId } }),
      prisma.transactionItem.groupBy({
        by: ['productId'],
        where: { transaction: where },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5
      })
    ]);

    res.json({
      totalSales: totalSales._sum.total || 0,
      totalTransactions,
      totalCustomers,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date range
router.get('/sales-trend/:branchId', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const transactions = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        branchId: req.params.branchId,
        createdAt: { gte: startDate }
      },
      _sum: { total: true },
      _count: true,
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const grouped = {};
    transactions.forEach(t => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { sales: 0, transactions: 0 };
      }
      grouped[date].sales += t._sum.total || 0;
      grouped[date].transactions += t._count;
    });

    const trend = Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data
    }));

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product performance
router.get('/products/:branchId', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const products = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          branchId: req.params.branchId,
          createdAt: { gte: startDate }
        }
      },
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 20
    });

    // Get product details
    const productIds = products.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const result = products.map(p => {
      const product = productDetails.find(pd => pd.id === p.productId);
      return {
        productId: p.productId,
        productName: product?.name,
        quantity: p._sum.quantity || 0,
        revenue: p._sum.total || 0,
        transactions: p._count
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer analytics
router.get('/customers/:branchId', authMiddleware, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { branchId: req.params.branchId },
      include: {
        _count: { select: { transactions: true } }
      },
      orderBy: { totalSpent: 'desc' },
      take: 20
    });

    const analytics = customers.map(c => ({
      id: c.id,
      name: c.name,
      totalSpent: c.totalSpent,
      transactions: c._count.transactions,
      averageTransaction: c._count.transactions > 0 ? c.totalSpent / c._count.transactions : 0,
      creditUsed: c.creditUsed,
      creditLimit: c.creditLimit
    }));

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment method breakdown
router.get('/payments/:branchId', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { branchId: req.params.branchId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const payments = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { total: true },
      _count: true
    });

    const breakdown = payments.map(p => ({
      method: p.paymentMethod,
      total: p._sum.total || 0,
      count: p._count
    }));

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
