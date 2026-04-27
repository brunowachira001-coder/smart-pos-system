// Run this in browser console on Supabase SQL Editor page
// Or use this as a guide to manually update via SQL

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));

console.log('=== PRODUCTS TO RESTORE ===');
console.log(`Total products: ${data.products.length}`);

// Generate SQL UPDATE statements
const updates = data.products.map(p => {
  const stock = p.stock || 0;
  const retail = p.retail_price || p.price || 0;
  const wholesale = p.wholesale_price || (retail * 0.85) || 0;
  const cost = p.cost_price || (retail * 0.6) || 0;
  
  return `UPDATE products SET 
    stock_quantity = ${stock},
    retail_price = ${retail},
    wholesale_price = ${wholesale},
    cost_price = ${cost},
    status = 'active'
  WHERE sku = '${p.sku}';`;
});

console.log('\n=== SQL UPDATES (Copy to Supabase SQL Editor) ===\n');
console.log(updates.join('\n'));

console.log('\n=== CUSTOMERS TO RESTORE ===');
console.log(`Total customers: ${data.customers.length}`);

const customerUpdates = data.customers.map(c => {
  return `UPDATE customers SET
    customer_type = '${c.customer_type || 'retail'}',
    credit_limit = ${c.credit_limit || 0},
    balance = ${c.balance || 0},
    status = 'active'
  WHERE email = '${c.email}' OR phone = '${c.phone}';`;
});

console.log('\n=== CUSTOMER SQL UPDATES ===\n');
console.log(customerUpdates.join('\n'));
