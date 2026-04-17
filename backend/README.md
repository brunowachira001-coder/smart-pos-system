# Smart POS System - Backend

Production-grade Express.js backend for the Smart POS System with AI integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your database URL and API keys:
```
DATABASE_URL=postgresql://user:password@localhost:5432/smart_pos
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=5000
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run migrations:
```bash
npm run prisma:migrate
```

6. Seed database:
```bash
npm run prisma:seed
```

7. Start development server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories/list` - Get all categories
- `POST /api/products/categories` - Create category

### Inventory
- `GET /api/inventory/branch/:branchId` - Get branch inventory
- `GET /api/inventory/low-stock/:branchId` - Get low stock items
- `PUT /api/inventory/:id` - Update inventory
- `POST /api/inventory/adjust/:id` - Adjust inventory quantity
- `GET /api/inventory/summary/:branchId` - Get inventory summary

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `POST /api/customers/:id/credit` - Add credit
- `POST /api/customers/:id/payment` - Make payment
- `GET /api/customers/:id/stats` - Get customer statistics

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/daily/:branchId` - Get daily sales

### Analytics
- `GET /api/analytics/dashboard/:branchId` - Get dashboard metrics
- `GET /api/analytics/sales-trend/:branchId` - Get sales trend
- `GET /api/analytics/products/:branchId` - Get product performance
- `GET /api/analytics/customers/:branchId` - Get customer analytics
- `GET /api/analytics/payments/:branchId` - Get payment breakdown

### AI
- `GET /api/ai/recommendations/:branchId` - Get AI recommendations
- `GET /api/ai/forecast/:branchId` - Get sales forecast
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/chat-history` - Get chat history
- `GET /api/ai/insights/:branchId` - Get AI insights

### Audit
- `GET /api/audit` - Get audit logs
- `POST /api/audit/log` - Log action
- `GET /api/audit/user/:userId` - Get user activity

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## 📊 Database Schema

The system uses Prisma ORM with PostgreSQL. Key models:
- User - System users with roles
- Product - Product catalog
- Inventory - Stock management
- Customer - Customer profiles
- Transaction - Sales transactions
- Branch - Multi-branch support
- AuditLog - Activity logging
- ChatMessage - AI chat history

## 🤖 AI Features

- Product recommendations based on sales data
- Sales forecasting
- Inventory optimization
- Customer behavior analysis
- AI chat assistant

## 🚀 Deployment

### Railway/Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Environment Variables for Production
```
DATABASE_URL=postgresql://...
JWT_SECRET=<strong_random_key>
JWT_REFRESH_SECRET=<strong_random_key>
OPENAI_API_KEY=<your_api_key>
NODE_ENV=production
PORT=5000
```

## 📝 Development

### Project Structure
```
backend/
├── src/
│   ├── server.js           # Main server file
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Database seeding
├── .env.example            # Environment template
└── package.json            # Dependencies
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Import in `src/server.js`
3. Register with `app.use()`

## 🐛 Troubleshooting

### Database Connection Error
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials

### JWT Errors
- Ensure JWT_SECRET is set
- Check token expiration
- Verify token format

### OpenAI Errors
- Verify OPENAI_API_KEY is set
- Check API key validity
- Monitor API usage

## 📞 Support

For issues or questions, check the main README or contact the development team.

## 📄 License

ISC
