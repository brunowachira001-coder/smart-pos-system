# Expense Management System - Complete Setup Guide

## ✅ What Was Created

### 1. Database Tables
- `expenses` - Main expense records with category, amount, and payment info
- `expense_categories` - Predefined expense categories with budgets
- `expense_attachments` - For storing receipts and invoices

### 2. API Endpoints
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/stats` - Get expense statistics
- `POST /api/expenses/[id]/approve` - Approve/reject expense
- `GET /api/expenses/categories` - Get expense categories

### 3. Frontend Page
- `/expenses` - Complete expense management interface

## 🚀 Setup Instructions

### Step 1: Run SQL in Supabase

1. Go to Supabase: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Click "New Query"
5. Copy content from `lib/expenses-schema.sql`
6. Paste and click "Run"

This creates:
- 3 new tables (expenses, expense_categories, expense_attachments)
- 15 predefined expense categories
- 8 sample expense records
- Automatic triggers for timestamp updates
- Helper functions for expense summaries

### Step 2: Verify Tables

In Supabase Table Editor, check for:
- `expenses` table
- `expense_categories` table
- `expense_attachments` table

### Step 3: Test the System

Visit: https://smart-pos-system-peach.vercel.app/expenses

You should see:
- 8 expense records
- Today's expenses: KSH 0.00
- Business expenses: KSH 7000.00
- Personal expenses: KSH 0.00
- Search and filter functionality

## 📊 Features

### Expense Tracking
- Record business and personal expenses
- Categorize expenses (Rent, Utilities, Salaries, etc.)
- Track payment methods (Cash, M-Pesa, Bank Transfer, Card)
- Add vendor information
- Attach receipts (future enhancement)

### Expense Management
- Approve or reject expenses
- Filter by category, payment method, date range
- Search by expense ID, description, or vendor
- View expense statistics

### Statistics Dashboard
- Today's expenses
- Today's net revenue (revenue minus expenses)
- Business vs Personal expense breakdown
- Expense overview by category
- Total expense count and amount

### Automatic Features
- Expense ID auto-generated (EXP-XXXXXX format)
- Timestamps auto-update
- Status tracking (Pending, Approved, Rejected)

## 🔄 How It Works

### Creating an Expense
```javascript
POST /api/expenses
{
  "category": "Rent",
  "amount": 35000.00,
  "description": "Monthly office rent",
  "payment_method": "Bank Transfer",
  "vendor_name": "Property Management Ltd",
  "expense_date": "2026-04-17",
  "notes": "Paid for April 2026"
}
```

### Approving an Expense
```javascript
POST /api/expenses/{expense_id}/approve
{
  "status": "Approved",
  "approved_by": "Admin"
}
```

## 📱 Integration with Dashboard

The expense system integrates with your dashboard to calculate net revenue:

```
Net Revenue = Gross Revenue - Returns - Business Expenses - Personal Expenses
```

## 🎯 Sample Data Included

After running SQL:

**Expenses:**
1. Rent - KSH 35,000 (Approved)
2. Utilities - KSH 4,500 (Approved)
3. Salaries - KSH 85,000 (Approved)
4. Marketing - KSH 12,000 (Approved)
5. Supplies - KSH 3,500 (Pending)
6. Transportation - KSH 6,000 (Pending)
7. Maintenance - KSH 8,500 (Approved)
8. Food & Dining - KSH 2,500 (Approved)

**Categories:**
- Business: Rent, Utilities, Salaries, Marketing, Supplies, Transportation, Insurance, Maintenance, Professional Services, Inventory Purchase, Miscellaneous
- Personal: Food & Dining, Entertainment, Healthcare, Education

## ✅ Deployment Status

- Frontend: ✅ Deployed
- API Endpoints: ✅ Deployed
- Database Schema: ⏳ Run SQL in Supabase

## 🔗 Live URL

https://smart-pos-system-peach.vercel.app/expenses

## 📝 Next Steps

1. Run the SQL script in Supabase
2. Test the expenses page
3. Add a new expense
4. Approve/reject expenses
5. View expense statistics
6. Integrate with your accounting system
7. Set up budget alerts (optional)
