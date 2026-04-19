require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'loaded' : 'missing');
console.log('Service Role Key:', supabaseKey ? 'loaded' : 'missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearUsers() {
  try {
    console.log('Clearing users table...');
    
    const { data, error } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) {
      console.error('Error deleting users:', error);
      process.exit(1);
    }
    
    console.log('✓ All users cleared successfully');
    console.log('You can now add your own users in the User Management page');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

clearUsers();
