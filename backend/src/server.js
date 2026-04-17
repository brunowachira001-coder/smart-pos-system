const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const app = express();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customers');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const auditRoutes = require('./routes/audit');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Smart POS Backend running on http://localhost:${PORT}`);
});

module.exports = app;
