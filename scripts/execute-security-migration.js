#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Routes that MUST remain public
const PUBLIC_ROUTES = [
  'pages/api/auth/login.ts',
  'pages/api/tenant/onboard.ts',
  'pages/api/health.ts',
  'pages/api/health/check.ts',
  'pages/api/health/detailed.ts',
  'pages/api/cron/process-automations.ts',
];

// Debug routes to DELETE
const DEBUG_ROUTES = [
  'pages/api/verify-env.ts',
  'pages/api/debug-profile.ts',
  'pages/api/debug-return-inventory.ts',
  'pages/api/debug-transaction.ts',
  'pages/api/test-apis.ts',
  'pages/api/test-db-connection.ts',
  'pages/api/diagnostic.ts',
  'pages/api/debug/check-env.ts',
  'pages/api/debug/check-db.ts',
  'pages/api/admin/run-migration.ts',
  'pages/api/setup/create-pos-tables.ts',
  'pages/api/auth/create-test-user.ts',
  'pages/api/auth/test-login.ts',
  'pages/api/test.ts',
  'pages/api/debug.ts',
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let changed = false;

  // Skip if already using secureRoute
  if (content.includes('secureRoute')) {
    return { changed: false, type: 'already-secure' };
  }

  // Skip public routes
  if (PUBLIC_ROUTES.includes(filePath)) {
    return { changed: false, type: 'public' };
  }

  // Migrate withAuth routes
  if (content.includes('withAuth')) {
    // Replace imports
    content = content.replace(
      /import\s+{\s*withAuth,\s*AuthenticatedRequest\s*}\s+from\s+['"].*auth-middleware['"]/g,
      "import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route'"
    );
    
    // Replace type
    content = content.replace(/AuthenticatedRequest/g, 'SecureRequest');
    
    // Replace req.auth
    content = content.replace(/req\.auth\.tenantId/g, 'req.tenantId');
    content = content.replace(/req\.auth\.userId/g, 'req.user.userId');
    content = content.replace(/req\.auth\./g, 'req.user.');
    
    // Add db = getAdminDb() after tenantId extraction
    content = content.replace(
      /(const\s+{\s*tenantId\s*}\s*=\s*req;)/g,
      '$1\n  const db = getAdminDb();'
    );
    
    // Replace supabaseAdmin with db
    content = content.replace(/supabaseAdmin/g, 'db');
    
    // Replace export
    content = content.replace(/export\s+default\s+withAuth\(/g, 'export default secureRoute(');
    
    changed = true;
    fs.writeFileSync(filePath, content, 'utf8');
    return { changed, type: 'migrated-withAuth' };
  }

  // Secure unprotected routes
  if (content.includes('export default async function handler') || 
      content.includes('export default function handler')) {
    
    // Calculate relative path depth
    const depth = filePath.split('/').length - 2;
    const relativePath = '../'.repeat(depth) + 'lib/secure-route';
    
    // Add imports at top (after existing imports)
    const importMatch = content.match(/^(import.*\n)+/m);
    if (importMatch) {
      const imports = importMatch[0];
      const newImport = `import { secureRoute, SecureRequest, getAdminDb } from '${relativePath}';\n`;
      content = content.replace(imports, imports + newImport);
    }
    
    // Replace handler signature
    content = content.replace(
      /export\s+default\s+async\s+function\s+handler\s*\(\s*req:\s*NextApiRequest,\s*res:\s*NextApiResponse/g,
      'const handler = secureRoute(async function(req: SecureRequest, res: NextApiResponse'
    );
    
    // Add closing and export
    content = content.replace(/}\s*$/, '});\n\nexport default handler;\n');
    
    // Add tenantId and db extraction at start of handler
    content = content.replace(
      /(const handler = secureRoute\(async function\(req: SecureRequest, res: NextApiResponse[^)]*\)\s*{\s*)/,
      '$1\n  const { tenantId } = req;\n  const db = getAdminDb();\n'
    );
    
    // Replace supabase with db
    content = content.replace(/supabase\./g, 'db.');
    
    // Add tenant filtering to queries (basic pattern)
    // This is a simple heuristic - manual review still needed
    content = content.replace(
      /\.from\(['"](\w+)['"]\)\.select\(/g,
      ".from('$1').select("
    );
    
    changed = true;
    fs.writeFileSync(filePath, content, 'utf8');
    return { changed, type: 'secured-unprotected' };
  }

  return { changed: false, type: 'no-change' };
}

function main() {
  console.log('🔒 EXECUTING SECURITY MIGRATION\n');
  
  const stats = {
    migrated: 0,
    secured: 0,
    skipped: 0,
    deleted: 0,
    errors: 0
  };

  // Delete debug routes
  console.log('🗑️  Deleting debug routes...');
  DEBUG_ROUTES.forEach(route => {
    if (fs.existsSync(route)) {
      fs.unlinkSync(route);
      console.log(`   ✅ Deleted: ${route}`);
      stats.deleted++;
    }
  });
  console.log('');

  // Migrate all routes
  console.log('🔧 Migrating routes...');
  
  function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDir(filePath);
      } else if (file.endsWith('.ts')) {
        try {
          const result = migrateFile(filePath);
          
          if (result.type === 'migrated-withAuth') {
            console.log(`   ✅ Migrated withAuth: ${filePath}`);
            stats.migrated++;
          } else if (result.type === 'secured-unprotected') {
            console.log(`   ✅ Secured: ${filePath}`);
            stats.secured++;
          } else if (result.type === 'already-secure') {
            stats.skipped++;
          } else if (result.type === 'public') {
            console.log(`   ⚪ Skipped (public): ${filePath}`);
            stats.skipped++;
          }
        } catch (err) {
          console.error(`   ❌ Error: ${filePath} - ${err.message}`);
          stats.errors++;
        }
      }
    });
  }

  processDir('pages/api');

  console.log('\n📊 MIGRATION COMPLETE');
  console.log(`   ✅ Migrated withAuth: ${stats.migrated}`);
  console.log(`   ✅ Secured unprotected: ${stats.secured}`);
  console.log(`   🗑️  Deleted debug: ${stats.deleted}`);
  console.log(`   ⚪ Skipped: ${stats.skipped}`);
  console.log(`   ❌ Errors: ${stats.errors}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Manual review required for:');
  console.log('   1. Tenant filtering in ALL queries');
  console.log('   2. TypeScript compilation errors');
  console.log('   3. Business logic correctness');
}

main();
