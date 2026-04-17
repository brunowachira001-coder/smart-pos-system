const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateTokens } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, branchId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        branchId,
        role: 'CASHIER'
      }
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { username, password } = req.validated;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        branchId: user.branchId
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { branch: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await prisma.session.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
