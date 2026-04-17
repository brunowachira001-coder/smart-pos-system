# 🏗️ Smart POS System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React/Next.js Frontend (Vercel)                         │   │
│  │  ├─ Dashboard (Metrics & Charts)                         │   │
│  │  ├─ POS (Shopping Cart & Checkout)                       │   │
│  │  ├─ Inventory (Stock Management)                         │   │
│  │  ├─ Customers (Profiles & Credit)                        │   │
│  │  ├─ Sales (Transaction History)                          │   │
│  │  ├─ Reports (Analytics)                                  │   │
│  │  ├─ Settings (Configuration)                             │   │
│  │  └─ AI Assistant (Chat Interface)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Backend (Railway/Render)                     │   │
│  │  ├─ Authentication (JWT)                                 │   │
│  │  ├─ Products API (CRUD)                                  │   │
│  │  ├─ Inventory API (Stock Management)                     │   │
│  │  ├─ Customers API (Profiles & Credit)                    │   │
│  │  ├─ Transactions API (Sales)                             │   │
│  │  ├─ Analytics API (Reports)                              │   │
│  │  ├─ AI API (Chat & Recommendations)                      │   │
│  │  └─ Audit API (Logging)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Supabase)                                   │   │
│  │  ├─ Users & Sessions                                     │   │
│  │  ├─ Products & Categories                                │   │
│  │  ├─ Inventory & Stock                                    │   │
│  │  ├─ Customers & Credit                                   │   │
│  │  ├─ Transactions & Payments                              │   │
│  │  ├─ Analytics & Reports                                  │   │
│  │  ├─ Audit Logs                                           │   │
│  │  └─ AI Insights & Chat                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ API
┌─────────────────────────────────────────────────────────────────┐
│                        AI LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OpenAI Integration                                      │   │
│  │  ├─ GPT-3.5-turbo (Chat & Analysis)                      │   │
│  │  ├─ Embeddings (Semantic Search)                         │   │
│  │  └─ Recommendations (ML)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Login Flow
```
User Input (Username/Password)
    ↓
Frontend (React)
    ↓
API Client (Axios)
    ↓
Backend (Express)
    ↓
Authentication Route
    ↓
JWT Token Generation
    ↓
Response to Frontend
    ↓
Store Token (localStorage)
    ↓
Redirect to Dashboard
```

### 2. POS Transaction Flow
```
Product Selection
    ↓
Add to Cart (Frontend State)
    ↓
Checkout
    ↓
API: Create Transaction
    ↓
Backend: Validate & Process
    ↓
Database: Save Transaction
    ↓
Update Inventory
    ↓
Response: Receipt
    ↓
Display Receipt
```

### 3. AI Recommendation Flow
```
User Query
    ↓
Frontend: Send Message
    ↓
API: POST /api/ai/chat
    ↓
Backend: Get Context Data
    ↓
OpenAI API: Generate Response
    ↓
Backend: Format Response
    ↓
Save Chat History
    ↓
Return to Frontend
    ↓
Display in Chat
```

---

## Component Architecture

### Frontend Components
```
App
├── MainLayout
│   ├── Sidebar (Navigation)
│   ├── TopBar (User Info)
│   └── Content Area
│       ├── Dashboard
│       │   ├── MetricCard
│       │   ├── Chart
│       │   └── QuickActions
│       ├── POS
│       │   ├── ProductGrid
│       │   ├── SearchBar
│       │   └── ShoppingCart
│       ├── Inventory
│       │   ├── StockTable
│       │   └── LowStockAlert
│       ├── Customers
│       │   ├── CustomerList
│       │   └── CustomerDetail
│       ├── Sales
│       │   ├── TransactionTable
│       │   └── SalesChart
│       ├── Reports
│       │   ├── AnalyticsChart
│       │   └── ExportButton
│       ├── Settings
│       │   ├── UserManagement
│       │   └── SystemConfig
│       └── AI Assistant
│           ├── ChatWindow
│           ├── MessageInput
│           └── QuickPrompts
└── UI Components
    ├── Button
    ├── Card
    ├── Input
    ├── Modal
    └── Table
```

### Backend Routes
```
Express App
├── /api/auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   ├── GET /me
│   └── POST /logout
├── /api/products
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   ├── DELETE /:id
│   ├── GET /categories/list
│   └── POST /categories
├── /api/inventory
│   ├── GET /branch/:branchId
│   ├── GET /low-stock/:branchId
│   ├── PUT /:id
│   ├── POST /adjust/:id
│   └── GET /summary/:branchId
├── /api/customers
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   ├── POST /:id/credit
│   ├── POST /:id/payment
│   └── GET /:id/stats
├── /api/transactions
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST / (create)
│   └── GET /daily/:branchId
├── /api/analytics
│   ├── GET /dashboard/:branchId
│   ├── GET /sales-trend/:branchId
│   ├── GET /products/:branchId
│   ├── GET /customers/:branchId
│   └── GET /payments/:branchId
├── /api/ai
│   ├── GET /recommendations/:branchId
│   ├── GET /forecast/:branchId
│   ├── POST /chat
│   ├── GET /chat-history
│   └── GET /insights/:branchId
└── /api/audit
    ├── GET / (list)
    ├── POST /log
    └── GET /user/:userId
```

---

## Database Schema

### Core Tables
```
User
├── id (PK)
├── email (UNIQUE)
├── username (UNIQUE)
├── password (hashed)
├── role (ENUM)
├── branchId (FK)
└── timestamps

Product
├── id (PK)
├── sku (UNIQUE)
├── name
├── price
├── cost
├── categoryId (FK)
└── timestamps

Inventory
├── id (PK)
├── productId (FK)
├── branchId (FK)
├── quantity
├── minStock
├── maxStock
└── timestamps

Customer
├── id (PK)
├── name
├── email (UNIQUE)
├── phone (UNIQUE)
├── creditLimit
├── creditUsed
├── totalSpent
├── branchId (FK)
└── timestamps

Transaction
├── id (PK)
├── transactionNumber (UNIQUE)
├── userId (FK)
├── customerId (FK)
├── branchId (FK)
├── subtotal
├── tax
├── discount
├── total
├── paymentMethod
├── status
└── timestamps

TransactionItem
├── id (PK)
├── transactionId (FK)
├── productId (FK)
├── quantity
├── unitPrice
├── discount
├── total
└── timestamps
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│ 1. HTTPS/TLS (Transport)                │
│    └─ All data encrypted in transit     │
├─────────────────────────────────────────┤
│ 2. JWT Authentication                   │
│    ├─ Access Token (24h)                │
│    └─ Refresh Token (7d)                │
├─────────────────────────────────────────┤
│ 3. Password Security                    │
│    └─ bcryptjs hashing (10 rounds)      │
├─────────────────────────────────────────┤
│ 4. Input Validation                     │
│    └─ Joi schema validation             │
├─────────────────────────────────────────┤
│ 5. CORS Protection                      │
│    └─ Whitelist allowed origins         │
├─────────────────────────────────────────┤
│ 6. Role-Based Access Control            │
│    ├─ ADMIN                             │
│    ├─ MANAGER                           │
│    ├─ CASHIER                           │
│    ├─ INVENTORY_STAFF                   │
│    └─ ACCOUNTANT                        │
├─────────────────────────────────────────┤
│ 7. Audit Logging                        │
│    └─ All actions logged                │
├─────────────────────────────────────────┤
│ 8. Environment Variables                │
│    └─ Secrets not in code               │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Internet                              │
└──────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┬─────────────────┐
        ↓                 ↓                 ↓
    ┌────────┐        ┌────────┐      ┌──────────┐
    │ Vercel │        │Railway │      │ Supabase │
    │        │        │        │      │          │
    │Frontend│        │Backend │      │Database  │
    │        │        │        │      │          │
    └────────┘        └────────┘      └──────────┘
        ↓                 ↓                 ↓
    React App        Express.js        PostgreSQL
    Next.js          Node.js            Prisma
    TypeScript       JWT Auth           20+ Tables
    Tailwind         50+ Endpoints      Backups
    
        ↓                 ↓
        └─────────────────┘
                ↓
        ┌──────────────────┐
        │   OpenAI API     │
        │  GPT-3.5-turbo   │
        │  Embeddings      │
        └──────────────────┘
```

---

## Scaling Architecture

```
Load Balancer
    ↓
┌───────────────────────────────────┐
│  Multiple Backend Instances       │
│  ├─ Instance 1 (Express)          │
│  ├─ Instance 2 (Express)          │
│  └─ Instance N (Express)          │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Database Connection Pool         │
│  ├─ PostgreSQL Primary            │
│  └─ PostgreSQL Replica            │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Cache Layer (Redis)              │
│  ├─ Session Cache                 │
│  ├─ Query Cache                   │
│  └─ Rate Limiting                 │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  CDN (Vercel Edge)                │
│  ├─ Static Assets                 │
│  ├─ API Responses                 │
│  └─ Global Distribution           │
└───────────────────────────────────┘
```

---

## Monitoring & Logging

```
┌─────────────────────────────────────┐
│      Application Monitoring         │
├─────────────────────────────────────┤
│ Frontend Logs                       │
│ ├─ Browser Console                  │
│ ├─ Error Tracking (Sentry)          │
│ └─ Performance (Vercel Analytics)   │
├─────────────────────────────────────┤
│ Backend Logs                        │
│ ├─ Winston Logger                   │
│ ├─ Error Logs                       │
│ ├─ Access Logs                      │
│ └─ Audit Logs                       │
├─────────────────────────────────────┤
│ Database Logs                       │
│ ├─ Query Logs                       │
│ ├─ Slow Query Logs                  │
│ └─ Connection Logs                  │
├─────────────────────────────────────┤
│ Infrastructure Monitoring           │
│ ├─ CPU Usage                        │
│ ├─ Memory Usage                     │
│ ├─ Disk Usage                       │
│ └─ Network Usage                    │
└─────────────────────────────────────┘
```

---

## API Request/Response Flow

```
Frontend Request
    ↓
┌─────────────────────────────────┐
│ API Client (Axios)              │
│ ├─ Add JWT Token                │
│ ├─ Set Headers                  │
│ └─ Serialize Data               │
└─────────────────────────────────┘
    ↓ HTTPS
┌─────────────────────────────────┐
│ Express Middleware              │
│ ├─ CORS Check                   │
│ ├─ Body Parser                  │
│ └─ Request Logging              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Authentication Middleware       │
│ ├─ Verify JWT Token             │
│ ├─ Extract User Info            │
│ └─ Check Permissions            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Route Handler                   │
│ ├─ Validate Input               │
│ ├─ Process Request              │
│ └─ Query Database               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Response Handler                │
│ ├─ Format Response              │
│ ├─ Set Status Code              │
│ └─ Send JSON                    │
└─────────────────────────────────┘
    ↓ HTTPS
┌─────────────────────────────────┐
│ Frontend Handler                │
│ ├─ Parse Response               │
│ ├─ Update State                 │
│ └─ Render UI                    │
└─────────────────────────────────┘
```

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                        │
│  React 18 → Next.js 14 → TypeScript → Tailwind CSS    │
│  State: Zustand | HTTP: Axios | UI: Custom Components │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│  Express.js → Node.js → REST API → JSON                │
│  Auth: JWT | Validation: Joi | Logging: Winston        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                         │
│  PostgreSQL → Prisma ORM → 20+ Tables                  │
│  Relationships | Indexes | Migrations | Backups        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    AI LAYER                             │
│  OpenAI API → GPT-3.5-turbo → Embeddings              │
│  Chat | Recommendations | Forecasting | Insights      │
└─────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0.0
**Last Updated:** April 16, 2026
**Status:** Production Ready ✅
