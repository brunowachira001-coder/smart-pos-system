import { createClient } from '@supabase/supabase-js';

// Centralized Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key if available, otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export for APIs that need explicit client creation
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};
