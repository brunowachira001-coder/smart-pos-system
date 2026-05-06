#!/usr/bin/env node

/**
 * Tenant Isolation Validation Script
 * 
 * This script checks all API routes to ensure they properly use tenant isolation.
 * Run this before deploying to catch any routes that might cause data leakage.
 * 
 * Usage: node scripts/validate-tenant-isolation.js
 */

const fs = require('fs');
const path = require('path');

// Tables that MUST have tenant isolation
const TENANT_TABLES = [
  'cart_items',
  'transactions',
  'transaction_items',
  'products',
  'customers',
  'debts',
  'expenses',
  'returns',
  'users',
  'shop_settings',
  'sms_templates',
  'sms_logs',
  'sms_queue',
  'sms_automation_rules'
];

// Routes that are exempt from tenant isolation (admin, auth, etc.)
const EXEMPT_ROUTES = [
  'pages/api/auth/',
  'pages/api/admin/',
  'pages/api/tenant/',
  'pages/api/diagnostic.ts',
  'pages/api/test-',
  'pages/api/debug',
  'pages/api/setup/'
];

const issues = [];
let filesChecked = 0;
let routesWithIssues = 0;

function isExemptRoute(filePath) {
  return EXEMPT_ROUTES.some(exempt => filePath.includes(exempt));
}

function checkFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (isExemptRoute(filePath)) return;
  
  filesChecked++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check if file uses secureRoute
  const usesSecureRoute = content.includes('secureRoute') || content.includes('SecureRequest');
  
  // Check if file queries tenant tables
  const queriesTenantTables = TENANT_TABLES.some(table => 
    content.includes(`from('${table}')`) || content.includes(`from("${table}")`)
  );
  
  if (queriesTenantTables && !usesSecureRoute) {
    routesWithIssues++;
    issues.push({
      file: relativePath,
      severity: 'HIGH',
      issue: 'Queries tenant tables without using secureRoute middleware',
      tables: TENANT_TABLES.filter(table => 
        content.includes(`from('${table}')`) || content.includes(`from("${table}")`)
      )
    });
  }
  
  // Check for direct supabase client usage (should use getAdminDb instead)
  if (queriesTenantTables && content.includes('supabase.from(') && !content.includes('getAdminDb')) {
    issues.push({
      file: relativePath,
      severity: 'HIGH',
      issue: 'Uses direct supabase client instead of getAdminDb() for tenant tables',
      recommendation: 'Replace supabase.from() with db.from() where db = getAdminDb()'
    });
  }
  
  // Check for missing tenant_id filters
  if (usesSecureRoute && queriesTenantTables) {
    TENANT_TABLES.forEach(table => {
      const tableRegex = new RegExp(`from\\(['"]${table}['"]\\)`, 'g');
      const matches = content.match(tableRegex);
      
      if (matches) {
        // Check if tenant_id is used in the same context
        const hasSelect = content.includes(`.select(`) && content.includes(`from('${table}')`);
        const hasInsert = content.includes(`.insert(`) && content.includes(`from('${table}')`);
        const hasUpdate = content.includes(`.update(`) && content.includes(`from('${table}')`);
        const hasDelete = content.includes(`.delete(`) && content.includes(`from('${table}')`);
        
        if ((hasSelect || hasUpdate || hasDelete) && !content.includes('.eq(\'tenant_id\'')) {
          issues.push({
            file: relativePath,
            severity: 'MEDIUM',
            issue: `Queries ${table} but may be missing .eq('tenant_id', tenantId) filter`,
            recommendation: 'Verify all queries include tenant_id filtering'
          });
        }
        
        if (hasInsert && !content.includes('tenant_id:')) {
          issues.push({
            file: relativePath,
            severity: 'MEDIUM',
            issue: `Inserts into ${table} but may be missing tenant_id field`,
            recommendation: 'Verify all inserts include tenant_id field'
          });
        }
      }
    });
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else {
      checkFile(filePath);
    }
  });
}

console.log('🔍 Validating Tenant Isolation...\n');
console.log('Checking API routes for proper tenant isolation...\n');

// Scan pages/api directory
const apiDir = path.join(process.cwd(), 'pages', 'api');
if (fs.existsSync(apiDir)) {
  scanDirectory(apiDir);
}

// Print results
console.log('═══════════════════════════════════════════════════════════');
console.log(`📊 VALIDATION SUMMARY`);
console.log('═══════════════════════════════════════════════════════════');
console.log(`Files checked: ${filesChecked}`);
console.log(`Routes with issues: ${routesWithIssues}`);
console.log(`Total issues found: ${issues.length}\n`);

if (issues.length === 0) {
  console.log('✅ All API routes properly implement tenant isolation!\n');
  process.exit(0);
} else {
  console.log('⚠️  Issues found:\n');
  
  // Group by severity
  const highSeverity = issues.filter(i => i.severity === 'HIGH');
  const mediumSeverity = issues.filter(i => i.severity === 'MEDIUM');
  
  if (highSeverity.length > 0) {
    console.log('🔴 HIGH SEVERITY ISSUES (Must fix before deployment):');
    console.log('─────────────────────────────────────────────────────────\n');
    highSeverity.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.file}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.tables) console.log(`   Tables: ${issue.tables.join(', ')}`);
      if (issue.recommendation) console.log(`   Fix: ${issue.recommendation}`);
      console.log('');
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('🟡 MEDIUM SEVERITY ISSUES (Review recommended):');
    console.log('─────────────────────────────────────────────────────────\n');
    mediumSeverity.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.file}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.recommendation) console.log(`   Fix: ${issue.recommendation}`);
      console.log('');
    });
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('💡 RECOMMENDATIONS:');
  console.log('1. All routes querying tenant tables must use secureRoute middleware');
  console.log('2. Use getAdminDb() instead of direct supabase client');
  console.log('3. Always filter by tenant_id in SELECT, UPDATE, DELETE queries');
  console.log('4. Always include tenant_id field in INSERT operations');
  console.log('5. Run this script before every deployment\n');
  
  process.exit(highSeverity.length > 0 ? 1 : 0);
}
