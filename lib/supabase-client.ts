import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client — uses anon key, respects RLS
// Use this in API routes alongside explicit tenant_id filters
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// NOTE: supabaseAdmin has been removed from exports.
// Use getAdminDb() from lib/secure-route.ts in auth-only contexts (login, onboard).
// All other routes must use secureRoute() which handles DB access internally.
