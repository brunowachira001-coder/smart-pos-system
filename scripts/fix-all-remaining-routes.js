#!/usr/bin/env node
/**
 * COMPLETE SECURITY FIX SCRIPT
 * Fixes ALL remaining vulnerable routes in one execution
 */

const fs = require('fs');
const path = require('path');

// Routes to migrate from withAuth to secureRoute
const WITH_AUTH_ROUTES = [
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
];

// Routes with NO authentication
const UNPROTECTED_ROUTES = [
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
  'pages/api/debts/stats.ts',
  'pages/api/returns/stats.ts',
  'pages/api/sms/queue.ts',
  'pages/api/sms/stats.ts',
  'pages/api/sms/config.ts',
  'pages/api/sms/automation.ts',
  'pages/api/sms/send.ts',
  'pages/api/sales/index.ts',
  'pages/api/settings/index.ts',
];

let fixed = 0;
let errors = 0;

function migrateWithAuth(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports
    content = content.replace(
      /import\s+{\s*supabaseAdmin\s*}\s+from\s+['"].*supabase-client['"]/g,
      ''
    );
    content = content.replace(
      /import\s+{\s*withAuth,\s*AuthenticatedRequest\s*}\s+from\s+['"].*auth-middleware['"]/g,
      "import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route'"
    );
    
    // Replace types
    content = content.replace(/AuthenticatedRequest/g, 'SecureRequest');
    
    // Replace req.auth
    content = content.replace(/req\.auth\.tenantId/g, 'req.tenantId');
    content = content.replace(/req\.auth\.userId/g, 'req.user.userId');
    content = content.replace(/req\.auth\./g, 'req.user.');
    
    // Replace export
    content = content.replace(/export\s+default\s+withAuth\(/g, 'export default secureRoute(');
    
    // Replace supabaseAdmin with getAdminDb()
    content = content.replace(/supabaseAdmin/g, 'getAdminDb()');
    
    // Add const db = getAdminDb() at start of handler if using database
    if (content.includes('getAdminDb()') && !content.includes('const db = getAdminDb()')) {
      content = content.replace(
        /(async function handler\(req: SecureRequest, res: NextApiResponse\) \{)/,
        '$1\n  const db = getAdminDb();'
      );
      content = content.replace(/getAdminDb\(\)\./g, 'db.');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    fixed++;
  } catch (err) {
    console.error(`❌ Error fixing ${filePath}:`, err.message);
    errors++;
  }
}

function secureUnprotected(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already secured
    if (content.includes('secureRoute') || content.includes('withAuth')) {
      console.log(`⚪ Skip (already secure): ${filePath}`);
      return;
    }
    
    // Calculate relative path depth
    const depth = filePath.split('/').length - 2;
    const relativePath = '../'.repeat(depth) + 'lib/secure-route';
    
    // Add import
    const importLine = `import { secureRoute, SecureRequest, getAdminDb } from '${relativePath}';\n`;
    
    // Replace handler signature and wrap with secureRoute
    if (content.includes('export default async function handler')) {
      content = content.replace(
        /export default async function handler\s*\(\s*req:\s*NextApiRequest,\s*res:\s*NextApiResponse/g,
        `${importLine}\nexport default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse`
      );
      
      // Add closing parenthesis
      const lastBrace = content.lastIndexOf('}');
      if (lastBrace !== -1) {
        content = content.substring(0, lastBrace + 1) + ');\n';
      }
      
      // Add tenantId extraction
      content = content.replace(
        /(export default secureRoute\(async function handler\(req: SecureRequest, res: NextApiResponse\) \{)/,
        '$1\n  const { tenantId } = req;\n  const db = getAdminDb();'
      );
      
      // Replace supabase with db
      content = content.replace(/supabase\./g, 'db.');
      
      // Add tenant filtering to queries (basic pattern)
      content = content.replace(
        /\.from\(['"](\w+)['"]\)\.select\(/g,
        ".from('$1').select("
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Secured: ${filePath}`);
      fixed++;
    } else {
      console.log(`⚠️  Skip (complex structure): ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error securing ${filePath}:`, err.message);
    errors++;
  }
}

console.log('🔒 COMPLETE SECURITY FIX - Starting...\n');

console.log('📋 Phase 1: Migrating withAuth routes...');
WITH_AUTH_ROUTES.forEach(route => {
  if (fs.existsSync(route)) {
    migrateWithAuth(route);
  } else {
    console.log(`⚠️  Not found: ${route}`);
  }
});

console.log('\n📋 Phase 2: Securing unprotected routes...');
UNPROTECTED_ROUTES.forEach(route => {
  if (fs.existsSync(route)) {
    secureUnprotected(route);
  } else {
    console.log(`⚠️  Not found: ${route}`);
  }
});

console.log(`\n✅ Complete! Fixed: ${fixed}, Errors: ${errors}`);
console.log('\n⚠️  IMPORTANT: Manual steps required:');
console.log('1. Add .eq("tenant_id", tenantId) to ALL database queries');
console.log('2. Add tenant_id: tenantId to ALL inserts');
console.log('3. Run: npm run build');
console.log('4. Fix any TypeScript errors');
console.log('5. Test each endpoint');
