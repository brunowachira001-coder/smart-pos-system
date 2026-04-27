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

// Database types
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  items: number;
  payment_method: string;
  status: string;
  created_at: string;
}
