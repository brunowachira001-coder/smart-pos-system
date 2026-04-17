# Debt Management System - Setup Guide

## ✅ What Was Created

### 1. Database Tables
Created 3 new tables in Supabase:
- `debts` - Main debt records with customer info, amounts, and status
- `debt_payments` - Payment history for each debt
- `customer_credit` - Credit limits and available credit per customer

### 2. API Endpoints
- `GET /api/debts` - Get all debts
- `POST /api/debts` - Create new debt
- `GET /api/debts/stats` - Get debt statistics
- `POST /api/debts/[id]/payment` - Record a payment

### 3. Frontend Page
- `/debt` - Complete debt management interface

## 🚀 Setup Instructions

### Step 1: Run SQL in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire content from `lib/debt-schema.sql`
5. Paste it into the SQL editor
6. Click "Run" button

This will create:
- 3 new tables (debts, debt_payments, customer_credit)
- Sample data (2 debts, credit limits for all customers)
- Indexes for performance
- Triggers for automatic status updates
- Row Level Security policies

### Step 2: Verify Tables Created

In Supabase:
1. Go to "Table Editor"
2. You should see these new tables:
   - debts
   - debt_payments
   - customer_credit

### Step 3: Test the System

1. Visit: https://smart-pos-system-peach.vercel.app/debt
2. You should see:
   - Outstanding Debt: KSH 1500.00
   - 2 customers with debt (John Doe: KSH 900, Jane Smith: KSH 600)
   - Total Credit Limit: KSH 115650.00

## 📊 Features

### Debt Tracking
- View all outstanding debts
- Filter by status (Outstanding, Partial, Paid)
- See customer credit limits
- Track payment history

### Payment Recording
- Record payments for any debt
- Multiple payment methods (Cash, M-Pesa, Bank Transfer, Card)
- Automatic debt status updates
- Reference number tracking

### Statistics Dashboard
- Total outstanding debt
- Today's debt
- Total credit limit
- Active debts count
- Recent payments

### Automatic Features
- Debt status auto-updates when payments are made
- Customer credit automatically adjusts
- Available credit recalculates

## 🔄 How It Works

### Creating a Debt (When Customer Buys on Credit)
```javascript
POST /api/debts
{
  "customer_id": "uuid",
  "customer_name": "John Doe",
  "sale_id": "SALE-000123",
  "total_amount": 1500.00,
  "due_date": "2026-05-17",
  "notes": "Credit sale"
}
```

### Recording a Payment
```javascript
POST /api/debts/{debt_id}/payment
{
  "amount": 500.00,
  "payment_method": "M-Pesa",
  "reference_number": "ABC123XYZ",
  "notes": "Partial payment"
}
```

### What Happens Automatically
1. Debt `amount_paid` increases
2. Debt `amount_remaining` decreases
3. Debt `status` updates (Outstanding → Partial → Paid)
4. Customer `current_debt` decreases
5. Customer `available_credit` increases

## 📱 Integration with POS

To integrate with your POS system, when a customer buys on credit:

1. Create the sale as normal
2. Call the debt API to record the debt:
```javascript
await fetch('/api/debts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_id: customer.id,
    customer_name: customer.name,
    sale_id: saleId,
    total_amount: totalAmount,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    notes: 'Credit sale from POS'
  })
});
```

## 🎯 Sample Data Included

After running the SQL script, you'll have:

**Debts:**
- John Doe: KSH 900.00 (Partial payment status)
- Jane Smith: KSH 600.00 (Outstanding)

**Credit Limits:**
- John Doe: KSH 50,000 (KSH 49,100 available)
- Jane Smith: KSH 30,000 (KSH 29,400 available)
- Alice Brown: KSH 100,000 (KSH 100,000 available)
- Others: KSH 20,000 each

## ✅ Deployment Status

- Frontend: ✅ Deployed
- API Endpoints: ✅ Deployed
- Database Schema: ⏳ Needs to be run in Supabase (see Step 1)

## 🔗 Live URL

https://smart-pos-system-peach.vercel.app/debt

## 📝 Next Steps

1. Run the SQL script in Supabase (Step 1 above)
2. Test the debt management page
3. Integrate with your POS system for automatic debt creation
4. Customize credit limits for your customers
5. Set up notifications for overdue debts (optional)
