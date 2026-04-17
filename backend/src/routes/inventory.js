const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get inventory by branch
router.get('/branch/:branchId', authMiddleware, async (req, res) => {
  try {
    const { search, lowStockOnly = false } = req.query;

    const where = { branchId: req.params.branchId };

    if (lowStockOnly === 'true') {
      where.quantity = { lte: prisma.inventory.fields.minStock };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { product: { name: 'asc' } }
    });

    const filtered = search
      ? inventory.filter(item =>
          item.product.name.toLowerCase().includes(search.toLowerCase()) ||
          item.product.sku.toLowerCase().includes(search.toLowerCase())
        )
      : inventory;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock items
router.get('/low-stock/:branchId', authMiddleware, async (req, res) => {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        branchId: req.params.branchId,
        quantity: {
          lte: prisma.inventory.fields.minStock
        }
      },
      include: {
        product: true
      }
    });

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']), async (req, res) => {
  try {
    const { quantity, minStock, maxStock } = req.body;

    const inventory = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        quantity,
        minStock,
        maxStock,
        lastRestockDate: new Date()
      },
      include: { product: true }
    });

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adjust inventory
router.post('/adjust/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']), async (req, res) => {
  try {
    const { adjustment, reason } = req.body;

    const inventory = await prisma.inventory.findUnique({
      where: { id: req.params.id }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        quantity: inventory.quantity + adjustment
      },
      include: { product: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory summary
router.get('/summary/:branchId', authMiddleware, async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      where: { branchId: req.params.branchId },
      include: { product: true }
    });

    const summary = {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.product.cost), 0),
      lowStockCount: inventory.filter(item => item.quantity <= item.minStock).length,
      outOfStock: inventory.filter(item => item.quantity === 0).length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
