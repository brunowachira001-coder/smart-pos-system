// Check debts table structure in production database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDebts() {
  console.log('\n📊 Checking Debts Table Structure\n');
  
  try {
    // Try to fetch debts
    const { data: debts, error } = await supabase
      .from('debts')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching debts:', error.message);
      console.log('\nTrying to check if table exists...');
      
      // Check if table exists
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%debt%');
      
      if (tableError) {
        console.error('Cannot check tables:', tableError.message);
      } else {
        console.log('Tables with "debt" in name:', tables);
      }
      return;
    }
    
    if (!debts || debts.length === 0) {
      console.log('⚠️  Debts table exists but is empty');
      console.log('\nLet me check the table structure...');
      
      // Get one row to see structure
      const { data: sample, error: sampleError } = await supabase
        .from('debts')
        .select('*')
        .limit(1);
      
      console.log('Sample query result:', sample);
      return;
    }
    
    console.log(`✅ Found ${debts.length} debts\n`);
    console.log('Table Structure (columns):');
    console.log(Object.keys(debts[0]));
    console.log('\nSample Data:');
    console.table(debts);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkDebts();
