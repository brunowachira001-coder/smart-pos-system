// Set username for the current user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupCurrentUser() {
  console.log('\n🔧 Setting up username for current user...\n');
  
  // Update the brunowachira001@gmail.com user with username 'admin'
  const { data, error } = await supabase
    .from('users')
    .update({ username: 'admin' })
    .eq('email', 'brunowachira001@gmail.com')
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
    console.log('   Password: admin123 (default)');
    console.log('\n✨ Go to Profile page to change your username and password!\n');
  } else {
    console.log('⚠️  No user found');
  }
}

setupCurrentUser();
