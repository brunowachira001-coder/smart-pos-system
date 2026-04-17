const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get audit logs
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { userId, action, startDate, endDate, skip = 0, take = 50 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: true },
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      data: logs,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log action
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { action, entity, entityId, changes, ipAddress } = req.body;

    const log = await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action,
        entity,
        entityId,
        changes: JSON.stringify(changes),
        ipAddress
      }
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity
router.get('/user/:userId', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await prisma.auditLog.findMany({
      where: {
        userId: req.params.userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      totalActions: logs.length,
      actionsByType: {},
      actionsByEntity: {}
    };

    logs.forEach(log => {
      summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
      summary.actionsByEntity[log.entity] = (summary.actionsByEntity[log.entity] || 0) + 1;
    });

    res.json({ logs, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
