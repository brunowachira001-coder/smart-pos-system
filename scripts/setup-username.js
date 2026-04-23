// Set username for the admin user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupUsername() {
  console.log('\n🔧 Setting up username for admin user...\n');
  
  // Update the admin@pos.com user with username 'admin'
  const { data, error } = await supabase
    .from('users')
    .update({ username: 'admin' })
    .eq('email', 'admin@pos.com')
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Username set successfully!');
    console.log('   Email:', data[0].email);
    console.log('   Username:', data[0].username);
    console.log('   Name:', data[0].full_name);
    console.log('\n📝 You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n✨ You can change both from the Profile page!\n');
  } else {
    console.log('⚠️  No user found with email admin@pos.com');
    console.log('   The user might have a different email now.');
  }
}

setupUsername();
