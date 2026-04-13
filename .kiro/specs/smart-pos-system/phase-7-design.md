# Phase 7 - Audit, Security & Fraud Control
## Design Document

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Security & Audit Layer                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Audit      │  │   Fraud      │  │   Access     │      │
│  │   Logger     │  │   Detection  │  │   Control    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Security      │                        │
│                    │  Middleware    │                        │
│                    └────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐         ┌─────────┐
    │ Audit   │          │ Fraud   │         │ Access  │
    │ Tables  │          │ Tables  │         │ Tables  │
    └─────────┘          └─────────┘         └─────────┘
```

---

## 1. Database Schema

### 1.1 Audit Log Tables

```sql
-- Core audit log table (immutable)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT,
  user_id BIGINT NOT NULL,
  username VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  device_fingerprint VARCHAR(255),
  session_id VARCHAR(255),
  before_values JSONB,
  after_values JSONB,
  reason TEXT,
  severity VARCHAR(20) DEFAULT 'INFO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT audit_logs_immutable CHECK (created_at = CURRENT_TIMESTAMP)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);

-- Audit log categories
CREATE TABLE audit_log_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  retention_days INT DEFAULT 2555 -- 7 years
);

-- Map audit logs to categories
CREATE TABLE audit_log_category_mapping (
  audit_log_id BIGINT NOT NULL REFERENCES audit_logs(id),
  category_id INT NOT NULL REFERENCES audit_log_categories(id),
  PRIMARY KEY (audit_log_id, category_id)
);

-- Audit log queries (for performance tracking)
CREATE TABLE audit_log_queries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  query_type VARCHAR(100),
  filters JSONB,
  result_count INT,
  execution_time_ms INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Fraud Detection Tables

```sql
-- Fraud detection rules
CREATE TABLE fraud_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL, -- TRANSACTION, INVENTORY, CUSTOMER, USER
  condition JSONB NOT NULL,
  risk_score INT DEFAULT 50,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suspicious transactions
CREATE TABLE suspicious_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL UNIQUE,
  risk_score INT NOT NULL,
  detected_patterns TEXT[],
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  investigation_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, INVESTIGATING, RESOLVED, FALSE_POSITIVE
  investigator_id BIGINT,
  investigation_notes TEXT,
  resolved_at TIMESTAMP
);

-- Fraud alerts
CREATE TABLE fraud_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
  description TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id BIGINT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_by BIGINT,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- User behavior baseline
CREATE TABLE user_behavior_baseline (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  avg_transactions_per_shift DECIMAL(10, 2),
  avg_discount_percentage DECIMAL(5, 2),
  avg_void_refund_rate DECIMAL(5, 2),
  typical_login_hours VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User behavior anomalies
CREATE TABLE user_behavior_anomalies (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  anomaly_type VARCHAR(100),
  baseline_value DECIMAL(10, 2),
  actual_value DECIMAL(10, 2),
  deviation_percentage DECIMAL(5, 2),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  severity VARCHAR(20)
);
```

### 1.3 Access Control Tables

```sql
-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  permission_name VARCHAR(255) NOT NULL UNIQUE,
  entity_type VARCHAR(50),
  operation VARCHAR(50), -- CREATE, READ, UPDATE, DELETE, APPROVE, REJECT, EXPORT, PRINT, CONFIGURE
  description TEXT
);

-- Role permissions mapping
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id),
  permission_id INT NOT NULL REFERENCES permissions(id),
  UNIQUE(role_id, permission_id)
);

-- User roles
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id),
  assigned_by BIGINT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id, role_id)
);

-- Permission change history
CREATE TABLE permission_change_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id INT,
  permission_id INT,
  change_type VARCHAR(50), -- ADDED, REMOVED, MODIFIED
  changed_by BIGINT NOT NULL,
  reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 Session & Authentication Tables

```sql
-- User sessions
CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Failed login attempts
CREATE TABLE failed_login_attempts (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255),
  ip_address INET,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255)
);

-- MFA settings
CREATE TABLE mfa_settings (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  mfa_type VARCHAR(50), -- TOTP, SMS, EMAIL
  mfa_secret VARCHAR(255),
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP
);

-- Login history
CREATE TABLE login_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  ip_address INET,
  device_fingerprint VARCHAR(255),
  mfa_used BOOLEAN DEFAULT FALSE,
  success BOOLEAN DEFAULT TRUE
);
```

### 1.5 Encryption & Security Tables

```sql
-- Encryption keys (metadata only, actual keys in secure vault)
CREATE TABLE encryption_keys (
  id SERIAL PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  key_type VARCHAR(50), -- AES-256, RSA, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rotated_at TIMESTAMP,
  next_rotation TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Security incidents
CREATE TABLE security_incidents (
  id BIGSERIAL PRIMARY KEY,
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  description TEXT,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detected_by BIGINT,
  affected_systems TEXT[],
  affected_data TEXT[],
  root_cause TEXT,
  remediation_steps TEXT,
  resolved_at TIMESTAMP,
  resolution_time_minutes INT
);

-- Compliance checks
CREATE TABLE compliance_checks (
  id BIGSERIAL PRIMARY KEY,
  check_type VARCHAR(100) NOT NULL,
  check_name VARCHAR(255),
  status VARCHAR(50), -- PASSED, FAILED, WARNING
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSONB,
  remediation_required BOOLEAN DEFAULT FALSE
);
```

---

## 2. API Endpoints

### 2.1 Audit Log Endpoints

```
GET    /api/v1/audit-logs
       Query parameters: user_id, entity_type, action_type, date_from, date_to, severity
       Response: Paginated audit logs with total count
       
GET    /api/v1/audit-logs/:id
       Response: Single audit log entry
       
GET    /api/v1/audit-logs/entity/:entity_type/:entity_id
       Response: All audit logs for specific entity
       
GET    /api/v1/audit-logs/user/:user_id/activity
       Response: User activity timeline
       
POST   /api/v1/audit-logs/export
       Body: { format: 'CSV' | 'PDF', filters: {...} }
       Response: Export file
```

### 2.2 Fraud Detection Endpoints

```
GET    /api/v1/fraud/suspicious-transactions
       Query parameters: status, risk_score_min, risk_score_max, date_from, date_to
       Response: List of suspicious transactions
       
GET    /api/v1/fraud/suspicious-transactions/:id
       Response: Detailed suspicious transaction with investigation history
       
POST   /api/v1/fraud/suspicious-transactions/:id/investigate
       Body: { investigator_id, notes }
       Response: Updated investigation status
       
POST   /api/v1/fraud/suspicious-transactions/:id/resolve
       Body: { resolution_type: 'FRAUD' | 'FALSE_POSITIVE', notes }
       Response: Resolution confirmation
       
GET    /api/v1/fraud/alerts
       Query parameters: severity, status, date_from, date_to
       Response: List of fraud alerts
       
POST   /api/v1/fraud/alerts/:id/acknowledge
       Response: Acknowledgment confirmation
       
GET    /api/v1/fraud/user-behavior/:user_id
       Response: User behavior baseline and anomalies
       
GET    /api/v1/fraud/risk-score/:transaction_id
       Response: Transaction risk score and detected patterns
```

### 2.3 Access Control Endpoints

```
GET    /api/v1/roles
       Response: List of all roles
       
GET    /api/v1/roles/:id/permissions
       Response: Permissions for specific role
       
POST   /api/v1/users/:user_id/roles
       Body: { role_id, expires_at }
       Response: Role assignment confirmation
       
DELETE /api/v1/users/:user_id/roles/:role_id
       Response: Role removal confirmation
       
GET    /api/v1/users/:user_id/permissions
       Response: All permissions for user (aggregated from roles)
       
GET    /api/v1/permission-changes
       Query parameters: user_id, date_from, date_to
       Response: Permission change history
```

### 2.4 Session Management Endpoints

```
POST   /api/v1/auth/login
       Body: { username, password, mfa_code? }
       Response: { session_token, refresh_token, expires_in }
       
POST   /api/v1/auth/refresh
       Body: { refresh_token }
       Response: { session_token, expires_in }
       
POST   /api/v1/auth/logout
       Response: Logout confirmation
       
GET    /api/v1/auth/sessions
       Response: List of active sessions for current user
       
DELETE /api/v1/auth/sessions/:session_id
       Response: Session termination confirmation
       
POST   /api/v1/auth/mfa/setup
       Body: { mfa_type: 'TOTP' | 'SMS' | 'EMAIL' }
       Response: { secret, qr_code, backup_codes }
       
POST   /api/v1/auth/mfa/verify
       Body: { mfa_code }
       Response: Verification confirmation
```

### 2.5 Security Monitoring Endpoints

```
GET    /api/v1/security/incidents
       Query parameters: severity, status, date_from, date_to
       Response: List of security incidents
       
GET    /api/v1/security/incidents/:id
       Response: Detailed incident with timeline
       
POST   /api/v1/security/incidents/:id/resolve
       Body: { root_cause, remediation_steps }
       Response: Resolution confirmation
       
GET    /api/v1/security/compliance-status
       Response: Current compliance status for all checks
       
GET    /api/v1/security/compliance-report
       Query parameters: format: 'PDF' | 'CSV'
       Response: Compliance report
```

---

## 3. Core Components

### 3.1 Audit Logger Service

```typescript
class AuditLoggerService {
  async logAction(
    actionType: string,
    entityType: string,
    entityId: bigint,
    userId: bigint,
    beforeValues?: Record<string, any>,
    afterValues?: Record<string, any>,
    reason?: string,
    context?: RequestContext
  ): Promise<AuditLog>
  
  async queryLogs(
    filters: AuditLogFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AuditLog>>
  
  async getEntityAuditTrail(
    entityType: string,
    entityId: bigint
  ): Promise<AuditLog[]>
  
  async getUserActivityTimeline(
    userId: bigint,
    dateRange: DateRange
  ): Promise<UserActivity[]>
  
  async exportLogs(
    filters: AuditLogFilters,
    format: 'CSV' | 'PDF'
  ): Promise<Buffer>
}
```

### 3.2 Fraud Detection Service

```typescript
class FraudDetectionService {
  async analyzTransaction(
    transaction: Transaction,
    user: User
  ): Promise<FraudAnalysisResult>
  
  async calculateRiskScore(
    transaction: Transaction,
    user: User
  ): Promise<number>
  
  async detectSuspiciousPatterns(
    transaction: Transaction,
    user: User
  ): Promise<string[]>
  
  async flagSuspiciousTransaction(
    transactionId: bigint,
    riskScore: number,
    patterns: string[]
  ): Promise<void>
  
  async investigateFraud(
    suspiciousTransactionId: bigint,
    investigatorId: bigint,
    notes: string
  ): Promise<void>
  
  async getUserBehaviorBaseline(
    userId: bigint
  ): Promise<UserBehaviorBaseline>
  
  async detectBehaviorAnomalies(
    userId: bigint
  ): Promise<BehaviorAnomaly[]>
}
```

### 3.3 Access Control Service

```typescript
class AccessControlService {
  async checkPermission(
    userId: bigint,
    permission: string
  ): Promise<boolean>
  
  async checkPermissions(
    userId: bigint,
    permissions: string[]
  ): Promise<boolean>
  
  async getUserPermissions(
    userId: bigint
  ): Promise<string[]>
  
  async assignRole(
    userId: bigint,
    roleId: number,
    expiresAt?: Date
  ): Promise<void>
  
  async removeRole(
    userId: bigint,
    roleId: number
  ): Promise<void>
  
  async getPermissionMatrix(): Promise<PermissionMatrix>
  
  async validateDataAccess(
    userId: bigint,
    entityType: string,
    entityId: bigint
  ): Promise<boolean>
}
```

### 3.4 Session Management Service

```typescript
class SessionManagementService {
  async createSession(
    userId: bigint,
    deviceFingerprint: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SessionTokens>
  
  async validateSession(
    sessionToken: string
  ): Promise<SessionData>
  
  async refreshSession(
    refreshToken: string
  ): Promise<SessionTokens>
  
  async terminateSession(
    sessionId: bigint
  ): Promise<void>
  
  async terminateAllSessions(
    userId: bigint
  ): Promise<void>
  
  async getActiveSessions(
    userId: bigint
  ): Promise<Session[]>
  
  async enforceSessionTimeout(
    sessionId: bigint
  ): Promise<void>
}
```

### 3.5 Security Middleware

```typescript
class SecurityMiddleware {
  async authenticate(req: Request): Promise<User>
  
  async authorize(
    req: Request,
    requiredPermission: string
  ): Promise<void>
  
  async validateInput(
    data: any,
    schema: ValidationSchema
  ): Promise<void>
  
  async sanitizeOutput(
    data: any
  ): Promise<any>
  
  async enforceRateLimit(
    userId: bigint,
    endpoint: string
  ): Promise<void>
  
  async validateDeviceFingerprint(
    sessionToken: string,
    currentFingerprint: string
  ): Promise<boolean>
  
  async logSecurityEvent(
    eventType: string,
    severity: string,
    details: Record<string, any>
  ): Promise<void>
}
```

---

## 4. Security Flows

### 4.1 Login Flow with MFA

```
User submits credentials
    ↓
Validate username/password
    ↓
Check failed login attempts
    ↓
If attempts > 5: Lock account for 30 minutes
    ↓
Generate session token
    ↓
If MFA enabled: Send MFA code
    ↓
User submits MFA code
    ↓
Validate MFA code
    ↓
Create session with device fingerprint
    ↓
Return session tokens
    ↓
Log successful login
```

### 4.2 High-Value Transaction Approval Flow

```
User initiates transaction > 500,000 KES
    ↓
Calculate fraud risk score
    ↓
If risk score > 80: Flag as suspicious
    ↓
Require MFA confirmation
    ↓
User submits MFA code
    ↓
Validate MFA code
    ↓
Require manager approval
    ↓
Manager reviews transaction details
    ↓
Manager approves/rejects
    ↓
If approved: Process transaction
    ↓
Log all approvals in audit trail
```

### 4.3 Fraud Detection Flow

```
Transaction submitted
    ↓
Analyze transaction patterns
    ↓
Calculate risk score
    ↓
Detect suspicious patterns
    ↓
If risk score > 80: Flag as suspicious
    ↓
Create fraud alert
    ↓
Notify security team
    ↓
Log in audit trail
    ↓
If risk score > 95: Block transaction
    ↓
Require investigation
```

---

## 5. Encryption Strategy

### 5.1 Data at Rest
- Customer PII: AES-256 encryption
- Payment information: AES-256 encryption
- Passwords: bcrypt hashing (12+ rounds)
- Sensitive configuration: AES-256 encryption
- Encryption keys stored in secure vault (AWS KMS or HashiCorp Vault)

### 5.2 Data in Transit
- All API communication: HTTPS/TLS 1.3
- Certificate pinning for mobile apps
- No sensitive data in URLs or query parameters
- Sensitive data never logged

### 5.3 Key Management
- Key rotation every 90 days
- Keys never exposed in logs or error messages
- Separate key for each data type
- Key versioning for decryption of old data

---

## 6. Performance Considerations

- Audit log queries: < 500ms (indexed by user_id, entity_type, timestamp)
- Fraud detection: < 1 second per transaction
- Access control checks: < 50ms per request
- Session validation: < 100ms per request
- Encryption/decryption: < 200ms per operation

---

## 7. Scalability

- Audit logs: Partitioned by date (monthly)
- Fraud detection: Async processing with queue
- Session management: Redis for fast lookups
- Access control: Cached with 5-minute TTL
- Encryption keys: Cached with 1-hour TTL

