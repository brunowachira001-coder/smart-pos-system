#!/usr/bin/env node

/**
 * SnatchFit Boutique - Credentials Setup Script
 * 
 * This script will guide you through collecting all credentials
 * and create a .env.local file automatically
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateKey = (key) => {
  return key && key.length > 10;
};

async function main() {
  console.log('\n================================================================================');
  console.log('  SnatchFit Boutique - Credentials Setup');
  console.log('================================================================================\n');

  const credentials = {};

  try {
    // Supabase Credentials
    console.log('📦 SUPABASE CREDENTIALS');
    console.log('Get these from: https://supabase.com/dashboard → Settings → API\n');

    let supabaseUrl = '';
    while (!validateUrl(supabaseUrl)) {
      supabaseUrl = await question('Enter NEXT_PUBLIC_SUPABASE_URL (https://xxxxx.supabase.co): ');
      if (!validateUrl(supabaseUrl)) {
        console.log('❌ Invalid URL. Please enter a valid URL starting with https://\n');
      }
    }
    credentials.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;

    let anonKey = '';
    while (!validateKey(anonKey)) {
      anonKey = await question('Enter NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJ...): ');
      if (!validateKey(anonKey)) {
        console.log('❌ Invalid key. Please enter a valid key.\n');
      }
    }
    credentials.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;

    let serviceRoleKey = '';
    while (!validateKey(serviceRoleKey)) {
      serviceRoleKey = await question('Enter SUPABASE_SERVICE_ROLE_KEY (eyJ...): ');
      if (!validateKey(serviceRoleKey)) {
        console.log('❌ Invalid key. Please enter a valid key.\n');
      }
    }
    credentials.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;

    // Stripe Credentials
    console.log('\n💳 STRIPE CREDENTIALS');
    console.log('Get these from: https://dashboard.stripe.com → Developers → API keys\n');

    let stripePublishable = '';
    while (!validateKey(stripePublishable)) {
      stripePublishable = await question('Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...): ');
      if (!validateKey(stripePublishable)) {
        console.log('❌ Invalid key. Please enter a valid key.\n');
      }
    }
    credentials.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripePublishable;

    let stripeSecret = '';
    while (!validateKey(stripeSecret)) {
      stripeSecret = await question('Enter STRIPE_SECRET_KEY (sk_test_...): ');
      if (!validateKey(stripeSecret)) {
        console.log('❌ Invalid key. Please enter a valid key.\n');
      }
    }
    credentials.STRIPE_SECRET_KEY = stripeSecret;

    // JWT Secret
    console.log('\n🔐 GENERATED SECRETS');
    console.log('Generate these using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');

    let jwtSecret = '';
    while (!validateKey(jwtSecret) || jwtSecret.length < 32) {
      jwtSecret = await question('Enter JWT_SECRET (min 32 chars): ');
      if (!validateKey(jwtSecret) || jwtSecret.length < 32) {
        console.log('❌ Invalid secret. Must be at least 32 characters.\n');
      }
    }
    credentials.JWT_SECRET = jwtSecret;

    let nextAuthSecret = '';
    while (!validateKey(nextAuthSecret) || nextAuthSecret.length < 32) {
      nextAuthSecret = await question('Enter NEXTAUTH_SECRET (min 32 chars): ');
      if (!validateKey(nextAuthSecret) || nextAuthSecret.length < 32) {
        console.log('❌ Invalid secret. Must be at least 32 characters.\n');
      }
    }
    credentials.NEXTAUTH_SECRET = nextAuthSecret;

    // URLs
    console.log('\n🌐 APPLICATION URLS');
    console.log('These will be your Vercel domain (e.g., https://snatchfit-boutique.vercel.app)\n');

    let appUrl = '';
    while (!validateUrl(appUrl)) {
      appUrl = await question('Enter NEXTAUTH_URL (https://your-domain.vercel.app): ');
      if (!validateUrl(appUrl)) {
        console.log('❌ Invalid URL. Please enter a valid URL starting with https://\n');
      }
    }
    credentials.NEXTAUTH_URL = appUrl;
    credentials.NEXT_PUBLIC_APP_URL = appUrl;

    // Admin Credentials
    console.log('\n👤 ADMIN CREDENTIALS\n');

    const adminEmail = await question('Enter NEXT_PUBLIC_ADMIN_EMAIL (admin@snatchfit.com): ');
    credentials.NEXT_PUBLIC_ADMIN_EMAIL = adminEmail || 'admin@snatchfit.com';

    const adminPassword = await question('Enter NEXT_PUBLIC_ADMIN_PASSWORD (strong password): ');
    credentials.NEXT_PUBLIC_ADMIN_PASSWORD = adminPassword || 'ChangeMe123!';

    // Environment
    credentials.NODE_ENV = 'production';

    // Display Summary
    console.log('\n================================================================================');
    console.log('  CREDENTIALS SUMMARY');
    console.log('================================================================================\n');

    console.log('✅ Supabase:');
    console.log(`   URL: ${credentials.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Anon Key: ${credentials.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`);
    console.log(`   Service Role: ${credentials.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

    console.log('✅ Stripe:');
    console.log(`   Publishable: ${credentials.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...`);
    console.log(`   Secret: ${credentials.STRIPE_SECRET_KEY.substring(0, 20)}...\n`);

    console.log('✅ Secrets:');
    console.log(`   JWT: ${credentials.JWT_SECRET.substring(0, 20)}...`);
    console.log(`   NextAuth: ${credentials.NEXTAUTH_SECRET.substring(0, 20)}...\n`);

    console.log('✅ URLs:');
    console.log(`   App URL: ${credentials.NEXTAUTH_URL}\n`);

    console.log('✅ Admin:');
    console.log(`   Email: ${credentials.NEXT_PUBLIC_ADMIN_EMAIL}`);
    console.log(`   Password: ${credentials.NEXT_PUBLIC_ADMIN_PASSWORD}\n`);

    // Confirm
    const confirm = await question('Save these credentials to .env.local? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Cancelled. No file created.\n');
      rl.close();
      process.exit(0);
    }

    // Create .env.local
    const envContent = Object.entries(credentials)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const envPath = path.join(__dirname, '.env.local');

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ SUCCESS!');
    console.log(`📝 Credentials saved to: ${envPath}\n`);

    console.log('📋 Next Steps:');
    console.log('1. Add these same credentials to Vercel:');
    console.log('   - Go to https://vercel.com/dashboard');
    console.log('   - Select your project');
    console.log('   - Settings → Environment Variables');
    console.log('   - Add each variable\n');

    console.log('2. Deploy to Vercel:');
    console.log('   - Push code to GitHub');
    console.log('   - Import to Vercel');
    console.log('   - Deploy\n');

    console.log('3. Test your site:');
    console.log('   - Visit your Vercel URL');
    console.log('   - Test all features\n');

    console.log('================================================================================\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
