// Delete the old brunowachira001@gmail.com user so you can use that email
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteOldUser() {
  console.log('\n🗑️  Deleting old user: brunowachira001@gmail.com\n');
  
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('email', 'brunowachira001@gmail.com')
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Successfully deleted user:', data);
  console.log('\n✨ You can now update your profile email to brunowachira001@gmail.com\n');
}

deleteOldUser();
