// Quick test to verify local connection to production database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (prodError) throw prodError;
    console.log('✅ Products found:', products?.length || 0);
    if (products?.length > 0) {
      console.log('   Sample:', products[0].name);
    }

    // Test 2: Check returns
    const { data: returns, error: retError } = await supabase
      .from('returns')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (retError) throw retError;
    console.log('✅ Returns found:', returns?.length || 0);
    if (returns?.length > 0) {
      console.log('   Latest return:', new Date(returns[0].created_at).toLocaleString());
    }

    // Test 3: Check transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transError) throw transError;
    console.log('✅ Transactions found:', transactions?.length || 0);
    if (transactions?.length > 0) {
      console.log('   Latest transaction:', new Date(transactions[0].created_at).toLocaleString());
    }

    // Test 4: Check expenses
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (expError) throw expError;
    console.log('✅ Expenses found:', expenses?.length || 0);
    if (expenses?.length > 0) {
      console.log('   Latest expense:', new Date(expenses[0].created_at).toLocaleString());
    }

    console.log('\n🎉 SUCCESS! Local environment is connected to production database!');
    console.log('You can now see all your data locally.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
