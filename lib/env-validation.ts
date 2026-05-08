/**
 * Environment Variable Validation
 * Validates all required environment variables at build/runtime
 * Prevents deployment with missing configuration
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Authentication
  JWT_SECRET: string;
  
  // Optional
  REDIS_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  };
  
  // Check for missing variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  // Validate JWT_SECRET strength
  if (required.JWT_SECRET && required.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate Supabase URL format
  if (required.NEXT_PUBLIC_SUPABASE_URL && !required.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }
  
  if (errors.length > 0) {
    throw new EnvironmentValidationError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: required.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: required.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: required.SUPABASE_SERVICE_ROLE_KEY!,
    JWT_SECRET: required.JWT_SECRET!,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  };
}

// Validate on module load
let env: EnvConfig;

try {
  env = validateEnv();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  if (error instanceof EnvironmentValidationError) {
    console.error('❌ Environment Validation Failed:');
    console.error(error.message);
    
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  throw error;
}

export default env;
export { validateEnv };
