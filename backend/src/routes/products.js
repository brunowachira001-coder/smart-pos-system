const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { categoryId, search, skip = 0, take = 20 } = req.query;

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      data: products,
      pagination: {
        total,
        skip: parseInt(skip),
        take: parseInt(take)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        inventory: true,
        aiInsights: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), validate(schemas.createProduct), async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.validated,
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true }
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories/list', authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/categories', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: { name, description }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
