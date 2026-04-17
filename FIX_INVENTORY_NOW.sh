#!/bin/bash

# Fix Inventory Page - Clear Cache and Restart

echo "🔧 Fixing Inventory Page..."
echo ""

# Step 1: Stop any running dev server
echo "1️⃣ Stopping dev server..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Step 2: Clear Next.js cache
echo "2️⃣ Clearing Next.js cache..."
rm -rf .next
echo "   ✅ .next directory removed"

# Step 3: Verify files exist
echo ""
echo "3️⃣ Verifying files..."
if [ -f "pages/inventory.tsx" ]; then
    SIZE=$(stat -f%z "pages/inventory.tsx" 2>/dev/null || stat -c%s "pages/inventory.tsx" 2>/dev/null)
    echo "   ✅ pages/inventory.tsx exists ($SIZE bytes)"
else
    echo "   ❌ pages/inventory.tsx NOT FOUND!"
    exit 1
fi

if [ -f "pages/api/inventory/list.ts" ]; then
    echo "   ✅ pages/api/inventory/list.ts exists"
else
    echo "   ❌ pages/api/inventory/list.ts NOT FOUND!"
    exit 1
fi

if [ -f "pages/api/inventory/index.ts" ]; then
    echo "   ✅ pages/api/inventory/index.ts exists"
else
    echo "   ❌ pages/api/inventory/index.ts NOT FOUND!"
    exit 1
fi

# Step 4: Start dev server
echo ""
echo "4️⃣ Starting dev server..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Run this command to start the server:"
echo ""
echo "npm run dev"
echo ""
echo "Then:"
echo "1. Open http://localhost:3000/inventory"
echo "2. Press Ctrl + Shift + R to hard refresh"
echo "3. You should see the new inventory page!"
echo "═══════════════════════════════════════════════════════════"
echo ""
