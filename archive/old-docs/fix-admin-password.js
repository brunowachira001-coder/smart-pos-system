// Generate proper bcrypt hash for admin password
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== ADMIN PASSWORD HASH ===\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n=== RUN THIS SQL IN SUPABASE ===\n');
  console.log(`UPDATE users 
SET password_hash = '${hash}'
WHERE email = 'brunowachira001@gmail.com';

SELECT 'Password updated!' as message;`);
  console.log('\n');
}

generateHash();
