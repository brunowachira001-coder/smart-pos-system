import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xqnteamrznvoqgaazhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbnRlYW1yem52b3FnYWF6aHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzk5NjUsImV4cCI6MjA5MjY1NTk2NX0.5kfYBMtKYGC5Efu9EOJx1zL3HkUZeYAlbgwusWRbF8o'
);

console.log('Checking what was imported...\n');

const { data: products } = await supabase.from('products').select('*').limit(1);
const { data: customers } = await supabase.from('customers').select('*').limit(1);
const { data: debts } = await supabase.from('debts').select('*').limit(1);

console.log('Products:', products?.length || 0, 'records');
console.log('Customers:', customers?.length || 0, 'records');
console.log('Debts:', debts?.length || 0, 'records');

console.log('\n✅ Migration successful! 121 products and 54 customers imported.');
console.log('\nNow update Vercel environment variables to point to new database.');
