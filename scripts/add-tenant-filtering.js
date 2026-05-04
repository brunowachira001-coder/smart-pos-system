#!/usr/bin/env node
/**
 * ADD TENANT FILTERING TO ALL QUERIES
 * Adds .eq('tenant_id', tenantId) to database queries
 */

const fs = require('fs');
const path = require('path');

const ALL_ROUTES = [
  'pages/api/dashboard/comprehensive-stats.ts',
  'pages/api/returns/index.ts',
  'pages/api/products/list.ts',
  'pages/api/inventory/index.ts',
  'pages/api/customers/index.ts',
  'pages/api/customers/list.ts',
  'pages/api/sales-analytics/overview.ts',
  'pages/api/transactions/list.ts',
  'pages/api/debts/index.ts',
  'pages/api/expenses/index.ts',
  'pages/api/pos/cart.ts',
  'pages/api/products/search.ts',
  'pages/api/inventory/adjust.ts',
  'pages/api/inventory/restock.ts',
  'pages/api/inventory/list.ts',
  'pages/api/customers/credit.ts',
  'pages/api/transactions/[id].ts',
  'pages/api/returns/[id]/process.ts',
  'pages/api/returns/reasons.ts',
  'pages/api/expenses/categories.ts',
  'pages/api/expenses/stats.ts',
  'pages/api/expenses/[id]/approve.ts',
  'pages/api/debts/[id]/payment.ts',
  'pages/api/sms/queue.ts',
  'pages/api/sms/stats.ts',
  'pages/api/sms/config.ts',
  'pages/api/sms/automation.ts',
  'pages/api/sms/send.ts',
  'pages/api/sales/index.ts',
  'pages/api/settings/index.ts',
];

let fixed = 0;

function addTenantFiltering(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: .select() without tenant_id filter
    // Match: .from('table').select(...) NOT followed by .eq('tenant_id'
    const selectPattern = /\.from\(['"](\w+)['"]\)\.select\([^)]*\)(?!\s*\.eq\(['"]tenant_id['"])/g;
    
    content = content.replace(selectPattern, (match) => {
      // Don't add if it's already in a chain that has tenant_id
      if (match.includes('tenant_id')) return match;
      modified = true;
      return match + `.eq('tenant_id', tenantId)`;
    });
    
    // Pattern 2: .insert() without tenant_id in data
    // This is more complex, we'll add a comment for manual review
    if (content.includes('.insert(') && !content.includes('tenant_id: tenantId')) {
      const insertPattern = /\.insert\(\[?\{([^}]+)\}\]?\)/g;
      content = content.replace(insertPattern, (match, fields) => {
        if (fields.includes('tenant_id')) return match;
        modified = true;
        // Add tenant_id to the object
        return match.replace('{', '{ tenant_id: tenantId, ');
      });
    }
    
    // Pattern 3: .update() without tenant_id filter
    const updatePattern = /\.update\([^)]+\)\.eq\(['"]id['"],\s*\w+\)(?!\s*\.eq\(['"]tenant_id['"])/g;
    content = content.replace(updatePattern, (match) => {
      modified = true;
      return match + `.eq('tenant_id', tenantId)`;
    });
    
    // Pattern 4: .delete() without tenant_id filter
    const deletePattern = /\.delete\(\)\.eq\(['"]id['"],\s*\w+\)(?!\s*\.eq\(['"]tenant_id['"])/g;
    content = content.replace(deletePattern, (match) => {
      modified = true;
      return match + `.eq('tenant_id', tenantId)`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added tenant filtering: ${filePath}`);
      fixed++;
    } else {
      console.log(`⚪ No changes needed: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error: ${filePath}:`, err.message);
  }
}

console.log('🔒 Adding tenant filtering to all routes...\n');

ALL_ROUTES.forEach(route => {
  if (fs.existsSync(route)) {
    addTenantFiltering(route);
  }
});

console.log(`\n✅ Complete! Modified: ${fixed} files`);
console.log('\n⚠️  MANUAL REVIEW REQUIRED:');
console.log('Some queries may need manual tenant_id filtering.');
console.log('Search for patterns like:');
console.log('  - .from().select() without .eq("tenant_id", tenantId)');
console.log('  - .insert() without tenant_id: tenantId');
console.log('  - .update().eq("id") without .eq("tenant_id", tenantId)');
console.log('  - .delete().eq("id") without .eq("tenant_id", tenantId)');
