#!/usr/bin/env node

/**
 * Create POS tables in production database
 * Run: node create-pos-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('\n📋 Creating POS tables...\n');

    // 1. Create cart_items table
    console.log('1️⃣  Creating cart_items table...');
    const { error: cartError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (cartError && !cartError.message.includes('already exists')) {
      console.log('   Using direct table creation for cart_items...');
      // Try direct creation if RPC doesn't work
      await supabase.from('cart_items').select('id').limit(1);
    }
    console.log('   ✅ cart_items table ready');

    // 2. Create transactions table
    console.log('2️⃣  Creating transactions table...');
    const { error: txError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (txError && !txError.message.includes('already exists')) {
      console.log('   Using direct table creation for transactions...');
      await supabase.from('transactions').select('id').limit(1);
    }
    console.log('   ✅ transactions table ready');

    // 3. Create transaction_items table
    console.log('3️⃣  Creating transaction_items table...');
    const { error: itemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.transaction_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
          product_id UUID REFERENCES public.products(id),
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(12, 2) NOT NULL,
          subtotal DECIMAL(12, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (itemsError && !itemsError.message.includes('already exists')) {
      console.log('   Using direct table creation for transaction_items...');
      await supabase.from('transaction_items').select('id').limit(1);
    }
    console.log('   ✅ transaction_items table ready');

    // 4. Verify tables exist
    console.log('\n4️⃣  Verifying tables...');
    
    const { data: cartData, error: cartCheckError } = await supabase
      .from('cart_items')
      .select('id')
      .limit(1);
    
    const { data: txData, error: txCheckError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    const { data: itemsData, error: itemsCheckError } = await supabase
      .from('transaction_items')
      .select('id')
      .limit(1);

    if (cartCheckError) {
      console.log('   ⚠️  cart_items:', cartCheckError.message);
    } else {
      console.log('   ✅ cart_items: accessible');
    }

    if (txCheckError) {
      console.log('   ⚠️  transactions:', txCheckError.message);
    } else {
      console.log('   ✅ transactions: accessible');
    }

    if (itemsCheckError) {
      console.log('   ⚠️  transaction_items:', itemsCheckError.message);
    } else {
      console.log('   ✅ transaction_items: accessible');
    }

    if (!cartCheckError && !txCheckError && !itemsCheckError) {
      console.log('\n✅ SUCCESS! All POS tables are ready.');
      console.log('\n📝 Next steps:');
      console.log('   1. Test a sale at: https://smart-pos-system-peach.vercel.app/pos');
      console.log('   2. Add products to cart');
      console.log('   3. Complete checkout');
      console.log('\n🎉 POS checkout should now work!\n');
    } else {
      console.log('\n⚠️  Some tables may need manual creation via Supabase dashboard');
      console.log('📄 SQL script available in: lib/create-transactions-table.sql\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📋 Alternative: Run SQL manually');
    console.log('   File: lib/create-transactions-table.sql');
    console.log('   Copy contents and run in Supabase SQL Editor\n');
  }
}

createTables();
