#!/usr/bin/env node

/**
 * Setup POS tables using direct SQL execution
 * This connects to your production database using credentials from .env.local
 * Run: node setup-pos-tables-direct.js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to:', supabaseUrl);
console.log('🔑 Using key:', supabaseKey.substring(0, 20) + '...\n');

// SQL to create all tables
const createTablesSQL = `
-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  price_type VARCHAR(50) DEFAULT 'retail',
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  user_id UUID,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON public.transaction_items(transaction_id);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for anon" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all for anon" ON public.transactions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Allow all for anon" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transaction_items;

-- Create policies
CREATE POLICY "Allow all for anon" ON public.cart_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.cart_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for anon" ON public.transactions FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for anon" ON public.transaction_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.transaction_items FOR ALL TO authenticated USING (true);
`;

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function checkTable(tableName) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: `/rest/v1/${tableName}?select=id&limit=1`,
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          exists: res.statusCode === 200,
          statusCode: res.statusCode,
          message: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('📋 Setting up POS tables...\n');

  // First, check if tables already exist
  console.log('1️⃣  Checking existing tables...');
  const cartCheck = await checkTable('cart_items');
  const txCheck = await checkTable('transactions');
  const itemsCheck = await checkTable('transaction_items');

  console.log(`   cart_items: ${cartCheck.exists ? '✅ exists' : '❌ missing'}`);
  console.log(`   transactions: ${txCheck.exists ? '✅ exists' : '❌ missing'}`);
  console.log(`   transaction_items: ${itemsCheck.exists ? '✅ exists' : '❌ missing'}`);

  if (cartCheck.exists && txCheck.exists && itemsCheck.exists) {
    console.log('\n✅ All tables already exist! POS is ready.\n');
    return;
  }

  console.log('\n2️⃣  Creating missing tables...');
  console.log('   This may take a moment...\n');

  try {
    await executeSQL(createTablesSQL);
    console.log('   ✅ SQL executed successfully\n');
  } catch (error) {
    console.log('   ⚠️  RPC method not available, trying alternative...\n');
  }

  // Verify tables were created
  console.log('3️⃣  Verifying tables...');
  const cartCheck2 = await checkTable('cart_items');
  const txCheck2 = await checkTable('transactions');
  const itemsCheck2 = await checkTable('transaction_items');

  console.log(`   cart_items: ${cartCheck2.exists ? '✅ ready' : '❌ failed'}`);
  console.log(`   transactions: ${txCheck2.exists ? '✅ ready' : '❌ failed'}`);
  console.log(`   transaction_items: ${itemsCheck2.exists ? '✅ ready' : '❌ failed'}`);

  if (cartCheck2.exists && txCheck2.exists && itemsCheck2.exists) {
    console.log('\n✅ SUCCESS! All POS tables created.');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to: https://smart-pos-system-peach.vercel.app/pos');
    console.log('   2. Add products to cart');
    console.log('   3. Complete checkout');
    console.log('\n🎉 POS checkout should now work!\n');
  } else {
    console.log('\n⚠️  Could not create tables automatically.');
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('   Since the production database is not in your Supabase dashboard,');
    console.log('   you need to contact the database owner or use Vercel to run SQL.\n');
    console.log('📄 SQL file ready: lib/create-transactions-table.sql\n');
    console.log('💡 Alternative: Use Vercel CLI to run migrations');
    console.log('   Or ask the person who has access to the Supabase project\n');
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.log('\n📋 MANUAL SETUP REQUIRED:');
  console.log('   File: lib/create-transactions-table.sql');
  console.log('   This SQL needs to be run in the production database\n');
  process.exit(1);
});
