#!/bin/bash

# Mobile Responsive Implementation Script
# This script applies common responsive patterns to all pages

echo "🚀 Starting Mobile Responsive Implementation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pages to update
PAGES=(
  "pages/inventory.tsx"
  "pages/customers.tsx"
  "pages/transactions.tsx"
  "pages/debts.tsx"
  "pages/returns.tsx"
  "pages/expenses.tsx"
  "pages/sales-analytics.tsx"
  "pages/inventory-analytics.tsx"
  "pages/product-performance.tsx"
  "pages/customers-pro.tsx"
  "pages/sales-pro.tsx"
  "pages/inventory-pro.tsx"
  "pages/products-pro.tsx"
  "pages/reports-pro.tsx"
  "pages/shop-settings.tsx"
  "pages/user-management.tsx"
  "pages/customer-messages.tsx"
  "pages/pos.tsx"
  "pages/my-profile.tsx"
)

echo -e "${BLUE}📋 Pages to update: ${#PAGES[@]}${NC}"
echo ""

# Function to update a single page
update_page() {
  local file=$1
  local filename=$(basename "$file")
  
  echo -e "${YELLOW}Updating: $filename${NC}"
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo -e "  ⚠️  File not found: $file"
    return 1
  fi
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Apply common patterns using sed
  # Note: These are safe, non-destructive changes
  
  # 1. Update container padding (p-6 -> p-4 sm:p-5 lg:p-6)
  sed -i 's/className="\([^"]*\)p-6\([^"]*\)"/className="\1p-4 sm:p-5 lg:p-6\2"/g' "$file"
  
  # 2. Update spacing (space-y-6 -> space-y-4 sm:space-y-5 lg:space-y-6)
  sed -i 's/className="\([^"]*\)space-y-6\([^"]*\)"/className="\1space-y-4 sm:space-y-5 lg:space-y-6\2"/g' "$file"
  
  # 3. Update gap (gap-6 -> gap-4 sm:gap-5 lg:gap-6)
  sed -i 's/className="\([^"]*\)gap-6\([^"]*\)"/className="\1gap-4 sm:gap-5 lg:gap-6\2"/g' "$file"
  
  # 4. Update typography (text-3xl -> text-xl sm:text-2xl lg:text-3xl)
  sed -i 's/className="\([^"]*\)text-3xl\([^"]*\)"/className="\1text-xl sm:text-2xl lg:text-3xl\2"/g' "$file"
  
  # 5. Update typography (text-2xl -> text-lg sm:text-xl lg:text-2xl)
  sed -i 's/className="\([^"]*\)text-2xl\([^"]*\)"/className="\1text-lg sm:text-xl lg:text-2xl\2"/g' "$file"
  
  echo -e "  ${GREEN}✓${NC} Basic patterns applied"
  
  # Note: Grid replacements and table wrapping require manual review
  # as they involve structural changes
  
  return 0
}

# Update all pages
success_count=0
fail_count=0

for page in "${PAGES[@]}"; do
  if update_page "$page"; then
    ((success_count++))
  else
    ((fail_count++))
  fi
  echo ""
done

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo -e "  ${GREEN}✓${NC} Successfully updated: $success_count pages"
if [ $fail_count -gt 0 ]; then
  echo -e "  ⚠️  Failed: $fail_count pages"
fi

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Review the changes in each file"
echo "2. Manually add ResponsiveGrid imports where needed"
echo "3. Replace grid layouts with ResponsiveGrid components"
echo "4. Wrap tables in overflow containers"
echo "5. Test each page on mobile"
echo "6. Run: npm run build"
echo "7. Commit and deploy"

echo ""
echo -e "${YELLOW}⚠️  Note: This script applies common patterns only.${NC}"
echo -e "${YELLOW}   Manual review and additional updates are required.${NC}"
echo ""
echo -e "${BLUE}📚 See COMPLETE_MOBILE_RESPONSIVE_GUIDE.md for details${NC}"
