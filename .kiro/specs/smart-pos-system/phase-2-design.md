# Smart POS System - Phase 2: POS Core Design

## 1. POS Service Architecture

### 1.1 Service Overview
```
┌─────────────────────────────────────────────────────────┐
│                    POS Service                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         POS Controller                           │  │
│  │  - Search Products                               │  │
│  │  - Manage Cart                                   │  │
│  │  - Process Checkout                              │  │
│  │  - Handle Payments                               │  │
│  │  - Generate Receipts                             │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Business Logic Services                  │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ Cart Service │  │ POS Service  │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Payment Service│ │Receipt Service│            │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Inventory Svc │  │Pricing Service│            │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Data Access Layer                        │  │
│  │  - Product Repository                            │  │
│  │  - Transaction Repository                        │  │
│  │  - Payment Repository                            │  │
│  │  - Inventory Repository                          │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         External Services                        │  │
│  │  - PostgreSQL Database                           │  │
│  │  - Redis Cache                                   │  │
│  │  - Audit Service                                 │  │
│  │  - Inventory Service                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Service Responsibilities

**POS Service**
- Orchestrate checkout flow
- Validate transactions
- Emit transaction events
- Handle transaction lifecycle

**Cart Service**
- Manage shopping cart state
- Add/remove/update items
- Calculate totals
- Validate stock availability

**Payment Service**
- Process multiple payment methods
- Validate payment details
- Handle payment failures
- Track payment status

**Receipt Service**
- Generate digital receipts
- Format thermal receipts
- Send receipts (email/SMS)
- Store receipt history

**Inventory Service**
- Update stock levels
- Create inventory logs
- Validate stock availability
- Handle stock reservations

**Pricing Service**
- Calculate retail/wholesale prices
- Apply discounts
- Calculate taxes
- Handle price overrides

## 2. Data Flow Architecture

### 2.1 Checkout Flow
```
1. Cashier searches for product
   ↓
2. Product returned from cache/DB
   ↓
3. Cashier adds to cart
   ↓
4. Cart Service validates stock
   ↓
5. Item added to cart (in-memory)
   ↓
6. Cart summary calculated
   ↓
7. Repeat steps 1-6 for more items
   ↓
8. Cashier initiates checkout
   ↓
9. POS Service validates cart
   ↓
10. Payment Service processes payment
    ↓
11. If payment successful:
    - Create transaction in DB
    - Deduct inventory
    - Generate receipt
    - Emit transaction.completed event
    - Return success
    ↓
12. If payment failed:
    - Emit transaction.failed event
    - Return error
```

### 2.2 Cart State Management
```
Cart State (In-Memory/Session):
{
  cartId: "uuid",
  branchId: "uuid",
  cashierId: "uuid",
  customerId: "uuid" (optional),
  items: [
    {
      itemId: "uuid",
      productId: "uuid",
      productName: "T-Shirt",
      quantity: 2,
      unitPrice: 500,
      discount: 0,
      lineTotal: 1000
    }
  ],
  summary: {
    subtotal: 1000,
    totalDiscount: 0,
    taxRate: 0.16,
    tax: 160,
    total: 1160
  },
  createdAt: "2024-04-13T10:30:00Z",
  updatedAt: "2024-04-13T10:35:00Z"
}
```

### 2.3 Transaction Processing Flow
```
Cart → Validation → Payment Processing → Inventory Update → Receipt → Audit Log
                                              ↓
                                        Emit Events
                                              ↓
                                    Analytics Processing
```

## 3. Database Schema (Phase 2 Specific)

### 3.1 Sales Transactions Table
```sql
CREATE TABLE sales_transactions (
  transaction_id UUID PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  cashier_id UUID NOT NULL REFERENCES users(user_id),
  customer_id UUID REFERENCES customers(customer_id),
  
  transaction_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL, -- completed, pending, cancelled, refunded
  
  subtotal DECIMAL(12,2) NOT NULL,
  total_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  
  notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  INDEX idx_branch_date (branch_id, transaction_date DESC),
  INDEX idx_cashier_date (cashier_id, transaction_date DESC),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status)
);
```

### 3.2 Transaction Items Table
```sql
CREATE TABLE transaction_items (
  item_id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES sales_transactions(transaction_id),
  product_id UUID NOT NULL REFERENCES products(product_id),
  
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  
  price_type VARCHAR(20) NOT NULL, -- retail, wholesale
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_transaction (transaction_id),
  INDEX idx_product (product_id)
);
```

### 3.3 Payments Table
```sql
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES sales_transactions(transaction_id),
  
  payment_method VARCHAR(50) NOT NULL, -- cash, m-pesa, bank, credit
  amount_paid DECIMAL(12,2) NOT NULL,
  reference_number VARCHAR(255),
  
  status VARCHAR(50) NOT NULL, -- pending, confirmed, failed, refunded
  
  metadata JSONB, -- Additional data (phone for M-Pesa, account for bank, etc.)
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_transaction (transaction_id),
  INDEX idx_status (status)
);
```

### 3.4 Parked Transactions Table
```sql
CREATE TABLE parked_transactions (
  parked_transaction_id UUID PRIMARY KEY,
  cart_id UUID NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  cashier_id UUID NOT NULL REFERENCES users(user_id),
  customer_id UUID REFERENCES customers(customer_id),
  
  cart_data JSONB NOT NULL, -- Serialized cart state
  
  status VARCHAR(50) NOT NULL DEFAULT 'parked', -- parked, resumed, expired
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  resumed_at TIMESTAMP,
  
  INDEX idx_branch_cashier (branch_id, cashier_id),
  INDEX idx_expires (expires_at)
);
```

### 3.5 Receipts Table
```sql
CREATE TABLE receipts (
  receipt_id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES sales_transactions(transaction_id),
  
  format VARCHAR(50) NOT NULL, -- digital, thermal
  content TEXT NOT NULL,
  
  sent_to_email VARCHAR(255),
  sent_to_phone VARCHAR(20),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_transaction (transaction_id)
);
```

### 3.6 Inventory Logs Table
```sql
CREATE TABLE inventory_logs (
  log_id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  transaction_type VARCHAR(50) NOT NULL, -- sale, purchase, adjustment, transfer, return
  quantity_change INT NOT NULL,
  
  reference_id UUID, -- Links to transaction_id or other reference
  reference_type VARCHAR(50), -- transaction, adjustment, transfer
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_branch (product_id, branch_id),
  INDEX idx_date (created_at DESC),
  INDEX idx_reference (reference_id)
);
```

## 4. Service Implementation Details

### 4.1 Cart Service
```typescript
// Key Methods
- addItem(productId, quantity, priceType): void
- updateItem(itemId, quantity, discount): void
- removeItem(itemId): void
- clearCart(): void
- getCart(): CartState
- calculateTotals(): CartSummary
- validateStock(): boolean
- parkCart(): ParkedTransactionId
- resumeCart(parkedTransactionId): CartState
```

### 4.2 POS Service
```typescript
// Key Methods
- searchProducts(query, category, limit): Product[]
- createTransaction(cartId, customerId): TransactionId
- completeTransaction(transactionId, payments): Transaction
- refundTransaction(transactionId, items, reason): RefundId
- getTransaction(transactionId): Transaction
- getTransactionHistory(filters): Transaction[]
```

### 4.3 Payment Service
```typescript
// Key Methods
- processCashPayment(amount): PaymentResult
- processM-PesaPayment(phoneNumber, amount): PaymentResult
- processBankPayment(accountDetails, amount): PaymentResult
- processCreditPayment(customerId, amount): PaymentResult
- validatePayment(payment): boolean
- refundPayment(paymentId): RefundResult
```

### 4.4 Receipt Service
```typescript
// Key Methods
- generateDigitalReceipt(transaction): ReceiptContent
- generateThermalReceipt(transaction): ReceiptContent
- sendEmailReceipt(receiptId, email): boolean
- sendSmsReceipt(receiptId, phone): boolean
- printReceipt(receiptId, printerId): boolean
- getReceipt(receiptId): Receipt
```

### 4.5 Inventory Service
```typescript
// Key Methods
- updateInventory(productId, branchId, quantityChange): void
- validateStock(productId, branchId, quantity): boolean
- getInventory(productId, branchId): InventoryLevel
- createInventoryLog(productId, branchId, change, reference): void
- getInventoryHistory(productId, branchId): InventoryLog[]
```

## 5. Caching Strategy

### 5.1 Cache Layers
```
Layer 1: Product Cache (Redis)
- Key: product:{productId}
- TTL: 1 hour
- Data: Product details, prices, stock

Layer 2: Search Cache (Redis)
- Key: search:{query}:{category}
- TTL: 10 minutes
- Data: Search results

Layer 3: Pricing Cache (Redis)
- Key: pricing:{productId}:{customerType}
- TTL: 30 minutes
- Data: Retail/wholesale prices, discounts

Layer 4: Inventory Cache (Redis)
- Key: inventory:{productId}:{branchId}
- TTL: 5 minutes
- Data: Stock levels
```

### 5.2 Cache Invalidation
```
On Product Update:
- Invalidate product:{productId}
- Invalidate search:*
- Invalidate pricing:{productId}:*

On Inventory Update:
- Invalidate inventory:{productId}:{branchId}
- Invalidate product:{productId}

On Price Update:
- Invalidate pricing:{productId}:*
- Invalidate search:*
```

## 6. Error Handling Strategy

### 6.1 Error Types
```
INSUFFICIENT_STOCK
- Product out of stock
- Action: Return available quantity

INVALID_PAYMENT
- Payment method not available
- Action: Suggest alternative method

DUPLICATE_TRANSACTION
- Duplicate submission detected
- Action: Return existing transaction

PAYMENT_FAILED
- Payment processing failed
- Action: Retry or use different method

NETWORK_ERROR
- Connection issue
- Action: Retry with exponential backoff

TIMEOUT
- Operation took too long
- Action: Retry or fail gracefully
```

### 6.2 Retry Strategy
```
Transient Errors (Retry):
- Network timeouts
- Database connection errors
- Temporary service unavailability

Non-Transient Errors (No Retry):
- Invalid input
- Insufficient stock
- Payment declined
- Authentication failed
```

## 7. Performance Optimization

### 7.1 Query Optimization
```sql
-- Fast product search
SELECT product_id, name, sku, barcode, category_id, 
       retail_price, wholesale_price, stock
FROM products
WHERE (name ILIKE $1 OR sku = $1 OR barcode = $1)
  AND category_id = $2 (optional)
LIMIT 10;

-- Fast inventory check
SELECT quantity_on_hand, quantity_reserved
FROM inventory
WHERE product_id = $1 AND branch_id = $2;

-- Fast transaction retrieval
SELECT * FROM sales_transactions
WHERE branch_id = $1 AND transaction_date >= $2
ORDER BY transaction_date DESC
LIMIT 100;
```

### 7.2 Batch Operations
```
Batch Inventory Updates:
- Collect all inventory changes
- Execute single batch update
- Reduce database round trips

Batch Audit Logging:
- Queue audit events
- Write in batches every 5 seconds
- Reduce I/O overhead
```

### 7.3 Connection Pooling
```
PgBouncer Configuration:
- Pool size: 20 connections
- Reserve pool: 5 connections
- Timeout: 600 seconds
- Idle timeout: 300 seconds
```

## 8. Security Considerations

### 8.1 Input Validation
- Validate all user inputs
- Sanitize search queries
- Validate payment amounts
- Check quantity ranges

### 8.2 Authorization
- Verify cashier permissions
- Check branch access
- Validate payment method access
- Audit all sensitive operations

### 8.3 Data Protection
- Encrypt payment references
- Mask sensitive data in logs
- Use HTTPS for all APIs
- Secure session management

## 9. Monitoring & Observability

### 9.1 Key Metrics
- Transaction processing time
- Payment success rate
- Inventory update latency
- Receipt generation time
- Error rates by type
- Cache hit rates

### 9.2 Logging
- Transaction start/completion
- Payment processing steps
- Inventory updates
- Errors and exceptions
- User actions

### 9.3 Alerts
- High error rate (> 1%)
- Slow transaction processing (> 1s)
- Payment failures (> 5%)
- Database connection issues
- Cache failures

## 10. Correctness Properties

### 10.1 Transaction Consistency
**Property**: Every completed transaction must have:
- Corresponding inventory deduction
- Payment record
- Receipt
- Audit log entry

**Validation**:
```
For each transaction in completed status:
  - Verify inventory_logs exist for all items
  - Verify payments sum to transaction total
  - Verify receipt exists
  - Verify audit_logs exist
```

### 10.2 Inventory Accuracy
**Property**: Inventory on hand must match sum of transactions

**Validation**:
```
For each product in each branch:
  current_stock = initial_stock + SUM(inventory_logs.quantity_change)
  Verify: current_stock = inventory.quantity_on_hand
```

### 10.3 Payment Integrity
**Property**: Total payments must equal transaction total

**Validation**:
```
For each transaction:
  SUM(payments.amount_paid) = transaction.total_amount
```

### 10.4 Audit Completeness
**Property**: Every transaction must have audit trail

**Validation**:
```
For each transaction:
  Verify audit_logs exist for:
  - Transaction creation
  - Each item added
  - Payment processing
  - Inventory update
  - Receipt generation
```

## Deliverables Summary

✅ POS Service architecture
✅ Cart management system
✅ Payment processing engine
✅ Receipt generation system
✅ Inventory integration
✅ Database schema (Phase 2)
✅ API design (all endpoints)
✅ Caching strategy
✅ Error handling
✅ Performance optimization
✅ Security architecture
✅ Monitoring strategy
✅ Correctness properties
