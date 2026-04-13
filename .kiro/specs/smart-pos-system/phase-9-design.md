# Phase 9 - Payments Integration
## Design Document

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Processing Layer                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   M-Pesa     │  │   Cash       │  │   Bank       │      │
│  │   Processor  │  │   Processor  │  │   Processor  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Payment       │                        │
│                    │  Orchestrator  │                        │
│                    └────────────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│    ┌─────────┐        ┌─────────┐       ┌─────────┐        │
│    │ Payment │        │ Payment │       │ Payment │        │
│    │ Logger  │        │ Reconcil│       │ Security│        │
│    │         │        │ iation  │       │         │        │
│    └─────────┘        └─────────┘       └─────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐         ┌─────────┐
    │ Payment │          │ Payment │         │ Payment │
    │ Logs    │          │ Reconcil│         │ Security│
    │ Tables  │          │ Tables  │         │ Tables  │
    └─────────┘          └─────────┘         └─────────┘
```

---

## 1. Database Schema

### 1.1 Payment Tables

```sql
-- Payment methods
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  method_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  processing_fee DECIMAL(5, 2) DEFAULT 0
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL UNIQUE,
  payment_method_id INT NOT NULL REFERENCES payment_methods(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  customer_id BIGINT,
  branch_id INT NOT NULL,
  user_id BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCESS, FAILED, REVERSED
  reference_number VARCHAR(255),
  external_reference VARCHAR(255),
  payment_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT
);

CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(reference_number);
CREATE INDEX idx_payment_transactions_external_ref ON payment_transactions(external_reference);
CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at DESC);

-- Payment confirmations
CREATE TABLE payment_confirmations (
  id BIGSERIAL PRIMARY KEY,
  payment_transaction_id BIGINT NOT NULL UNIQUE REFERENCES payment_transactions(id),
  confirmation_code VARCHAR(255),
  confirmation_timestamp TIMESTAMP,
  confirmation_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 M-Pesa Tables

```sql
-- M-Pesa configuration
CREATE TABLE mpesa_configuration (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL UNIQUE REFERENCES branches(id),
  business_shortcode VARCHAR(50) NOT NULL,
  consumer_key VARCHAR(255) NOT NULL,
  consumer_secret VARCHAR(255) NOT NULL,
  passkey VARCHAR(255) NOT NULL,
  callback_url VARCHAR(255),
  timeout_url VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- M-Pesa transactions
CREATE TABLE mpesa_transactions (
  id BIGSERIAL PRIMARY KEY,
  payment_transaction_id BIGINT NOT NULL UNIQUE REFERENCES payment_transactions(id),
  merchant_request_id VARCHAR(255),
  checkout_request_id VARCHAR(255),
  phone_number VARCHAR(20),
  amount DECIMAL(12, 2),
  status VARCHAR(50), -- INITIATED, PENDING, SUCCESS, FAILED, TIMEOUT
  response_code VARCHAR(10),
  response_message TEXT,
  result_code VARCHAR(10),
  result_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- M-Pesa callbacks
CREATE TABLE mpesa_callbacks (
  id BIGSERIAL PRIMARY KEY,
  checkout_request_id VARCHAR(255),
  merchant_request_id VARCHAR(255),
  result_code VARCHAR(10),
  result_description TEXT,
  amount DECIMAL(12, 2),
  mpesa_receipt_number VARCHAR(50),
  transaction_date TIMESTAMP,
  phone_number VARCHAR(20),
  callback_data JSONB,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- M-Pesa reconciliation
CREATE TABLE mpesa_reconciliation (
  id BIGSERIAL PRIMARY KEY,
  reconciliation_date DATE NOT NULL,
  branch_id INT NOT NULL,
  total_transactions INT,
  total_amount DECIMAL(12, 2),
  successful_transactions INT,
  failed_transactions INT,
  pending_transactions INT,
  discrepancies INT,
  status VARCHAR(50), -- PENDING, RECONCILED, DISCREPANCY
  reconciled_by BIGINT,
  reconciled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Cash Payment Tables

```sql
-- Cash drawer
CREATE TABLE cash_drawer (
  id BIGSERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  user_id BIGINT NOT NULL,
  opening_balance DECIMAL(12, 2),
  closing_balance DECIMAL(12, 2),
  expected_balance DECIMAL(12, 2),
  actual_balance DECIMAL(12, 2),
  discrepancy DECIMAL(12, 2),
  status VARCHAR(50), -- OPEN, CLOSED, RECONCILED
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  reconciled_at TIMESTAMP
);

-- Cash drawer transactions
CREATE TABLE cash_drawer_transactions (
  id BIGSERIAL PRIMARY KEY,
  cash_drawer_id BIGINT NOT NULL REFERENCES cash_drawer(id),
  transaction_type VARCHAR(50), -- SALE, REFUND, WITHDRAWAL, DEPOSIT
  amount DECIMAL(12, 2),
  reference_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 Bank Transfer Tables

```sql
-- Bank accounts
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(50),
  bank_name VARCHAR(100),
  bank_code VARCHAR(20),
  swift_code VARCHAR(20),
  is_primary BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank transfers
CREATE TABLE bank_transfers (
  id BIGSERIAL PRIMARY KEY,
  payment_transaction_id BIGINT NOT NULL UNIQUE REFERENCES payment_transactions(id),
  bank_account_id INT NOT NULL REFERENCES bank_accounts(id),
  payment_reference VARCHAR(255) NOT NULL UNIQUE,
  expected_amount DECIMAL(12, 2),
  received_amount DECIMAL(12, 2),
  status VARCHAR(50), -- PENDING, RECEIVED, FAILED, TIMEOUT
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank reconciliation
CREATE TABLE bank_reconciliation (
  id BIGSERIAL PRIMARY KEY,
  bank_account_id INT NOT NULL REFERENCES bank_accounts(id),
  reconciliation_date DATE NOT NULL,
  statement_balance DECIMAL(12, 2),
  system_balance DECIMAL(12, 2),
  discrepancy DECIMAL(12, 2),
  status VARCHAR(50), -- PENDING, RECONCILED, DISCREPANCY
  reconciled_by BIGINT,
  reconciled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.5 Credit Sale Tables

```sql
-- Credit sales
CREATE TABLE credit_sales (
  id BIGSERIAL PRIMARY KEY,
  payment_transaction_id BIGINT NOT NULL UNIQUE REFERENCES payment_transactions(id),
  customer_id BIGINT NOT NULL,
  credit_limit DECIMAL(12, 2),
  available_credit DECIMAL(12, 2),
  debt_amount DECIMAL(12, 2),
  payment_terms VARCHAR(50),
  due_date DATE,
  status VARCHAR(50), -- ACTIVE, PAID, OVERDUE, WRITTEN_OFF
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMP
);

-- Credit payments
CREATE TABLE credit_payments (
  id BIGSERIAL PRIMARY KEY,
  credit_sale_id BIGINT NOT NULL REFERENCES credit_sales(id),
  payment_amount DECIMAL(12, 2),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method_id INT REFERENCES payment_methods(id),
  reference_number VARCHAR(255)
);
```

### 1.6 Payment Logging Tables

```sql
-- Payment logs (immutable)
CREATE TABLE payment_logs (
  id BIGSERIAL PRIMARY KEY,
  payment_transaction_id BIGINT NOT NULL,
  action VARCHAR(100),
  details JSONB,
  user_id BIGINT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment reconciliation logs
CREATE TABLE payment_reconciliation_logs (
  id BIGSERIAL PRIMARY KEY,
  reconciliation_type VARCHAR(50),
  expected_amount DECIMAL(12, 2),
  actual_amount DECIMAL(12, 2),
  discrepancy DECIMAL(12, 2),
  resolution TEXT,
  user_id BIGINT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment error logs
CREATE TABLE payment_error_logs (
  id BIGSERIAL PRIMARY KEY,
  error_type VARCHAR(100),
  error_message TEXT,
  payment_details JSONB,
  user_id BIGINT,
  resolution TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. API Endpoints

### 2.1 Payment Processing Endpoints

```
POST   /api/v1/payments/process
       Body: { transaction_id, payment_method_id, amount, customer_id }
       Response: { payment_id, status, reference_number }
       
GET    /api/v1/payments/:id
       Response: Payment details
       
GET    /api/v1/payments/status/:reference_number
       Response: Payment status
       
POST   /api/v1/payments/:id/confirm
       Body: { confirmation_code }
       Response: Confirmation result
       
POST   /api/v1/payments/:id/reverse
       Body: { reason }
       Response: Reversal confirmation
```

### 2.2 M-Pesa Endpoints

```
POST   /api/v1/mpesa/stk-push
       Body: { phone_number, amount, transaction_id }
       Response: { checkout_request_id, merchant_request_id }
       
POST   /api/v1/mpesa/callback
       Body: { callback_data }
       Response: Callback acknowledgment
       
GET    /api/v1/mpesa/status/:checkout_request_id
       Response: Payment status
       
GET    /api/v1/mpesa/reconciliation
       Query parameters: date_from, date_to, branch_id
       Response: Reconciliation report
       
POST   /api/v1/mpesa/reconciliation/manual
       Body: { reconciliation_data }
       Response: Manual reconciliation result
```

### 2.3 Cash Payment Endpoints

```
POST   /api/v1/cash/payment
       Body: { amount, transaction_id }
       Response: Payment confirmation
       
GET    /api/v1/cash/drawer
       Response: Current cash drawer status
       
POST   /api/v1/cash/drawer/open
       Body: { opening_balance }
       Response: Drawer opened
       
POST   /api/v1/cash/drawer/close
       Body: { closing_balance }
       Response: Drawer closed
       
POST   /api/v1/cash/drawer/reconcile
       Body: { actual_balance }
       Response: Reconciliation result
```

### 2.4 Bank Transfer Endpoints

```
POST   /api/v1/bank/transfer
       Body: { amount, transaction_id, bank_account_id }
       Response: { payment_reference, bank_details }
       
GET    /api/v1/bank/accounts
       Response: List of bank accounts
       
GET    /api/v1/bank/reconciliation
       Query parameters: date_from, date_to
       Response: Bank reconciliation report
       
POST   /api/v1/bank/reconciliation/manual
       Body: { reconciliation_data }
       Response: Manual reconciliation result
```

### 2.5 Credit Sale Endpoints

```
POST   /api/v1/credit/sale
       Body: { customer_id, amount, payment_terms }
       Response: Credit sale confirmation
       
GET    /api/v1/credit/customer/:customer_id
       Response: Customer credit details
       
POST   /api/v1/credit/payment
       Body: { credit_sale_id, payment_amount, payment_method_id }
       Response: Payment confirmation
       
GET    /api/v1/credit/aging
       Response: Debt aging report
```

### 2.6 Payment Reporting Endpoints

```
GET    /api/v1/payments/report/daily
       Query parameters: date, branch_id
       Response: Daily payment report
       
GET    /api/v1/payments/report/reconciliation
       Query parameters: date_from, date_to
       Response: Reconciliation report
       
GET    /api/v1/payments/report/method-breakdown
       Query parameters: date_from, date_to
       Response: Payment method breakdown
       
GET    /api/v1/payments/report/errors
       Query parameters: date_from, date_to
       Response: Payment error report
```

---

## 3. Core Services

### 3.1 Payment Orchestrator Service

```typescript
class PaymentOrchestratorService {
  async processPayment(
    transactionId: bigint,
    paymentMethodId: number,
    amount: Decimal,
    customerId?: bigint
  ): Promise<PaymentResult>
  
  async getPaymentStatus(paymentId: bigint): Promise<PaymentStatus>
  
  async confirmPayment(paymentId: bigint, confirmationCode: string): Promise<void>
  
  async reversePayment(paymentId: bigint, reason: string): Promise<void>
  
  async handlePaymentCallback(callbackData: any): Promise<void>
}
```

### 3.2 M-Pesa Service

```typescript
class MpesaService {
  async initiateStkPush(
    phoneNumber: string,
    amount: Decimal,
    transactionId: bigint,
    branchId: number
  ): Promise<StkPushResponse>
  
  async checkPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus>
  
  async handleCallback(callbackData: any): Promise<void>
  
  async reconcilePayments(date: Date, branchId: number): Promise<ReconciliationResult>
  
  async getTransactionDetails(mpesaReceiptNumber: string): Promise<TransactionDetails>
}
```

### 3.3 Cash Payment Service

```typescript
class CashPaymentService {
  async processCashPayment(amount: Decimal, transactionId: bigint): Promise<void>
  
  async openCashDrawer(branchId: number, userId: bigint, openingBalance: Decimal): Promise<void>
  
  async closeCashDrawer(branchId: number, closingBalance: Decimal): Promise<ReconciliationResult>
  
  async reconcileCashDrawer(branchId: number, actualBalance: Decimal): Promise<void>
  
  async getCashDrawerStatus(branchId: number): Promise<CashDrawerStatus>
}
```

### 3.4 Bank Transfer Service

```typescript
class BankTransferService {
  async initiateBankTransfer(
    amount: Decimal,
    transactionId: bigint,
    bankAccountId: number
  ): Promise<BankTransferResponse>
  
  async generatePaymentReference(transactionId: bigint): Promise<string>
  
  async verifyPaymentReceived(paymentReference: string): Promise<boolean>
  
  async reconcileBankTransfers(date: Date): Promise<ReconciliationResult>
  
  async importBankStatement(statement: BankStatement): Promise<void>
}
```

### 3.5 Credit Sale Service

```typescript
class CreditSaleService {
  async createCreditSale(
    customerId: bigint,
    amount: Decimal,
    paymentTerms: string
  ): Promise<CreditSale>
  
  async getCustomerCredit(customerId: bigint): Promise<CustomerCredit>
  
  async recordCreditPayment(
    creditSaleId: bigint,
    paymentAmount: Decimal,
    paymentMethodId: number
  ): Promise<void>
  
  async getDebtAgingReport(): Promise<DebtAgingReport>
  
  async markOverdue(creditSaleId: bigint): Promise<void>
}
```

### 3.6 Payment Logger Service

```typescript
class PaymentLoggerService {
  async logPaymentAction(
    paymentTransactionId: bigint,
    action: string,
    details: Record<string, any>,
    userId: bigint
  ): Promise<void>
  
  async logReconciliation(
    reconciliationType: string,
    expectedAmount: Decimal,
    actualAmount: Decimal,
    discrepancy: Decimal,
    resolution: string,
    userId: bigint
  ): Promise<void>
  
  async logPaymentError(
    errorType: string,
    errorMessage: string,
    paymentDetails: Record<string, any>,
    userId: bigint
  ): Promise<void>
  
  async getPaymentLogs(paymentId: bigint): Promise<PaymentLog[]>
}
```

---

## 4. M-Pesa Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    M-Pesa Payment Flow                       │
└─────────────────────────────────────────────────────────────┘

1. Cashier selects M-Pesa payment method
                    │
                    ▼
2. Enter customer phone number
                    │
                    ▼
3. Initiate STK Push
   POST /api/v1/mpesa/stk-push
                    │
                    ▼
4. M-Pesa API returns checkout_request_id
                    │
                    ▼
5. Customer receives prompt on phone
                    │
                    ▼
6. Customer enters M-Pesa PIN
                    │
                    ▼
7. M-Pesa processes payment
                    │
                    ▼
8. M-Pesa sends callback to system
   POST /api/v1/mpesa/callback
                    │
                    ▼
9. System updates payment status
                    │
                    ▼
10. Receipt generated
                    │
                    ▼
11. Inventory updated
                    │
                    ▼
12. Transaction completed
```

---

## 5. Payment Reconciliation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Payment Reconciliation Flow                     │
└─────────────────────────────────────────────────────────────┘

1. End of day / End of period
                    │
                    ▼
2. Collect all payment transactions
                    │
                    ▼
3. Calculate expected totals
                    │
                    ▼
4. Retrieve actual totals from payment provider
                    │
                    ▼
5. Compare expected vs actual
                    │
                    ▼
6. Identify discrepancies
                    │
                    ▼
7. If no discrepancies:
   Mark as RECONCILED
                    │
                    ▼
8. If discrepancies:
   Create investigation workflow
                    │
                    ▼
9. Investigate and resolve
                    │
                    ▼
10. Update reconciliation status
                    │
                    ▼
11. Generate reconciliation report
```

---

## 6. Security Architecture

### 6.1 M-Pesa Security
- API credentials encrypted and stored in secure vault
- HTTPS/TLS 1.3 for all M-Pesa communication
- Request signing with consumer key/secret
- Callback validation (IP whitelist, signature verification)
- Rate limiting on M-Pesa API calls
- Audit trail for all M-Pesa operations

### 6.2 Payment Data Security
- No storage of sensitive payment data (card numbers, CVV)
- Tokenization for card payments
- Encryption of payment data in transit (HTTPS/TLS 1.3)
- Encryption of payment data at rest (AES-256)
- Access control for payment data
- Audit logging for payment data access

### 6.3 PCI DSS Compliance
- Secure API communication
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- CSRF prevention
- Rate limiting on payment endpoints

---

## 7. Performance Considerations

- M-Pesa STK Push response: < 2 seconds
- Payment confirmation: < 1 second
- Cash payment processing: < 500ms
- Bank transfer initiation: < 1 second
- Payment reconciliation: < 5 seconds
- Payment query: < 200ms

---

## 8. Scalability

- Support 10,000+ transactions per minute
- Support 1000+ concurrent payment requests
- Database indexing on payment status, reference numbers
- Caching for payment method configuration
- Async processing for reconciliation
- Message queue for payment callbacks

