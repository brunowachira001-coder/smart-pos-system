// Quick database viewer - Run with: node check-database.js [table]
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const table = process.argv[2] || 'products';
const limit = process.argv[3] || 10;

async function viewData() {
  console.log(`\n📊 Viewing ${table} (limit: ${limit})\n`);
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    if (data.length === 0) {
      console.log('No data found');
      return;
    }
    
    console.table(data);
    console.log(`\nTotal records shown: ${data.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewData();
