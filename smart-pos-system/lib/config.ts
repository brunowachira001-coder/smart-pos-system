export const config = {
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },

  // M-Pesa
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortcode: process.env.MPESA_SHORTCODE || '',
    passkey: process.env.MPESA_PASSKEY || '',
    environment: (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  },

  // Application
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',
  },

  // Audit & Logging
  audit: {
    logLevel: process.env.LOG_LEVEL || 'info',
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '365', 10),
  },

  // Multi-branch
  multiBranch: {
    enabled: process.env.ENABLE_MULTI_BRANCH === 'true',
    syncIntervalMs: parseInt(process.env.SYNC_INTERVAL_MS || '5000', 10),
  },

  // Offline Mode
  offline: {
    enabled: process.env.ENABLE_OFFLINE_MODE === 'true',
    syncBatchSize: parseInt(process.env.OFFLINE_SYNC_BATCH_SIZE || '100', 10),
  },

  // Performance
  performance: {
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
    productSearchTimeoutMs: parseInt(process.env.PRODUCT_SEARCH_TIMEOUT_MS || '100', 10),
    inventoryUpdateTimeoutMs: parseInt(process.env.INVENTORY_UPDATE_TIMEOUT_MS || '100', 10),
  },
};

export default config;
