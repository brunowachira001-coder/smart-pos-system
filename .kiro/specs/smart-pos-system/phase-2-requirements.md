# Smart POS System - Phase 2: POS Core (Checkout Engine)

## Overview
Phase 2 focuses on building the production-ready POS transaction engine - the heart of the system. This phase delivers a fast, reliable checkout system optimized for cashier UX with instant inventory updates and comprehensive logging.

## Phase 2 Objectives

### 1. POS Engine Core Features

#### 1.1 Fast Product Search
- **Search by Name**: Fuzzy matching for product names (e.g., "tsh" → "T-Shirt")
- **Search by SKU**: Exact match for product SKU codes
- **Search by Category**: Filter products by category
- **Search by Barcode**: Scan barcode to add product instantly
- **Performance Target**: < 100ms response time for search queries
- **Caching**: Redis cache for frequently searched products
- **Autocomplete**: Suggest products as cashier types

#### 1.2 Shopping Cart Management
- **Add to Cart**: Add product with quantity
- **Update Quantity**: Modify item quantity in cart
- **Remove Item**: Remove product from cart
- **Clear Cart**: Empty entire cart
- **Cart Persistence**: Save cart to session/local storage
- **Cart Summary**: Display subtotal, tax, discounts, total
- **Stock Validation**: Verify stock availability before adding

#### 1.3 Transaction Suspension/Parking
- **Park Transaction**: Save current cart as draft transaction
- **Resume Transaction**: Load parked transaction back to cart
- **List Parked Transactions**: Show all parked transactions for cashier
- **Delete Parked Transaction**: Remove parked transaction
- **Expiry**: Auto-delete parked transactions after 24 hours
- **Metadata**: Store cashier, timestamp, customer info

#### 1.4 Multiple Payment Methods
- **Cash Payment**: Direct cash payment with change calculation
- **M-Pesa Payment**: M-Pesa integration with phone number and reference
- **Bank Transfer**: Bank payment with account details and reference
- **Credit Sale**: Extend credit to customer with debt tracking
- **Split Payment**: Combine multiple payment methods in single transaction
- **Payment Validation**: Verify payment details before processing
- **Partial Payments**: Allow partial payment with remaining balance

### 2. Pricing & Discounts

#### 2.1 Dual Pricing
- **Retail Price**: Standard price for individual customers
- **Wholesale Price**: Discounted price for bulk purchases
- **Price Tiers**: Volume-based pricing (e.g., 10+ units = 10% discount)
- **Customer-Specific Pricing**: VIP customers get special rates
- **Dynamic Pricing**: Adjust prices based on inventory levels
- **Price History**: Track price changes over time

#### 2.2 Discounts & Price Overrides
- **Percentage Discount**: Apply % discount to items or total
- **Fixed Discount**: Apply fixed amount discount
- **Bulk Discount**: Automatic discount for quantity thresholds
- **Promotional Discount**: Apply promotional codes
- **Manager Override**: Allow manager to override prices
- **Discount Limits**: Set maximum discount percentage
- **Discount Logging**: Log all discounts applied with reason

#### 2.3 Tax Calculation
- **Tax Rate**: Apply configurable tax rate
- **Tax Exemption**: Mark items as tax-exempt
- **Tax Breakdown**: Show tax calculation in receipt
- **Tax Reporting**: Track tax collected for compliance

### 3. Receipt Generation

#### 3.1 Digital Receipt
- **Email Receipt**: Send receipt to customer email
- **SMS Receipt**: Send receipt summary via SMS
- **Receipt Storage**: Store receipt in database
- **Receipt Retrieval**: Allow customer to retrieve receipt later
- **Receipt Format**: Professional, readable format with all details

#### 3.2 Thermal Printer Receipt
- **Printer Integration**: Support thermal printer (ESC/POS protocol)
- **Receipt Layout**: Optimized for 80mm thermal paper
- **Receipt Content**: Transaction details, items, totals, payment method
- **Receipt Customization**: Configurable header/footer with business info
- **Print Quality**: Clear, readable output
- **Barcode**: Include transaction barcode for tracking

#### 3.3 Receipt Content
- Transaction ID and timestamp
- Cashier name and branch
- Customer name (if available)
- Itemized list (product, quantity, price, discount, total)
- Subtotal, tax, total discount, grand total
- Payment method and amount paid
- Change (if applicable)
- Thank you message
- Return policy

### 4. Inventory Integration

#### 4.1 Instant Inventory Updates
- **Real-time Deduction**: Deduct stock immediately upon transaction completion
- **Stock Validation**: Verify sufficient stock before checkout
- **Stock Alerts**: Trigger low stock alerts
- **Multi-branch Inventory**: Update inventory for specific branch
- **Inventory Logs**: Create audit trail for all stock movements
- **Rollback**: Restore inventory if transaction is cancelled/refunded

#### 4.2 Stock Management
- **Reserved Stock**: Reserve stock during transaction (before payment)
- **Available Stock**: Calculate available = on_hand - reserved
- **Stock Reconciliation**: Verify physical count matches system
- **Batch Tracking**: Track batch/lot numbers for expiry
- **Supplier Tracking**: Link stock to supplier for reordering

### 5. Audit & Logging

#### 5.1 Transaction Logging
- **Complete Audit Trail**: Log every transaction with all details
- **User Action Logging**: Log who performed each action
- **Timestamp**: Record exact time of each action
- **IP Address**: Log IP address for security
- **Change Tracking**: Log before/after values for modifications
- **Error Logging**: Log all errors with context

#### 5.2 Compliance & Security
- **Immutable Logs**: Audit logs cannot be modified
- **Log Retention**: Keep logs for compliance period
- **Sensitive Data**: Mask sensitive data in logs (partial card numbers)
- **Access Control**: Only authorized users can view logs
- **Compliance Reports**: Generate reports for regulatory requirements

## Phase 2 Technical Requirements

### 6. Backend Architecture

#### 6.1 POS Service Structure
```
src/
├── modules/
│   ├── pos/
│   │   ├── controllers/
│   │   │   └── pos.controller.ts
│   │   ├── services/
│   │   │   ├── pos.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── receipt.service.ts
│   │   │   └── inventory.service.ts
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   ├── transaction-item.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   └── parked-transaction.entity.ts
│   │   ├── dto/
│   │   │   ├── create-transaction.dto.ts
│   │   │   ├── add-to-cart.dto.ts
│   │   │   ├── process-payment.dto.ts
│   │   │   └── search-product.dto.ts
│   │   ├── interfaces/
│   │   │   ├── cart.interface.ts
│   │   │   ├── transaction.interface.ts
│   │   │   └── payment.interface.ts
│   │   └── pos.module.ts
│   ├── products/
│   │   ├── services/
│   │   │   └── product-search.service.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   ├── inventory/
│   │   ├── services/
│   │   │   └── inventory.service.ts
│   │   └── entities/
│   │       └── inventory.entity.ts
│   └── audit/
│       ├── services/
│       │   └── audit.service.ts
│       └── entities/
│           └── audit-log.entity.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── config/
    └── database.config.ts
```

#### 6.2 Database Entities
- **SalesTransaction**: Main transaction record
- **TransactionItem**: Individual items in transaction
- **Payment**: Payment details
- **ParkedTransaction**: Suspended transactions
- **Product**: Product catalog
- **Inventory**: Stock levels
- **AuditLog**: Audit trail

### 7. API Design

#### 7.1 Product Search API
```
GET /api/pos/products/search
Query Parameters:
  - query: string (product name, SKU, or barcode)
  - category: string (optional)
  - limit: number (default: 10)
  - offset: number (default: 0)

Response:
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "name": "T-Shirt",
      "sku": "TSH-001",
      "barcode": "1234567890",
      "category": "Apparel",
      "retailPrice": 500,
      "wholesalePrice": 400,
      "stock": 50,
      "image": "url"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### 7.2 Cart Management API
```
POST /api/pos/cart/add
Body:
{
  "productId": "uuid",
  "quantity": 2,
  "priceType": "retail" | "wholesale",
  "discount": 0
}

Response:
{
  "success": true,
  "data": {
    "cartId": "uuid",
    "items": [
      {
        "itemId": "uuid",
        "productId": "uuid",
        "productName": "T-Shirt",
        "quantity": 2,
        "unitPrice": 500,
        "discount": 0,
        "lineTotal": 1000
      }
    ],
    "summary": {
      "subtotal": 1000,
      "discount": 0,
      "tax": 160,
      "total": 1160
    }
  }
}

PUT /api/pos/cart/items/:itemId
Body:
{
  "quantity": 3,
  "discount": 50
}

DELETE /api/pos/cart/items/:itemId

DELETE /api/pos/cart/clear
```

#### 7.3 Transaction Parking API
```
POST /api/pos/transactions/park
Body:
{
  "cartId": "uuid",
  "customerId": "uuid" (optional),
  "notes": "Customer will return later"
}

Response:
{
  "success": true,
  "data": {
    "parkedTransactionId": "uuid",
    "cartId": "uuid",
    "status": "parked",
    "createdAt": "2024-04-13T10:30:00Z",
    "expiresAt": "2024-04-14T10:30:00Z"
  }
}

GET /api/pos/transactions/parked
Response:
{
  "success": true,
  "data": [
    {
      "parkedTransactionId": "uuid",
      "cartId": "uuid",
      "customerId": "uuid",
      "itemCount": 3,
      "total": 1500,
      "createdAt": "2024-04-13T10:30:00Z",
      "expiresAt": "2024-04-14T10:30:00Z"
    }
  ]
}

POST /api/pos/transactions/parked/:parkedTransactionId/resume
Response:
{
  "success": true,
  "data": {
    "cartId": "uuid",
    "items": [...],
    "summary": {...}
  }
}

DELETE /api/pos/transactions/parked/:parkedTransactionId
```

#### 7.4 Payment Processing API
```
POST /api/pos/transactions/checkout
Body:
{
  "cartId": "uuid",
  "customerId": "uuid" (optional),
  "payments": [
    {
      "method": "cash" | "m-pesa" | "bank" | "credit",
      "amount": 1160,
      "reference": "optional-reference",
      "phoneNumber": "optional-for-mpesa"
    }
  ],
  "notes": "optional-notes"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "completed",
    "items": [...],
    "summary": {
      "subtotal": 1000,
      "discount": 0,
      "tax": 160,
      "total": 1160
    },
    "payments": [
      {
        "paymentId": "uuid",
        "method": "cash",
        "amount": 1160,
        "status": "confirmed"
      }
    ],
    "change": 0,
    "receiptId": "uuid",
    "completedAt": "2024-04-13T10:30:00Z"
  }
}
```

#### 7.5 Receipt API
```
GET /api/pos/receipts/:receiptId
Response:
{
  "success": true,
  "data": {
    "receiptId": "uuid",
    "transactionId": "uuid",
    "format": "digital" | "thermal",
    "content": "receipt-html-or-text",
    "generatedAt": "2024-04-13T10:30:00Z"
  }
}

POST /api/pos/receipts/:receiptId/email
Body:
{
  "email": "customer@example.com"
}

POST /api/pos/receipts/:receiptId/sms
Body:
{
  "phoneNumber": "+254712345678"
}

POST /api/pos/receipts/:receiptId/print
Body:
{
  "printerId": "uuid"
}
```

#### 7.6 Refund API
```
POST /api/pos/transactions/:transactionId/refund
Body:
{
  "reason": "customer-request" | "damaged" | "wrong-item",
  "items": [
    {
      "itemId": "uuid",
      "quantity": 1
    }
  ],
  "notes": "optional-notes"
}

Response:
{
  "success": true,
  "data": {
    "refundId": "uuid",
    "transactionId": "uuid",
    "originalAmount": 1160,
    "refundAmount": 500,
    "status": "processed",
    "processedAt": "2024-04-13T10:35:00Z"
  }
}
```

### 8. Performance Optimization

#### 8.1 Caching Strategy
- **Product Cache**: Cache product catalog in Redis (1 hour TTL)
- **Price Cache**: Cache pricing rules (30 minutes TTL)
- **Inventory Cache**: Cache stock levels (5 minutes TTL)
- **Search Cache**: Cache search results (10 minutes TTL)
- **Cache Invalidation**: Invalidate on product/price/inventory updates

#### 8.2 Database Optimization
- **Indexes**: Fast lookups on product SKU, barcode, category
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Minimize N+1 queries
- **Batch Operations**: Batch inventory updates

#### 8.3 API Optimization
- **Response Compression**: Gzip compression for responses
- **Pagination**: Limit result sets
- **Lazy Loading**: Load data on demand
- **Rate Limiting**: Prevent abuse

### 9. Error Handling

#### 9.1 Error Scenarios
- **Insufficient Stock**: Product out of stock
- **Invalid Payment**: Payment method not available
- **Duplicate Transaction**: Prevent duplicate submissions
- **Network Errors**: Handle connectivity issues
- **Timeout**: Handle slow operations

#### 9.2 Error Responses
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Product T-Shirt has only 5 units available",
    "details": {
      "productId": "uuid",
      "requested": 10,
      "available": 5
    }
  }
}
```

## Phase 2 Deliverables

1. ✅ POS Service with all core features
2. ✅ Fast product search (< 100ms)
3. ✅ Shopping cart management
4. ✅ Transaction parking/suspension
5. ✅ Multiple payment methods
6. ✅ Dual pricing (retail & wholesale)
7. ✅ Discounts & price overrides
8. ✅ Receipt generation (digital + thermal)
9. ✅ Instant inventory updates
10. ✅ Comprehensive audit logging
11. ✅ Production-ready API design
12. ✅ Performance optimization
13. ✅ Error handling
14. ✅ Database schema implementation

## Success Criteria

- All POS features implemented and tested
- API response time < 200ms (p95)
- Product search < 100ms
- Inventory updates < 500ms
- Zero data loss on transaction
- Complete audit trail
- Production-ready code quality
- Comprehensive error handling
- Ready for Phase 3 (Inventory Management)
