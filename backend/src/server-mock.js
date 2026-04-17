const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mock data
const mockUsers = {
  admin: { id: 1, username: 'admin', password: 'admin123', role: 'ADMIN', email: 'admin@pos.com' }
};

const mockProducts = [
  { id: 1, name: 'Laptop', price: 999.99, stock: 50, category: 'Electronics' },
  { id: 2, name: 'Mouse', price: 29.99, stock: 200, category: 'Accessories' },
  { id: 3, name: 'Keyboard', price: 79.99, stock: 150, category: 'Accessories' },
  { id: 4, name: 'Monitor', price: 299.99, stock: 30, category: 'Electronics' },
  { id: 5, name: 'Desk Chair', price: 199.99, stock: 40, category: 'Furniture' }
];

const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0001', credit: 500 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0002', credit: 1000 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0003', credit: 750 }
];

let mockTransactions = [
  { id: 1, customerId: 1, total: 1099.98, items: 2, date: new Date(), status: 'completed' },
  { id: 2, customerId: 2, total: 299.99, items: 1, date: new Date(), status: 'completed' }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers[username];
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Registration disabled in mock mode' });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  res.json(product || { error: 'Not found' });
});

app.post('/api/products', (req, res) => {
  const newProduct = { id: mockProducts.length + 1, ...req.body };
  mockProducts.push(newProduct);
  res.json(newProduct);
});

// Inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.json(mockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock })));
});

app.get('/api/inventory/low-stock', (req, res) => {
  res.json(mockProducts.filter(p => p.stock < 50));
});

// Customers endpoints
app.get('/api/customers', (req, res) => {
  res.json(mockCustomers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = mockCustomers.find(c => c.id === parseInt(req.params.id));
  res.json(customer || { error: 'Not found' });
});

app.post('/api/customers', (req, res) => {
  const newCustomer = { id: mockCustomers.length + 1, ...req.body };
  mockCustomers.push(newCustomer);
  res.json(newCustomer);
});

// Transactions endpoints
app.get('/api/transactions', (req, res) => {
  res.json(mockTransactions);
});

app.post('/api/transactions', (req, res) => {
  const newTransaction = { id: mockTransactions.length + 1, ...req.body, date: new Date(), status: 'completed' };
  mockTransactions.push(newTransaction);
  res.json(newTransaction);
});

// Analytics endpoints
app.get('/api/analytics/sales', (req, res) => {
  res.json({
    totalSales: 5000,
    totalTransactions: 150,
    averageTransaction: 33.33,
    topProducts: mockProducts.slice(0, 3)
  });
});

app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    totalRevenue: 15000,
    totalOrders: 450,
    totalCustomers: mockCustomers.length,
    totalProducts: mockProducts.length,
    lowStockItems: mockProducts.filter(p => p.stock < 50).length
  });
});

// AI endpoints
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `AI Response to: "${message}". This is a mock response. In production, this would use OpenAI GPT.`,
    timestamp: new Date()
  });
});

app.get('/api/ai/recommendations/:branchId', (req, res) => {
  res.json({
    recommendations: [
      { product: 'Laptop', reason: 'High demand', confidence: 0.95 },
      { product: 'Monitor', reason: 'Trending', confidence: 0.87 }
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Mock Backend running on http://localhost:${PORT}`);
  console.log(`📊 API ready for testing`);
  console.log(`🔐 Login: admin / admin123`);
});
