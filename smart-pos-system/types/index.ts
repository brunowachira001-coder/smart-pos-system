// ============ AUTHENTICATION & USERS ============
export interface User {
  id: bigint;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: bigint;
  userId: bigint;
  sessionToken: string;
  refreshToken: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface AuthPayload {
  userId: bigint;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: bigint;
}

// ============ BRANCHES ============
export interface Branch {
  id: bigint;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  parentBranchId?: bigint;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

// ============ PRODUCTS & INVENTORY ============
export interface Product {
  id: bigint;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  wholesalePrice?: number;
  costPrice: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: bigint;
  productId: bigint;
  branchId: bigint;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastStockCheck: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: bigint;
  productId: bigint;
  branchId: bigint;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  reason?: string;
  referenceId?: string;
  createdBy: bigint;
  createdAt: Date;
}

// ============ CUSTOMERS & CREDIT ============
export interface Customer {
  id: bigint;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  creditUsed: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerCredit {
  id: bigint;
  customerId: bigint;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  lastPaymentDate?: Date;
  updatedAt: Date;
}

export interface CustomerDebt {
  id: bigint;
  customerId: bigint;
  amount: number;
  daysOverdue: number;
  status: 'CURRENT' | 'OVERDUE' | 'PAID';
  createdAt: Date;
  dueDate: Date;
  paidDate?: Date;
}

// ============ TRANSACTIONS & PAYMENTS ============
export interface Transaction {
  id: bigint;
  branchId: bigint;
  transactionNumber: string;
  customerId?: bigint;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionStatus: 'ACTIVE' | 'PARKED' | 'COMPLETED' | 'VOIDED';
  createdBy: bigint;
  createdAt: Date;
  completedAt?: Date;
  items: TransactionItem[];
  payments: Payment[];
}

export interface TransactionItem {
  id: bigint;
  transactionId: bigint;
  productId: bigint;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Payment {
  id: bigint;
  transactionId: bigint;
  paymentMethod: 'CASH' | 'MPESA' | 'BANK_TRANSFER' | 'CREDIT';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  reference?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============ AUDIT & SECURITY ============
export interface AuditLog {
  id: bigint;
  userId: bigint;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  createdAt: Date;
}

export interface MFASettings {
  id: bigint;
  userId: bigint;
  method: 'TOTP' | 'SMS' | 'EMAIL';
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ ANALYTICS ============
export interface DailySalesReport {
  id: bigint;
  branchId: bigint;
  reportDate: Date;
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalDiscount: number;
  totalTax: number;
  totalReturns: number;
  totalRefunds: number;
  createdAt: Date;
}

export interface ProductAnalytics {
  id: bigint;
  productId: bigint;
  branchId: bigint;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodDate: Date;
  unitsSold: number;
  revenue: number;
  profit: number;
  returnRate: number;
  createdAt: Date;
}

// ============ SYNC & OFFLINE ============
export interface SyncQueue {
  id: bigint;
  branchId: bigint;
  deviceId: string;
  action: string;
  entityType: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  syncedAt?: Date;
}

export interface OfflineTransaction {
  id: string;
  branchId: bigint;
  deviceId: string;
  transactionData: Record<string, any>;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  syncedAt?: Date;
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ ERRORS ============
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
