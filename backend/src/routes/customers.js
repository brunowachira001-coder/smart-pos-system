const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { branchId, search, skip = 0, take = 20 } = req.query;

    const where = { isActive: true };
    if (branchId) where.branchId = branchId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      data: customers,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        transactions: { take: 10, orderBy: { createdAt: 'desc' } },
        creditHistory: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', authMiddleware, validate(schemas.createCustomer), async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: req.validated
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add credit
router.post('/:id/credit', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        creditUsed: customer.creditUsed + amount
      }
    });

    await prisma.creditHistory.create({
      data: {
        customerId: req.params.id,
        amount,
        type: 'CREDIT_ADDED',
        reason
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make payment
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        creditUsed: Math.max(0, customer.creditUsed - amount)
      }
    });

    await prisma.creditHistory.create({
      data: {
        customerId: req.params.id,
        amount,
        type: 'PAYMENT'
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer statistics
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { customerId: req.params.id }
    });

    const stats = {
      totalTransactions: transactions.length,
      totalSpent: customer.totalSpent,
      averageTransaction: transactions.length > 0 ? customer.totalSpent / transactions.length : 0,
      creditUsed: customer.creditUsed,
      creditAvailable: customer.creditLimit - customer.creditUsed
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
