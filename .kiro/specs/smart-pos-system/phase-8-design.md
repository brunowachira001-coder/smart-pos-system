# Phase 8 - Multi-Branch + Scaling
## Design Document

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Central Data Center                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Master     │  │   Central    │  │   Central    │      │
│  │   Database   │  │   API        │  │   Cache      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Sync Engine   │                        │
│                    │  & Message     │                        │
│                    │  Queue         │                        │
│                    └────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐         ┌─────────┐
    │ Branch  │          │ Branch  │         │ Branch  │
    │ Server  │          │ Server  │         │ Server  │
    │ (Opt)   │          │ (Opt)   │         │ (Opt)   │
    └─────────┘          └─────────┘         └─────────┘
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐         ┌────┴────┐
    │ POS      │          │ POS      │         │ POS      │
    │ Terminals│          │ Terminals│         │ Terminals│
    └──────────┘          └──────────┘         └──────────┘
```

---

## 1. Database Schema

### 1.1 Branch Management Tables

```sql
-- Branches
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  branch_code VARCHAR(50) NOT NULL UNIQUE,
  branch_name VARCHAR(255) NOT NULL,
  region_id INT,
  zone_id INT,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_id BIGINT,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
  operating_hours_open TIME,
  operating_hours_close TIME,
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branch hierarchy
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  region_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL,
  region_id INT NOT NULL REFERENCES regions(id),
  UNIQUE(zone_name, region_id)
);

-- Branch configuration
CREATE TABLE branch_configuration (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL UNIQUE REFERENCES branches(id),
  payment_methods TEXT[],
  pricing_strategy VARCHAR(50), -- STANDARD, DYNAMIC, TIERED
  discount_rules JSONB,
  tax_rate DECIMAL(5, 2),
  receipt_format VARCHAR(50),
  reporting_preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branch status tracking
CREATE TABLE branch_status_history (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  changed_by BIGINT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Branch-Specific Data Tables

```sql
-- Branch inventory (extends product inventory)
CREATE TABLE branch_inventory (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  product_id BIGINT NOT NULL,
  stock_level INT NOT NULL DEFAULT 0,
  reorder_point INT,
  reorder_quantity INT,
  supplier_id BIGINT,
  last_stock_check TIMESTAMP,
  UNIQUE(branch_id, product_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Branch pricing (extends product pricing)
CREATE TABLE branch_pricing (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  product_id BIGINT NOT NULL,
  retail_price DECIMAL(12, 2),
  wholesale_price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  UNIQUE(branch_id, product_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Branch transactions
CREATE TABLE branch_transactions (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  transaction_id BIGINT NOT NULL UNIQUE,
  transaction_number VARCHAR(50) NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Branch customers
CREATE TABLE branch_customers (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  customer_id BIGINT NOT NULL,
  is_local BOOLEAN DEFAULT TRUE,
  local_credit_limit DECIMAL(12, 2),
  local_debt_balance DECIMAL(12, 2),
  UNIQUE(branch_id, customer_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Branch staff
CREATE TABLE branch_staff (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, user_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### 1.3 Synchronization Tables

```sql
-- Sync queue for distributed data
CREATE TABLE sync_queue (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  operation VARCHAR(50), -- CREATE, UPDATE, DELETE
  data JSONB NOT NULL,
  source_branch_id INT,
  target_branches INT[],
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SYNCING, COMPLETED, FAILED
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);

-- Sync status per branch
CREATE TABLE sync_status (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  last_sync TIMESTAMP,
  sync_lag_seconds INT,
  pending_items INT,
  failed_items INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id)
);

-- Sync conflicts
CREATE TABLE sync_conflicts (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  branch_id INT NOT NULL,
  central_value JSONB,
  branch_value JSONB,
  conflict_type VARCHAR(50), -- UPDATE_CONFLICT, DELETE_CONFLICT
  resolution VARCHAR(50), -- PENDING, CENTRAL_WINS, BRANCH_WINS, MANUAL
  resolved_by BIGINT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offline transactions (for offline mode)
CREATE TABLE offline_transactions (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  terminal_id VARCHAR(100),
  transaction_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SYNCED, FAILED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP
);
```

### 1.4 Replication & Backup Tables

```sql
-- Replication status
CREATE TABLE replication_status (
  id SERIAL PRIMARY KEY,
  source_server VARCHAR(255),
  target_server VARCHAR(255),
  last_replicated_lsn VARCHAR(100),
  replication_lag_bytes BIGINT,
  replication_lag_seconds INT,
  status VARCHAR(50), -- STREAMING, CATCHING_UP, FAILED
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backup history
CREATE TABLE backup_history (
  id BIGSERIAL PRIMARY KEY,
  backup_type VARCHAR(50), -- FULL, INCREMENTAL, DIFFERENTIAL
  backup_location VARCHAR(255),
  backup_size_bytes BIGINT,
  backup_duration_seconds INT,
  status VARCHAR(50), -- SUCCESS, FAILED, PARTIAL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);
```

---

## 2. API Endpoints

### 2.1 Branch Management Endpoints

```
GET    /api/v1/branches
       Response: List of all branches with status
       
POST   /api/v1/branches
       Body: { branch_code, branch_name, region_id, address, ... }
       Response: Created branch
       
GET    /api/v1/branches/:id
       Response: Branch details
       
PUT    /api/v1/branches/:id
       Body: { branch_name, address, manager_id, ... }
       Response: Updated branch
       
DELETE /api/v1/branches/:id
       Response: Deletion confirmation
       
GET    /api/v1/branches/:id/status
       Response: Branch status and health
       
POST   /api/v1/branches/:id/activate
       Response: Activation confirmation
       
POST   /api/v1/branches/:id/deactivate
       Response: Deactivation confirmation
```

### 2.2 Branch Configuration Endpoints

```
GET    /api/v1/branches/:id/configuration
       Response: Branch configuration
       
PUT    /api/v1/branches/:id/configuration
       Body: { payment_methods, pricing_strategy, ... }
       Response: Updated configuration
       
GET    /api/v1/branches/:id/configuration/sync
       Response: Configuration sync status
```

### 2.3 Branch Inventory Endpoints

```
GET    /api/v1/branches/:id/inventory
       Query parameters: product_id, low_stock, category
       Response: Branch inventory
       
GET    /api/v1/branches/:id/inventory/:product_id
       Response: Product inventory for branch
       
PUT    /api/v1/branches/:id/inventory/:product_id
       Body: { stock_level, reorder_point, ... }
       Response: Updated inventory
       
POST   /api/v1/branches/:id/inventory/transfer
       Body: { from_branch_id, to_branch_id, product_id, quantity }
       Response: Transfer confirmation
```

### 2.4 Central Dashboard Endpoints

```
GET    /api/v1/dashboard/overview
       Response: Central dashboard overview (all branches)
       
GET    /api/v1/dashboard/branches
       Response: Branch status and metrics
       
GET    /api/v1/dashboard/sales
       Query parameters: date_from, date_to, branch_id
       Response: Aggregate sales data
       
GET    /api/v1/dashboard/inventory
       Response: Aggregate inventory data
       
GET    /api/v1/dashboard/customers
       Response: Aggregate customer data
       
GET    /api/v1/dashboard/staff
       Response: Aggregate staff data
```

### 2.5 Aggregate Analytics Endpoints

```
GET    /api/v1/analytics/sales/aggregate
       Query parameters: date_from, date_to, group_by
       Response: Aggregate sales analytics
       
GET    /api/v1/analytics/profit/aggregate
       Query parameters: date_from, date_to, group_by
       Response: Aggregate profit analytics
       
GET    /api/v1/analytics/inventory/aggregate
       Response: Aggregate inventory analytics
       
GET    /api/v1/analytics/customers/aggregate
       Response: Aggregate customer analytics
       
GET    /api/v1/analytics/branches/comparison
       Query parameters: metric, date_from, date_to
       Response: Branch comparison data
       
GET    /api/v1/analytics/branches/performance
       Response: Branch performance ranking
```

### 2.6 Synchronization Endpoints

```
GET    /api/v1/sync/status
       Response: Sync status for all branches
       
GET    /api/v1/sync/status/:branch_id
       Response: Sync status for specific branch
       
GET    /api/v1/sync/queue
       Query parameters: status, branch_id
       Response: Sync queue items
       
POST   /api/v1/sync/trigger
       Body: { branch_id, entity_type }
       Response: Sync trigger confirmation
       
GET    /api/v1/sync/conflicts
       Query parameters: status, branch_id
       Response: Sync conflicts
       
POST   /api/v1/sync/conflicts/:id/resolve
       Body: { resolution: 'CENTRAL_WINS' | 'BRANCH_WINS' | 'MANUAL', value }
       Response: Resolution confirmation
```

### 2.7 Offline Mode Endpoints

```
POST   /api/v1/offline/transactions
       Body: { transaction_data }
       Response: Offline transaction stored
       
GET    /api/v1/offline/transactions
       Response: Pending offline transactions
       
POST   /api/v1/offline/sync
       Response: Sync offline transactions
```

### 2.8 Disaster Recovery Endpoints

```
GET    /api/v1/backup/status
       Response: Backup status
       
POST   /api/v1/backup/trigger
       Body: { backup_type: 'FULL' | 'INCREMENTAL' }
       Response: Backup trigger confirmation
       
GET    /api/v1/backup/history
       Response: Backup history
       
POST   /api/v1/backup/restore
       Body: { backup_id, target_branch_id }
       Response: Restore confirmation
       
GET    /api/v1/replication/status
       Response: Replication status
```

---

## 3. Core Services

### 3.1 Branch Management Service

```typescript
class BranchManagementService {
  async createBranch(branchData: BranchData): Promise<Branch>
  
  async updateBranch(branchId: number, updates: Partial<Branch>): Promise<Branch>
  
  async getBranch(branchId: number): Promise<Branch>
  
  async listBranches(filters?: BranchFilters): Promise<Branch[]>
  
  async activateBranch(branchId: number): Promise<void>
  
  async deactivateBranch(branchId: number): Promise<void>
  
  async getBranchStatus(branchId: number): Promise<BranchStatus>
  
  async getBranchConfiguration(branchId: number): Promise<BranchConfiguration>
  
  async updateBranchConfiguration(branchId: number, config: BranchConfiguration): Promise<void>
}
```

### 3.2 Branch Inventory Service

```typescript
class BranchInventoryService {
  async getBranchInventory(branchId: number, filters?: InventoryFilters): Promise<BranchInventory[]>
  
  async getProductInventory(branchId: number, productId: bigint): Promise<BranchInventory>
  
  async updateInventory(branchId: number, productId: bigint, quantity: number): Promise<void>
  
  async transferInventory(
    fromBranchId: number,
    toBranchId: number,
    productId: bigint,
    quantity: number
  ): Promise<void>
  
  async getBranchPricing(branchId: number, productId: bigint): Promise<BranchPricing>
  
  async updateBranchPricing(branchId: number, productId: bigint, pricing: BranchPricing): Promise<void>
}
```

### 3.3 Synchronization Service

```typescript
class SynchronizationService {
  async syncData(entityType: string, entityId: bigint, operation: string): Promise<void>
  
  async getSyncStatus(branchId?: number): Promise<SyncStatus>
  
  async getSyncQueue(filters?: SyncQueueFilters): Promise<SyncQueueItem[]>
  
  async processSyncQueue(): Promise<void>
  
  async handleSyncConflict(conflict: SyncConflict, resolution: string): Promise<void>
  
  async triggerManualSync(branchId: number, entityType?: string): Promise<void>
  
  async getSyncConflicts(filters?: ConflictFilters): Promise<SyncConflict[]>
}
```

### 3.4 Offline Mode Service

```typescript
class OfflineModeService {
  async storeOfflineTransaction(branchId: number, transaction: Transaction): Promise<void>
  
  async getOfflineTransactions(branchId: number): Promise<OfflineTransaction[]>
  
  async syncOfflineTransactions(branchId: number): Promise<void>
  
  async validateOfflineData(branchId: number): Promise<ValidationResult>
  
  async resolveOfflineConflicts(branchId: number): Promise<void>
}
```

### 3.5 Central Dashboard Service

```typescript
class CentralDashboardService {
  async getDashboardOverview(): Promise<DashboardOverview>
  
  async getBranchesStatus(): Promise<BranchStatus[]>
  
  async getAggregateSales(dateRange: DateRange): Promise<AggregateSalesData>
  
  async getAggregateInventory(): Promise<AggregateInventoryData>
  
  async getAggregateCustomers(): Promise<AggregateCustomerData>
  
  async getAggregateStaff(): Promise<AggregateStaffData>
  
  async getBranchComparison(metric: string, dateRange: DateRange): Promise<BranchComparison>
  
  async getBranchPerformanceRanking(): Promise<BranchPerformance[]>
}
```

### 3.6 Disaster Recovery Service

```typescript
class DisasterRecoveryService {
  async createBackup(backupType: 'FULL' | 'INCREMENTAL'): Promise<Backup>
  
  async getBackupStatus(): Promise<BackupStatus>
  
  async getBackupHistory(limit?: number): Promise<Backup[]>
  
  async restoreBackup(backupId: number, targetBranchId?: number): Promise<void>
  
  async verifyBackup(backupId: number): Promise<boolean>
  
  async getReplicationStatus(): Promise<ReplicationStatus>
  
  async failover(): Promise<void>
  
  async failback(): Promise<void>
}
```

---

## 4. Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Change Event                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Add to Sync Queue    │
                │  (entity, operation)  │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Sync Engine Picks    │
                │  Queue Item           │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Determine Target     │
                │  Branches             │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Send to Branches     │
                │  (via Message Queue)  │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Branch Receives      │
                │  & Applies Change     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Verify & Confirm     │
                │  Sync Success         │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Update Sync Status   │
                │  & Remove from Queue  │
                └───────────────────────┘
```

---

## 5. Offline Mode Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Network Down                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Switch to Offline    │
                │  Mode                 │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Use Local Cache      │
                │  & Database           │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Process Transactions │
                │  Locally              │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Store Transactions   │
                │  in Offline Queue     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Network Restored     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Sync Offline         │
                │  Transactions         │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Resolve Conflicts    │
                │  (if any)             │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Resume Normal        │
                │  Operations           │
                └───────────────────────┘
```

---

## 6. Scalability Architecture

### 6.1 Horizontal Scaling
- Load balancer distributes requests across multiple API servers
- Database read replicas for reporting queries
- Cache cluster (Redis) for distributed caching
- Message queue (RabbitMQ/Kafka) for async processing

### 6.2 Database Sharding
- Shard by branch_id for branch-specific data
- Shard by date for time-series data (transactions, audit logs)
- Shard by customer_id for customer data
- Master-slave replication for each shard

### 6.3 Caching Strategy
- Central cache for shared data (products, promotions, configuration)
- Local cache per branch for branch-specific data
- Cache invalidation on data changes
- Cache TTL based on data type

### 6.4 Performance Optimization
- Database indexing on frequently queried columns
- Query optimization and execution plan analysis
- Connection pooling for database connections
- API response compression (gzip)
- CDN for static content

---

## 7. Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Load Balancer        │
                │  (SSL/TLS)            │
                └───────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │ API    │          │ API    │         │ API    │
    │ Server │          │ Server │         │ Server │
    └────────┘          └────────┘         └────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
            ┌────────┐             ┌────────┐
            │ Master │             │ Read   │
            │ DB     │             │ Replica│
            └────────┘             └────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    ┌────────┐      ┌────────┐
    │ Branch │      │ Branch │
    │ Server │      │ Server │
    └────────┘      └────────┘
        │               │
    ┌───┴───┐       ┌───┴───┐
    ▼       ▼       ▼       ▼
   POS    POS     POS     POS
```

---

## 8. Disaster Recovery Architecture

- **RTO**: < 1 hour
- **RPO**: < 15 minutes
- **Backup Strategy**: Hourly, daily, weekly, monthly
- **Replication**: Master-slave with automatic failover
- **Failover**: Automatic DNS failover to backup data center
- **Testing**: Quarterly disaster recovery drills

