# Smart POS System - Phase 3: Inventory System Design

## 1. Inventory Service Architecture

### 1.1 Service Overview
```
┌─────────────────────────────────────────────────────────┐
│              Inventory Service                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Inventory Controller                          │  │
│  │  - Product CRUD                                  │  │
│  │  - Stock Management                              │  │
│  │  - Alert Management                              │  │
│  │  - Supplier Management                           │  │
│  │  - Valuation & Reporting                         │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Business Logic Services                       │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Product Svc   │  │Stock Service │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Alert Service │  │Supplier Svc  │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │Valuation Svc │  │Reconciliation│             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Data Access Layer                             │  │
│  │  - Product Repository                            │  │
│  │  - Inventory Repository                          │  │
│  │  - Movement Log Repository                       │  │
│  │  - Alert Repository                              │  │
│  │  - Supplier Repository                           │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    External Services                             │  │
│  │  - PostgreSQL Database                           │  │
│  │  - Redis Cache                                   │  │
│  │  - POS Service (for stock updates)               │  │
│  │  - Audit Service                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Service Responsibilities

**Product Service**
- CRUD operations for products
- Product search and filtering
- Product categorization
- Bulk product operations
- Product versioning

**Stock Service**
- Real-time stock tracking
- Stock updates and adjustments
- Stock reservations
- Stock transfers
- Concurrent update handling

**Alert Service**
- Generate alerts based on thresholds
- Manage alert lifecycle
- Send alert notifications
- Track alert history
- Alert analytics

**Supplier Service**
- Manage supplier information
- Track supplier performance
- Manage purchase orders
- Receive goods
- Supplier analytics

**Valuation Service**
- Calculate inventory value
- Track cost of goods
- Generate valuation reports
- Inventory turnover analysis
- Margin analysis

**Reconciliation Service**
- Manage physical counts
- Compare with system counts
- Generate adjustments
- Track reconciliation history
- Variance analysis

## 2. Database Schema (Phase 3 Specific)

### 2.1 Products Table
```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(category_id),
  
  cost_price DECIMAL(12,2) NOT NULL,
  retail_price DECIMAL(12,2) NOT NULL,
  wholesale_price DECIMAL(12,2),
  
  reorder_point INT NOT NULL DEFAULT 10,
  reorder_quantity INT NOT NULL DEFAULT 50,
  max_stock INT,
  safety_stock INT DEFAULT 0,
  
  supplier_id UUID REFERENCES suppliers(supplier_id),
  
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, discontinued
  tax_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  INDEX idx_sku (sku),
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status)
);
```

### 2.2 Inventory Table
```sql
CREATE TABLE inventory (
  inventory_id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  quantity_on_hand INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0,
  quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  
  last_counted_at TIMESTAMP,
  last_movement_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, branch_id),
  INDEX idx_product_branch (product_id, branch_id),
  INDEX idx_branch (branch_id),
  INDEX idx_quantity (quantity_on_hand)
);
```

### 2.3 Inventory Logs Table
```sql
CREATE TABLE inventory_logs (
  log_id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  movement_type VARCHAR(50) NOT NULL, -- sale, purchase, adjustment, transfer, return, damage, expiry
  quantity_change INT NOT NULL,
  
  reference_type VARCHAR(50), -- transaction, purchase_order, adjustment, transfer
  reference_id UUID,
  
  unit_cost DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_date (product_id, created_at DESC),
  INDEX idx_branch_date (branch_id, created_at DESC),
  INDEX idx_movement_type (movement_type),
  INDEX idx_reference (reference_type, reference_id)
);
```

### 2.4 Stock Alerts Table
```sql
CREATE TABLE stock_alerts (
  alert_id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  alert_type VARCHAR(50) NOT NULL, -- low_stock, out_of_stock, overstock, slow_moving, dead_stock, expiry
  threshold_value INT,
  current_value INT,
  
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, acknowledged, snoozed, resolved
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  snoozed_until TIMESTAMP,
  
  INDEX idx_product_branch (product_id, branch_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at DESC)
);
```

### 2.5 Suppliers Table
```sql
CREATE TABLE suppliers (
  supplier_id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  
  payment_terms VARCHAR(100),
  lead_time_days INT,
  
  on_time_delivery_rate DECIMAL(5,2),
  quality_rating DECIMAL(5,2),
  price_competitiveness DECIMAL(5,2),
  
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_status (status)
);
```

### 2.6 Purchase Orders Table
```sql
CREATE TABLE purchase_orders (
  po_id UUID PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  po_number VARCHAR(100) NOT NULL UNIQUE,
  po_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, sent, confirmed, received, closed
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_supplier (supplier_id),
  INDEX idx_branch (branch_id),
  INDEX idx_status (status),
  INDEX idx_po_date (po_date DESC)
);
```

### 2.7 Purchase Order Items Table
```sql
CREATE TABLE purchase_order_items (
  po_item_id UUID PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES purchase_orders(po_id),
  product_id UUID NOT NULL REFERENCES products(product_id),
  
  quantity_ordered INT NOT NULL,
  quantity_received INT NOT NULL DEFAULT 0,
  unit_cost DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_po (po_id),
  INDEX idx_product (product_id)
);
```

### 2.8 Stock Valuation Table
```sql
CREATE TABLE stock_valuations (
  valuation_id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id),
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  valuation_date DATE NOT NULL,
  quantity_on_hand INT NOT NULL,
  unit_cost DECIMAL(12,2) NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  
  valuation_method VARCHAR(50), -- FIFO, LIFO, weighted_average, standard_cost
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_date (product_id, valuation_date DESC),
  INDEX idx_branch_date (branch_id, valuation_date DESC)
);
```

### 2.9 Stock Reconciliation Table
```sql
CREATE TABLE stock_reconciliations (
  reconciliation_id UUID PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES branches(branch_id),
  
  reconciliation_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- in_progress, completed
  
  total_items INT,
  items_counted INT DEFAULT 0,
  discrepancies INT DEFAULT 0,
  
  created_by UUID NOT NULL REFERENCES users(user_id),
  completed_by UUID REFERENCES users(user_id),
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_branch (branch_id),
  INDEX idx_date (reconciliation_date DESC)
);
```

### 2.10 Reconciliation Items Table
```sql
CREATE TABLE reconciliation_items (
  item_id UUID PRIMARY KEY,
  reconciliation_id UUID NOT NULL REFERENCES stock_reconciliations(reconciliation_id),
  product_id UUID NOT NULL REFERENCES products(product_id),
  
  system_quantity INT NOT NULL,
  physical_quantity INT,
  variance INT,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, counted, adjusted
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_reconciliation (reconciliation_id),
  INDEX idx_product (product_id)
);
```

## 3. Stock Update Flow

### 3.1 Real-time Stock Update Process
```
1. Stock change event received (sale, purchase, adjustment)
   ↓
2. Validate stock availability (for sales)
   ↓
3. Acquire lock on inventory record (pessimistic locking)
   ↓
4. Update inventory quantity
   ↓
5. Create inventory log entry
   ↓
6. Release lock
   ↓
7. Check if alert threshold crossed
   ↓
8. Generate alert if needed
   ↓
9. Emit inventory.updated event
   ↓
10. Update cache
    ↓
11. Return success
```

### 3.2 Concurrent Update Handling
```
Pessimistic Locking:
- Lock inventory record during update
- Prevents race conditions
- Ensures data consistency
- Trade-off: Slightly slower but guaranteed consistency

Optimistic Locking:
- Use version number
- Detect conflicts on update
- Retry on conflict
- Better for high concurrency

Strategy:
- Use pessimistic locking for stock updates (critical)
- Use optimistic locking for non-critical updates
```

## 4. Caching Strategy

### 4.1 Cache Layers
```
Layer 1: Product Cache (Redis)
- Key: product:{productId}
- TTL: 1 hour
- Data: Product details, prices, reorder points

Layer 2: Inventory Cache (Redis)
- Key: inventory:{productId}:{branchId}
- TTL: 5 minutes
- Data: Stock levels, reserved quantity

Layer 3: Alert Cache (Redis)
- Key: alerts:{branchId}
- TTL: 1 minute
- Data: Active alerts

Layer 4: Supplier Cache (Redis)
- Key: supplier:{supplierId}
- TTL: 1 hour
- Data: Supplier details, performance metrics
```

### 4.2 Cache Invalidation
```
On Product Update:
- Invalidate product:{productId}
- Invalidate inventory:{productId}:*

On Stock Update:
- Invalidate inventory:{productId}:{branchId}
- Invalidate alerts:{branchId}

On Alert Generation:
- Invalidate alerts:{branchId}

On Supplier Update:
- Invalidate supplier:{supplierId}
```

## 5. Alert Generation Logic

### 5.1 Alert Thresholds
```
Low Stock Alert:
- Trigger: quantity_on_hand <= reorder_point
- Action: Notify manager to reorder

Out of Stock Alert:
- Trigger: quantity_on_hand = 0
- Action: Notify manager immediately

Overstock Alert:
- Trigger: quantity_on_hand > max_stock
- Action: Notify manager to reduce stock

Slow Moving Alert:
- Trigger: No sales in 30 days
- Action: Notify manager to review pricing

Dead Stock Alert:
- Trigger: No sales in 90 days
- Action: Notify manager to consider disposal

Expiry Alert:
- Trigger: Stock expiring within 7 days
- Action: Notify manager to prioritize sales
```

### 5.2 Alert Lifecycle
```
Created → Active → Acknowledged → Resolved
                ↓
              Snoozed (temporary)
```

## 6. Batch Operations

### 6.1 Bulk Product Import
```
1. Validate CSV/Excel format
2. Parse file
3. Validate each row
4. Check for duplicates
5. Begin transaction
6. Insert/update products
7. Create audit logs
8. Commit transaction
9. Return results with success/error count
```

### 6.2 Bulk Stock Update
```
1. Validate input data
2. Begin transaction
3. For each product:
   - Lock inventory record
   - Update quantity
   - Create log entry
   - Release lock
4. Generate alerts if needed
5. Commit transaction
6. Update cache
7. Return results
```

## 7. Performance Optimization

### 7.1 Database Optimization
```
Indexes:
- product_id, branch_id on inventory (fast lookups)
- created_at DESC on inventory_logs (recent movements)
- status on stock_alerts (active alerts)
- po_date DESC on purchase_orders (recent POs)

Partitioning:
- Partition inventory_logs by date (monthly)
- Partition stock_valuations by date (monthly)

Query Optimization:
- Use EXPLAIN ANALYZE
- Avoid N+1 queries
- Use batch queries
- Lazy load related data
```

### 7.2 Caching Strategy
```
Cache Warming:
- Pre-load frequently accessed products
- Pre-load active alerts
- Pre-load supplier data

Cache Invalidation:
- Immediate invalidation on updates
- TTL-based expiration
- Event-based invalidation
```

### 7.3 Batch Processing
```
Batch Size: 1000 items
- Reduces memory usage
- Improves performance
- Prevents timeouts

Async Processing:
- Use message queues for heavy operations
- Process in background
- Return job ID to client
```

## 8. Scalability Architecture

### 8.1 Handling 10,000+ Products
```
Database:
- Partitioning by date
- Archiving old data
- Connection pooling

Caching:
- Redis cluster for distributed caching
- Cache warming strategy
- Efficient cache keys

API:
- Pagination (limit 100 per page)
- Lazy loading
- Compression
```

### 8.2 Concurrent Operations
```
Lock Strategy:
- Pessimistic locking for stock updates
- Short lock duration (< 100ms)
- Deadlock prevention

Connection Pool:
- 50 connections
- Queue timeout: 5 seconds
- Idle timeout: 300 seconds
```

## 9. Correctness Properties

### 9.1 Stock Accuracy
**Property**: Inventory on hand must match sum of movements

**Validation**:
```
For each product in each branch:
  current_stock = initial_stock + SUM(inventory_logs.quantity_change)
  Verify: current_stock = inventory.quantity_on_hand
```

### 9.2 Movement Completeness
**Property**: Every stock change must have corresponding log entry

**Validation**:
```
For each inventory update:
  Verify inventory_logs entry exists
  Verify quantity_change matches
  Verify timestamp is accurate
```

### 9.3 Alert Accuracy
**Property**: All alerts must be generated correctly

**Validation**:
```
For each product:
  If quantity_on_hand <= reorder_point:
    Verify low_stock_alert exists
  If quantity_on_hand = 0:
    Verify out_of_stock_alert exists
```

### 9.4 Valuation Accuracy
**Property**: Total inventory value must be consistent

**Validation**:
```
total_value = SUM(quantity_on_hand * unit_cost)
Verify: total_value matches calculated value
```

## Deliverables Summary

✅ Product CRUD operations
✅ Real-time stock tracking
✅ Batch stock updates
✅ Restocking operations
✅ Low stock alerts
✅ Stock movement logs
✅ Supplier tracking
✅ Inventory valuation
✅ Dead stock detection
✅ Stock reconciliation
✅ Scalable architecture
✅ Performance optimization
✅ Concurrent update handling
✅ Comprehensive audit trail
