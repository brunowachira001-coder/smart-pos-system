# Smart POS System - Phase 4: Customer & Credit System Design

## 1. Customer Service Architecture

### 1.1 Service Overview
```
┌─────────────────────────────────────────────────────────┐
│           Customer & Credit Service                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Customer Controller                           │  │
│  │  - Customer CRUD                                 │  │
│  │  - Credit Management                             │  │
│  │  - Payment Processing                            │  │
│  │  - Debt Management                               │  │
│  │  - Alert Management                              │  │
│  │  - Reporting                                     │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Business Logic Services                       │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Customer Svc  │  │Credit Service│             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Payment Svc   │  │Debt Service  │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Alert Service │  │Reporting Svc │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Data Access Layer                             │  │
│  │  - Customer Repository                           │  │
│  │  - Credit Repository                             │  │
│  │  - Payment Repository                            │  │
│  │  - Alert Repository                              │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    External Services                             │  │
│  │  - PostgreSQL Database                           │  │
│  │  - Redis Cache                                   │  │
│  │  - POS Service (for credit sales)                │  │
│  │  - Audit Service                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Service Responsibilities

**Customer Service**
- CRUD operations for customers
- Customer search and filtering
- Customer segmentation
- Bulk customer operations
- Customer status management

**Credit Service**
- Issue credit to customers
- Manage credit limits
- Track credit status
- Enforce credit rules
- Credit approval workflow

**Payment Service**
- Record payments
- Apply payments to credits
- Handle partial payments
- Handle overpayments
- Payment reconciliation

**Debt Service**
- Calculate current debt
- Calculate available credit
- Track debt aging
- Generate debt reports
- Debt analysis

**Alert Service**
- Generate alerts based on thresholds
- Manage alert lifecycle
- Send notifications
- Track alert history

**Reporting Service**
- Generate customer reports
- Generate credit reports
- Generate payment reports
- Generate financial reports
- Export reports

## 2. Database Schema (Phase 4 Specific)

### 2.1 Customers Table
```sql
CREATE TABLE customers (
  customer_id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  
  customer_type VARCHAR(50) NOT NULL, -- retail, wholesale, vip, corporate
  national_id VARCHAR(100),
  tax_id VARCHAR(100),
  
  credit_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_debt DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_credit DECIMAL(12,2) GENERATED ALWAYS AS (credit_limit - current_debt) STORED,
  
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, blacklisted, suspended
  
  total_purchases DECIMAL(12,2) DEFAULT 0,
  purchase_count INT DEFAULT 0,
  last_purchase_date TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_customer_type (customer_type),
  INDEX idx_status (status),
  INDEX idx_current_debt (current_debt DESC)
);
```

### 2.2 Customer Credits Table
```sql
CREATE TABLE customer_credits (
  credit_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(customer_id),
  
  credit_amount DECIMAL(12,2) NOT NULL,
  credit_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, partial_paid, paid, overdue, written_off
  
  interest_rate DECIMAL(5,2) DEFAULT 0,
  interest_amount DECIMAL(12,2) DEFAULT 0,
  
  reference_id UUID, -- Links to transaction_id
  reference_type VARCHAR(50), -- transaction, manual
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_created (created_at DESC)
);
```

### 2.3 Customer Payments Table
```sql
CREATE TABLE customer_payments (
  payment_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(customer_id),
  credit_id UUID REFERENCES customer_credits(credit_id),
  
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- cash, m-pesa, bank, check
  reference_number VARCHAR(255),
  
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- pending, confirmed, failed, reversed
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_customer (customer_id),
  INDEX idx_credit (credit_id),
  INDEX idx_payment_date (payment_date DESC),
  INDEX idx_status (status)
);
```

### 2.4 Credit Alerts Table
```sql
CREATE TABLE credit_alerts (
  alert_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(customer_id),
  
  alert_type VARCHAR(50) NOT NULL, -- due_soon, overdue, severely_overdue, limit_exceeded, suspicious
  
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, acknowledged, resolved
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at DESC)
);
```

### 2.5 Customer Segments Table
```sql
CREATE TABLE customer_segments (
  segment_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(customer_id),
  
  segment_name VARCHAR(100) NOT NULL, -- retail, wholesale, vip, at_risk, inactive
  segment_date DATE NOT NULL,
  
  reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_customer (customer_id),
  INDEX idx_segment_date (segment_date DESC)
);
```

### 2.6 Debt Aging Table
```sql
CREATE TABLE debt_aging (
  aging_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(customer_id),
  
  aging_date DATE NOT NULL,
  
  current_debt DECIMAL(12,2), -- Due within 30 days
  days_30_60 DECIMAL(12,2),   -- 30-60 days overdue
  days_60_90 DECIMAL(12,2),   -- 60-90 days overdue
  days_90_plus DECIMAL(12,2), -- 90+ days overdue
  
  total_debt DECIMAL(12,2),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_customer_date (customer_id, aging_date DESC)
);
```

## 3. Credit Processing Flow

### 3.1 Credit Issuance Flow
```
1. Customer selects credit payment at checkout
   ↓
2. Check customer credit status (active, not blacklisted)
   ↓
3. Check credit limit
   ↓
4. Check available credit >= transaction amount
   ↓
5. If checks pass:
   - Create credit transaction
   - Set due date (based on credit terms)
   - Calculate interest if applicable
   - Update customer debt
   - Emit credit.issued event
   ↓
6. If checks fail:
   - Return error
   - Suggest alternative payment method
```

### 3.2 Payment Application Flow
```
1. Customer makes payment
   ↓
2. Record payment
   ↓
3. Apply payment to oldest credit first (FIFO)
   ↓
4. Update credit status
   ↓
5. Update customer debt
   ↓
6. Check if all credits paid
   ↓
7. If overpayment:
   - Create credit balance
   - Or refund to customer
   ↓
8. Emit payment.recorded event
   ↓
9. Generate payment receipt
```

### 3.3 Debt Aging Calculation
```
For each customer:
  For each outstanding credit:
    Calculate days overdue = today - due_date
    
    If days_overdue <= 0:
      Add to current_debt
    Else if days_overdue <= 30:
      Add to days_30_60
    Else if days_overdue <= 60:
      Add to days_60_90
    Else:
      Add to days_90_plus
  
  Total_debt = current + 30_60 + 60_90 + 90_plus
```

## 4. Financial Accuracy Mechanisms

### 4.1 Data Consistency Checks
```
Customer Debt Consistency:
  current_debt = SUM(outstanding_credits)
  Verify: customer.current_debt = calculated_debt

Available Credit Consistency:
  available_credit = credit_limit - current_debt
  Verify: customer.available_credit = calculated_available

Payment Reconciliation:
  For each credit:
    total_paid = SUM(payments for this credit)
    Verify: total_paid <= credit_amount
```

### 4.2 Audit Trail
```
Log all:
- Credit issuances (amount, date, terms)
- Credit limit changes (old, new, reason)
- Payments (amount, date, method)
- Debt adjustments (reason, amount)
- Status changes (old, new, reason)
- User accountability (who, when)
```

### 4.3 Reconciliation Process
```
Daily Reconciliation:
1. Calculate expected debt for each customer
2. Compare with recorded debt
3. Identify discrepancies
4. Investigate discrepancies
5. Create adjustments if needed
6. Generate reconciliation report

Monthly Reconciliation:
1. Full account review
2. Verify all transactions
3. Verify all payments
4. Verify all adjustments
5. Generate monthly statement
6. Send to customer for verification
```

## 5. POS Integration

### 5.1 Customer Selection at Checkout
```
Cashier searches for customer:
1. Enter customer name/phone/ID
2. System searches database
3. Display matching customers
4. Cashier selects customer
5. System loads customer profile
6. Display credit status:
   - Credit limit
   - Current debt
   - Available credit
   - Status (active, suspended, etc.)
```

### 5.2 Credit Sale Processing
```
1. Customer selected at checkout
2. Cashier adds items to cart
3. Cashier selects "Credit Sale" payment method
4. System checks:
   - Credit status (active)
   - Credit limit
   - Available credit
5. If checks pass:
   - Create credit transaction
   - Set due date
   - Update customer debt
   - Generate receipt
6. If checks fail:
   - Show error message
   - Suggest alternative payment
```

### 5.3 Payment Application at Checkout
```
1. Customer makes payment against credit
2. Cashier selects "Payment" option
3. Cashier enters payment amount
4. System applies payment:
   - Find oldest outstanding credit
   - Apply payment to that credit
   - If overpayment, apply to next credit
5. Update customer debt
6. Generate payment receipt
```

## 6. Caching Strategy

### 6.1 Cache Layers
```
Layer 1: Customer Cache (Redis)
- Key: customer:{customerId}
- TTL: 30 minutes
- Data: Customer profile, credit limit, current debt

Layer 2: Credit Status Cache (Redis)
- Key: credit_status:{customerId}
- TTL: 5 minutes
- Data: Available credit, status

Layer 3: Alert Cache (Redis)
- Key: alerts:{customerId}
- TTL: 1 minute
- Data: Active alerts
```

### 6.2 Cache Invalidation
```
On Credit Issuance:
- Invalidate customer:{customerId}
- Invalidate credit_status:{customerId}
- Invalidate alerts:{customerId}

On Payment:
- Invalidate customer:{customerId}
- Invalidate credit_status:{customerId}

On Credit Limit Change:
- Invalidate customer:{customerId}
- Invalidate credit_status:{customerId}
```

## 7. Alert Generation Logic

### 7.1 Alert Thresholds
```
Due Soon Alert:
- Trigger: Payment due within 7 days
- Action: Notify customer to pay

Overdue Alert:
- Trigger: Payment past due date
- Action: Notify customer immediately

Severely Overdue Alert:
- Trigger: Payment 30+ days overdue
- Action: Notify manager, escalate

Credit Limit Exceeded Alert:
- Trigger: Current debt > credit limit
- Action: Suspend credit, notify manager

Suspicious Activity Alert:
- Trigger: Unusual payment pattern
- Action: Flag for review
```

## 8. Correctness Properties

### 8.1 Debt Accuracy
**Property**: Customer debt must equal sum of outstanding credits

**Validation**:
```
For each customer:
  calculated_debt = SUM(outstanding_credits)
  Verify: customer.current_debt = calculated_debt
```

### 8.2 Payment Integrity
**Property**: Total payments must equal total paid credits

**Validation**:
```
For each credit:
  total_paid = SUM(payments for this credit)
  Verify: total_paid <= credit_amount
```

### 8.3 Available Credit Accuracy
**Property**: Available credit must equal limit minus debt

**Validation**:
```
For each customer:
  available = credit_limit - current_debt
  Verify: customer.available_credit = available
```

### 8.4 Audit Completeness
**Property**: Every credit/payment must have audit log

**Validation**:
```
For each credit:
  Verify audit_logs exist for creation
For each payment:
  Verify audit_logs exist for recording
```

## 9. Performance Optimization

### 9.1 Database Optimization
```
Indexes:
- customer_id on customer_credits (fast lookups)
- customer_id on customer_payments (fast lookups)
- due_date on customer_credits (aging queries)
- status on customer_credits (status queries)

Partitioning:
- Partition customer_credits by year
- Partition customer_payments by year
```

### 9.2 Query Optimization
```
Fast customer search:
- Index on phone, email
- Use LIMIT for pagination

Fast debt calculation:
- Cache current_debt
- Update on payment/credit
- Verify daily

Fast credit limit check:
- Cache available_credit
- Update on payment/credit
```

## Deliverables Summary

✅ Customer database with profiles
✅ Purchase history tracking
✅ Credit system with limits
✅ Debt tracking and management
✅ Payment tracking and reconciliation
✅ Debt aging reports
✅ Overdue payment alerts
✅ POS integration
✅ Financial accuracy and integrity
✅ Comprehensive reporting
✅ Performance optimization
✅ Audit trail and controls
