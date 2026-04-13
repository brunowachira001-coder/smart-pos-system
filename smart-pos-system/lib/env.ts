/**
 * Environment variable validation
 * Ensures all required environment variables are set at startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'NODE_ENV',
];

const optionalEnvVars = [
  'REDIS_URL',
  'OPENAI_API_KEY',
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY',
  'PORT',
  'NEXT_PUBLIC_API_URL',
];

export function validateEnvironment() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
  }

  console.log('✅ Environment variables validated');
  return true;
}

export function getEnvironmentSummary() {
  return {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
    redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
    openaiKey: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
    port: process.env.PORT || 3000,
  };
}
