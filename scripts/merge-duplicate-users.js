// Script to merge or delete duplicate user accounts
// Run this to clean up duplicate users before changing email

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAllUsers() {
  console.log('\n📋 Listing all users in database:\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found in database.');
    return;
  }

  users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log('');
  });

  return users;
}

async function deleteUserByEmail(email) {
  console.log(`\n🗑️  Deleting user with email: ${email}\n`);
  
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('email', email)
    .select();

  if (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }

  console.log('✅ User deleted successfully:', data);
  return true;
}

async function main() {
  console.log('🔧 User Management Script\n');
  console.log('This script helps you manage duplicate users in your database.\n');

  const users = await listAllUsers();

  if (!users || users.length === 0) {
    return;
  }

  console.log('\n📝 Instructions:');
  console.log('1. Identify which user you want to KEEP (usually the one with admin@pos.com)');
  console.log('2. Delete the duplicate user with the email you want to use');
  console.log('3. Then update your profile to use that email\n');

  // Example: To delete a specific user, uncomment and modify this line:
  // await deleteUserByEmail('your-email@example.com');
  
  console.log('\n💡 To delete a user, edit this script and uncomment the deleteUserByEmail line');
  console.log('   with the email of the user you want to remove.\n');
}

main();
