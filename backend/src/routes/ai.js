const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get AI recommendations
router.get('/recommendations/:branchId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;

    // Get product sales data
    const salesData = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: { branchId: req.params.branchId }
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });

    // Get inventory data
    const inventory = await prisma.inventory.findMany({
      where: { branchId: req.params.branchId },
      include: { product: true }
    });

    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);

    const recommendations = {
      topSellingProducts: salesData.slice(0, 5),
      lowStockAlert: lowStockItems.map(i => ({
        productId: i.productId,
        productName: i.product.name,
        currentStock: i.quantity,
        minStock: i.minStock,
        recommendation: `Restock ${i.product.name} - current stock: ${i.quantity}`
      })),
      timestamp: new Date()
    };

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales forecast
router.get('/forecast/:branchId', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get historical sales data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const historicalSales = await prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        branchId: req.params.branchId,
        createdAt: { gte: startDate }
      },
      _sum: { total: true },
      _count: true
    });

    // Simple forecast based on average
    const avgDailySales = historicalSales.length > 0
      ? historicalSales.reduce((sum, s) => sum + (s._sum.total || 0), 0) / historicalSales.length
      : 0;

    const forecast = {
      averageDailySales: avgDailySales,
      projectedMonthly: avgDailySales * 30,
      projectedQuarterly: avgDailySales * 90,
      confidence: 0.75,
      basedOnDays: historicalSales.length
    };

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat with AI assistant
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, branchId } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    // Get context from database
    const context = await getContextData(branchId);

    const systemPrompt = `You are a Smart POS System AI Assistant. You help with:
- Sales analysis and insights
- Inventory management recommendations
- Customer analytics
- Business intelligence

Current Business Context:
${JSON.stringify(context, null, 2)}

Provide concise, actionable insights based on the data.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0].message.content;

    // Save chat message
    await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        role: 'USER',
        content: message,
        context: JSON.stringify(context)
      }
    });

    await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        role: 'ASSISTANT',
        content: assistantMessage
      }
    });

    res.json({
      message: assistantMessage,
      context
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
router.get('/chat-history', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI insights
router.get('/insights/:branchId', authMiddleware, async (req, res) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: {
        product: {
          inventory: {
            some: { branchId: req.params.branchId }
          }
        }
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get context data
async function getContextData(branchId) {
  const [totalSales, transactions, customers, inventory] = await Promise.all([
    prisma.transaction.aggregate({
      where: { branchId },
      _sum: { total: true }
    }),
    prisma.transaction.count({ where: { branchId } }),
    prisma.customer.count({ where: { branchId } }),
    prisma.inventory.findMany({
      where: { branchId },
      include: { product: true }
    })
  ]);

  return {
    totalSales: totalSales._sum.total || 0,
    totalTransactions: transactions,
    totalCustomers: customers,
    lowStockItems: inventory.filter(i => i.quantity <= i.minStock).length,
    outOfStockItems: inventory.filter(i => i.quantity === 0).length
  };
}

module.exports = router;
