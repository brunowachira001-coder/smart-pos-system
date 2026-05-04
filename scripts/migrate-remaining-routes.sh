#!/bin/bash

# Security Migration Script
# Migrates remaining routes to use secureRoute

echo "🔒 Starting security migration for remaining routes..."
echo ""

# List of routes to migrate (withAuth → secureRoute)
WITHAUTH_ROUTES=(
  "pages/api/dashboard/comprehensive-stats.ts"
  "pages/api/returns/index.ts"
  "pages/api/products/list.ts"
  "pages/api/inventory/index.ts"
  "pages/api/customers/index.ts"
  "pages/api/customers/list.ts"
  "pages/api/sales-analytics/overview.ts"
  "pages/api/transactions/list.ts"
  "pages/api/debts/index.ts"
  "pages/api/expenses/index.ts"
)

# List of unprotected routes to secure
UNPROTECTED_ROUTES=(
  "pages/api/pos/cart.ts"
  "pages/api/products/search.ts"
  "pages/api/inventory/adjust.ts"
  "pages/api/inventory/restock.ts"
  "pages/api/inventory/list.ts"
  "pages/api/customers/credit.ts"
  "pages/api/transactions/[id].ts"
  "pages/api/returns/[id]/process.ts"
  "pages/api/returns/reasons.ts"
  "pages/api/expenses/categories.ts"
  "pages/api/expenses/stats.ts"
  "pages/api/expenses/[id]/approve.ts"
  "pages/api/debts/[id]/payment.ts"
  "pages/api/sms/queue.ts"
  "pages/api/sms/stats.ts"
  "pages/api/sms/config.ts"
  "pages/api/sms/automation.ts"
  "pages/api/sms/send.ts"
  "pages/api/sales/index.ts"
  "pages/api/settings/index.ts"
)

echo "📋 Migration Plan:"
echo "  - withAuth routes: ${#WITHAUTH_ROUTES[@]}"
echo "  - Unprotected routes: ${#UNPROTECTED_ROUTES[@]}"
echo "  - Total: $((${#WITHAUTH_ROUTES[@]} + ${#UNPROTECTED_ROUTES[@]}))"
echo ""

# Function to migrate withAuth route
migrate_withauth() {
  local file=$1
  echo "  🔄 Migrating: $file"
  
  # Backup
  cp "$file" "$file.backup"
  
  # Replace imports
  sed -i.tmp 's/import { withAuth, AuthenticatedRequest }/import { secureRoute, SecureRequest, getAdminDb }/g' "$file"
  sed -i.tmp 's/from.*auth-middleware/from "..\/..\/..\/lib\/secure-route"/g' "$file"
  
  # Replace types
  sed -i.tmp 's/AuthenticatedRequest/SecureRequest/g' "$file"
  
  # Replace req.auth
  sed -i.tmp 's/req\.auth\.tenantId/req.tenantId/g' "$file"
  sed -i.tmp 's/req\.auth\.userId/req.user.userId/g' "$file"
  sed -i.tmp 's/req\.auth\.userRole/req.user.role/g' "$file"
  sed -i.tmp 's/req\.auth\.userEmail/req.user.email/g' "$file"
  
  # Replace export
  sed -i.tmp 's/export default withAuth(/export default secureRoute(/g' "$file"
  
  # Replace supabaseAdmin
  sed -i.tmp 's/supabaseAdmin/getAdminDb()/g' "$file"
  
  # Clean up temp files
  rm -f "$file.tmp"
  
  echo "    ✅ Done"
}

# Migrate withAuth routes
echo "🔧 Migrating withAuth routes..."
for route in "${WITHAUTH_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    migrate_withauth "$route"
  else
    echo "  ⚠️  Not found: $route"
  fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "⚠️  IMPORTANT: Manual steps required:"
echo "  1. Review each migrated file for correctness"
echo "  2. Add tenant_id filtering to ALL database queries"
echo "  3. Test each endpoint with authentication"
echo "  4. Run: npm run build (check for TypeScript errors)"
echo "  5. Delete backup files: find pages/api -name '*.backup' -delete"
echo ""
echo "📝 Unprotected routes still need manual migration:"
for route in "${UNPROTECTED_ROUTES[@]}"; do
  echo "  - $route"
done
echo ""
echo "🔍 Next: Run security validation tests"
