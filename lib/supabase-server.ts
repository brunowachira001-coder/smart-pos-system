/**
 * SERVER-SIDE Supabase Client
 * Uses service role key - NEVER expose to browser
 * ONLY import this in API routes
 */

import { createClient } from '@supabase/supabase-js';
import env from './env-validation';

if (typeof window !== 'undefined') {
  throw new Error('supabase-server.ts should only be imported in server-side code (API routes)');
}

export const supabaseServer = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
