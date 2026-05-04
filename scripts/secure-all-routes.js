#!/usr/bin/env node
/**
 * SECURITY FIX SCRIPT
 * 
 * This script systematically secures all API routes by:
 * 1. Replacing old withAuth with secureRoute
 * 2. Adding secureRoute to unprotected routes
 * 3. Replacing supabaseAdmin with getAdminDb()
 */

const fs = require('fs');
const path = require('path');

// Routes that should remain public
const PUBLIC_ROUTES = [
  'pages/api/auth/login.ts',
  'pages/api/tenant/onboard.ts',
  'pages/api/health.ts',
  'pages/api/health/check.ts',
  'pages/api/health/detailed.ts',
  'pages/api/cron/process-automations.ts', // Has cron secret auth
];

// Debug routes to delete (not secure)
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
];

function getAllApiRoutes(dir = 'pages/api') {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllApiRoutes(filePath));
    } else if (file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
}

function migrateWithAuthToSecureRoute(content) {
  // Replace imports
  content = content.replace(
    /import\s+{\s*withAuth,\s*AuthenticatedRequest\s*}\s+from\s+['"].*auth-middleware['"]/g,
    "import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route'"
  );
  
  // Replace type usage
  content = content.replace(/AuthenticatedRequest/g, 'SecureRequest');
  
  // Replace req.auth with req
  content = content.replace(/req\.auth\.(tenantId|userId|userRole|userEmail)/g, 'req.user.$1');
  content = content.replace(/req\.auth\.tenantId/g, 'req.tenantId');
  
  // Replace export default withAuth with secureRoute
  content = content.replace(/export\s+default\s+withAuth\(/g, 'export default secureRoute(');
  
  // Replace supabaseAdmin with getAdminDb()
  content = content.replace(/import\s+{\s*supabaseAdmin\s*}\s+from\s+['"].*supabase-client['"]/g, '');
  content = content.replace(/supabaseAdmin/g, 'getAdminDb()');
  
  return content;
}

function addSecureRouteToUnprotected(content, filePath) {
  // Check if already has secureRoute or withAuth
  if (content.includes('secureRoute') || content.includes('withAuth')) {
    return content;
  }
  
  // Check if it's a simple handler export
  if (!content.includes('export default async function handler')) {
    return content;
  }
  
  // Calculate relative path to secure-route
  const depth = filePath.split('/').length - 2; // pages/api = 2
  const relativePath = '../'.repeat(depth) + 'lib/secure-route';
  
  // Add import at top
  const importStatement = `import { secureRoute, SecureRequest, getAdminDb } from '${relativePath}';\n`;
  
  // Replace handler signature
  content = content.replace(
    /export default async function handler\s*\(\s*req:\s*NextApiRequest,\s*res:\s*NextApiResponse/g,
    `${importStatement}\nexport default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse`
  );
  
  // Add closing parenthesis at the end
  content = content.replace(/}\s*$/, '});\n');
  
  // Replace supabase with getAdminDb() where needed
  content = content.replace(/supabase\./g, 'getAdminDb().');
  
  return content;
}

function main() {
  console.log('🔒 Starting security migration...\n');
  
  const allRoutes = getAllApiRoutes();
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  
  allRoutes.forEach(filePath => {
    // Skip public routes
    if (PUBLIC_ROUTES.includes(filePath)) {
      console.log(`⚪ SKIP (public): ${filePath}`);
      skipped++;
      return;
    }
    
    // Skip debug routes (should be deleted manually)
    if (DEBUG_ROUTES.includes(filePath)) {
      console.log(`⚠️  SKIP (debug - delete manually): ${filePath}`);
      skipped++;
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;
      
      // Try migration
      if (content.includes('withAuth')) {
        content = migrateWithAuthToSecureRoute(content);
        console.log(`✅ MIGRATED (withAuth → secureRoute): ${filePath}`);
      } else if (!content.includes('secureRoute') && content.includes('export default')) {
        content = addSecureRouteToUnprotected(content, filePath);
        if (content !== original) {
          console.log(`✅ SECURED (added secureRoute): ${filePath}`);
        } else {
          console.log(`⚪ SKIP (complex structure): ${filePath}`);
          skipped++;
          return;
        }
      } else {
        console.log(`⚪ SKIP (already secure): ${filePath}`);
        skipped++;
        return;
      }
      
      // Write back
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        migrated++;
      }
    } catch (err) {
      console.error(`❌ ERROR: ${filePath} - ${err.message}`);
      errors++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⚪ Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n🔒 Security migration complete!`);
}

main();
