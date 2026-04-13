#!/bin/bash

# Smart POS System - Vercel + Supabase Deployment Commands
# Run these commands in your terminal after setting up Supabase and Upstash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║         SMART POS SYSTEM - VERCEL DEPLOYMENT COMMANDS                     ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Generate Secrets
echo "📝 STEP 1: Generate Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run these commands and save the output:"
echo ""
echo "1. Generate JWT_SECRET:"
echo "   openssl rand -base64 32"
echo ""
echo "2. Generate JWT_REFRESH_SECRET:"
echo "   openssl rand -base64 32"
echo ""
echo "3. Generate ENCRYPTION_KEY:"
echo "   openssl rand -hex 16"
echo ""
echo "Save all three values - you'll need them in Vercel!"
echo ""

# Step 2: Initialize Git (if needed)
echo "📝 STEP 2: Push Code to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run these commands:"
echo ""
echo "git add ."
echo "git commit -m 'Initial Smart POS System commit'"
echo "git push origin main"
echo ""

# Step 3: Install Vercel CLI
echo "📝 STEP 3: Install Vercel CLI (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "npm install -g vercel"
echo ""

# Step 4: Run Migrations
echo "📝 STEP 4: Run Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After Vercel deployment completes, run:"
echo ""
echo "export DATABASE_URL='your_supabase_connection_string'"
echo "export REDIS_URL='your_upstash_redis_url'"
echo ""
echo "npx prisma migrate deploy --skip-generate"
echo "npx prisma db seed"
echo ""

# Step 5: Verify Deployment
echo "📝 STEP 5: Verify Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test health endpoint:"
echo ""
echo "curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/health"
echo ""
echo "Expected response:"
echo '{\"success\": true, \"status\": \"healthy\"}'
echo ""

# Step 6: Test Login
echo "📝 STEP 6: Test Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test login endpoint:"
echo ""
echo "curl -X POST https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
echo ""
echo "Expected response:"
echo '{\"success\": true, \"data\": {...}}'
echo ""

# Step 7: Access Application
echo "📝 STEP 7: Access Application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Open in browser:"
echo ""
echo "https://YOUR_VERCEL_DOMAIN.vercel.app"
echo ""
echo "Login with:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                    ✅ DEPLOYMENT READY!                                   ║"
echo "║                                                                            ║"
echo "║              Follow the steps above to deploy your system                 ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 For detailed instructions, read: VERCEL_SUPABASE_DEPLOYMENT.md"
echo ""
