#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const NEW_SUPABASE_URL = 'https://xqnteamrznvoqgaazhpu.supabase.co';
const NEW_SUPABASE_KEY = process.argv[2];

if (!NEW_SUPABASE_KEY) {
  console.error('❌ Please provide the new Supabase anon key');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

console.log('🔄 Importing data with column mapping...\n');

// Load exported data
const exports = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));

// Map products
async function importProducts() {
  if (!exports.products || exports.products.length === 0) return;
  
  console.log(`📦 Importing products (${exports.products.length} records)...`);
  
  const mapped = exports.products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    category: p.category,
    price: p.retail_price || p.price,
    cost: p.cost_price,
    stock_quantity: p.stock_quantity || p.stock || 0,
    low_stock_threshold: p.minimum_stock_level || 10,
    image_url: p.image_url,
    barcode: p.barcode,
    is_active: p.status === 'active' || p.status === 'Active',
    created_at: p.created_at,
    updated_at: p.updated_at
  }));
  
  const { error } = await supabase.from('products').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} products imported`);
}

// Map customers
async function importCustomers() {
  if (!exports.customers || exports.customers.length === 0) return;
  
  console.log(`📦 Importing customers (${exports.customers.length} records)...`);
  
  const mapped = exports.customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.city ? `${c.address || ''}, ${c.city}`.trim() : c.address,
    debt_limit: c.debt_limit || 0,
    total_purchases: c.total_purchases || 0,
    is_active: c.status === 'active' || c.status === 'Active',
    created_at: c.created_at,
    updated_at: c.updated_at
  }));
  
  const { error } = await supabase.from('customers').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} customers imported`);
}

// Map debts
async function importDebts() {
  if (!exports.debts || exports.debts.length === 0) return;
  
  console.log(`📦 Importing debts (${exports.debts.length} records)...`);
  
  const mapped = exports.debts.map(d => ({
    id: d.id,
    customer_id: d.customer_id,
    customer_name: d.customer_name,
    sale_id: d.sale_id,
    total_amount: d.total_amount,
    amount_paid: d.amount_paid || 0,
    amount_remaining: d.amount_remaining,
    status: d.status,
    due_date: d.due_date,
    notes: d.notes,
    created_at: d.created_at,
    updated_at: d.updated_at
  }));
  
  const { error } = await supabase.from('debts').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} debts imported`);
}

// Map returns
async function importReturns() {
  if (!exports.returns || exports.returns.length === 0) return;
  
  console.log(`📦 Importing returns (${exports.returns.length} records)...`);
  
  const mapped = exports.returns.map(r => ({
    id: r.id,
    return_number: r.return_number,
    transaction_id: r.transaction_id,
    customer_id: r.customer_id,
    customer_name: r.customer_name,
    total_amount: r.amount || r.total_amount,
    reason: r.reason,
    status: r.status,
    processed_by: r.processed_by,
    notes: r.notes,
    created_at: r.created_at,
    processed_at: r.processed_at
  }));
  
  const { error } = await supabase.from('returns').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} returns imported`);
}

// Map expenses
async function importExpenses() {
  if (!exports.expenses || exports.expenses.length === 0) return;
  
  console.log(`📦 Importing expenses (${exports.expenses.length} records)...`);
  
  const mapped = exports.expenses.map(e => ({
    id: e.id,
    category: e.category,
    amount: e.amount,
    description: e.description,
    date: e.date,
    user_id: null, // Skip user_id if it's not a valid UUID
    created_at: e.created_at
  }));
  
  const { error } = await supabase.from('expenses').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} expenses imported`);
}

// Map shop settings
async function importShopSettings() {
  if (!exports.shop_settings || exports.shop_settings.length === 0) return;
  
  console.log(`📦 Importing shop_settings (${exports.shop_settings.length} records)...`);
  
  const mapped = exports.shop_settings.map(s => ({
    id: s.id,
    business_name: s.business_name,
    business_tagline: s.business_tagline,
    business_address: s.business_address,
    business_phone: s.business_phone,
    business_email: s.business_email,
    logo_url: s.logo_url,
    currency: s.currency || 'KES',
    tax_rate: s.tax_rate || 0,
    receipt_footer: s.receipt_footer,
    created_at: s.created_at,
    updated_at: s.updated_at
  }));
  
  const { error } = await supabase.from('shop_settings').insert(mapped);
  if (error) console.log(`   ❌ ${error.message}`);
  else console.log(`   ✅ ${mapped.length} shop_settings imported`);
}

async function main() {
  await importShopSettings();
  await importProducts();
  await importCustomers();
  await importDebts();
  await importReturns();
  await importExpenses();
  
  console.log('\n✅ Migration complete!');
  console.log('\n📊 Summary:');
  console.log(`   Products: ${exports.products?.length || 0}`);
  console.log(`   Customers: ${exports.customers?.length || 0}`);
  console.log(`   Debts: ${exports.debts?.length || 0}`);
  console.log(`   Returns: ${exports.returns?.length || 0}`);
  console.log(`   Expenses: ${exports.expenses?.length || 0}`);
  console.log(`   Shop Settings: ${exports.shop_settings?.length || 0}`);
}

main().catch(console.error);
