#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// NEW database credentials - update these!
const NEW_SUPABASE_URL = 'https://xqnteamrznvoqgaazhpu.supabase.co';
const NEW_SUPABASE_KEY = process.argv[2]; // Pass as argument

if (!NEW_SUPABASE_KEY) {
  console.error('❌ Please provide the new Supabase anon key as argument');
  console.log('Usage: node import-to-new-database.js YOUR_NEW_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

console.log('🔄 Importing data to new database...\n');
console.log('📍 Target:', NEW_SUPABASE_URL);

async function importTable(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️  ${tableName}: No data to import`);
    return;
  }
  
  console.log(`📦 Importing ${tableName} (${data.length} records)...`);
  
  const { error } = await supabase.from(tableName).insert(data);
  
  if (error) {
    console.log(`   ❌ ${tableName}: ${error.message}`);
  } else {
    console.log(`   ✅ ${tableName}: ${data.length} records imported`);
  }
}

async function main() {
  // Load exported data
  const exports = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
  
  console.log('📊 Data loaded from export\n');
  
  // Import in order (respecting foreign keys)
  await importTable('shop_settings', exports.shop_settings);
  await importTable('products', exports.products);
  await importTable('customers', exports.customers);
  await importTable('debts', exports.debts);
  await importTable('returns', exports.returns);
  await importTable('expenses', exports.expenses);
  await importTable('users', exports.users);
  // Skip cart_items (temporary data)
  
  console.log('\n✅ Import complete!');
}

main().catch(console.error);
