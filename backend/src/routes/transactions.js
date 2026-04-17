const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { branchId, customerId, startDate, endDate, skip = 0, take = 20 } = req.query;

    const where = {};
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: true,
          customer: true
        },
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      data: transactions,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true } },
        payments: true,
        user: true,
        customer: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', authMiddleware, validate(schemas.createTransaction), async (req, res) => {
  try {
    const { userId, customerId, branchId, items, paymentMethod, discount = 0, notes } = req.validated;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice - (item.discount || 0);
    }

    const tax = subtotal * 0.16; // 16% tax
    const total = subtotal + tax - discount;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber: `TXN-${Date.now()}`,
        userId,
        customerId,
        branchId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.quantity * item.unitPrice - (item.discount || 0)
          }))
        },
        payments: {
          create: {
            amount: total,
            method: paymentMethod
          }
        }
      },
      include: {
        items: { include: { product: true } },
        payments: true
      }
    });

    // Update customer total spent
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { totalSpent: { increment: total } }
      });
    }

    // Update inventory
    for (const item of items) {
      await prisma.inventory.updateMany({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } }
      });
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily sales
router.get('/daily/:branchId', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        branchId: req.params.branchId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { items: true }
    });

    const summary = {
      totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
      totalTransactions: transactions.length,
      totalItems: transactions.reduce((sum, t) => sum + t.items.length, 0),
      averageTransaction: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length : 0
    };

    res.json({ transactions, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
