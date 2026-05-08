#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🔄 Exporting data from old database...\n');
console.log('📍 Source:', process.env.NEXT_PUBLIC_SUPABASE_URL);

async function exportTable(tableName) {
  console.log(`📦 Exporting ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  
  if (error) {
    console.log(`   ⚠️  ${tableName}: ${error.message}`);
    return null;
  }
  
  console.log(`   ✅ ${tableName}: ${data.length} records`);
  return data;
}

async function main() {
  const exports = {};
  
  // Export all tables
  exports.products = await exportTable('products');
  exports.customers = await exportTable('customers');
  exports.debts = await exportTable('debts');
  exports.returns = await exportTable('returns');
  exports.expenses = await exportTable('expenses');
  exports.cart_items = await exportTable('cart_items');
  exports.users = await exportTable('users');
  exports.shop_settings = await exportTable('shop_settings');
  
  // Save to file
  fs.writeFileSync('database-export.json', JSON.stringify(exports, null, 2));
  
  console.log('\n✅ Export complete!');
  console.log('📄 Saved to: database-export.json');
  console.log('\n📊 Summary:');
  Object.keys(exports).forEach(table => {
    if (exports[table]) {
      console.log(`   ${table}: ${exports[table].length} records`);
    }
  });
}

main().catch(console.error);
