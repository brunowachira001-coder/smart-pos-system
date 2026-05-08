/**
 * CLIENT-SIDE Supabase Client
 * ONLY uses anon key - safe for browser
 * DO NOT import this in API routes
 */

import { createClient } from '@supabase/supabase-js';
import env from './env-validation';

if (typeof window === 'undefined') {
  throw new Error('supabase-client.ts should only be imported in client-side code');
}

export const supabaseClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
