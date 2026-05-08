const fs = require('fs');
const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));

console.log('-- DELETE TEST PRODUCTS');
console.log("DELETE FROM products WHERE sku LIKE 'TEST-%';");
console.log('');
console.log('-- INSERT ALL PRODUCTS FROM EXPORT');
console.log('INSERT INTO products (sku, name, category, stock_quantity, retail_price, wholesale_price, cost_price, status, description, barcode)');
console.log('VALUES');

const values = data.products.map((p, i) => {
  const sku = (p.sku || '').replace(/'/g, "''");
  const name = (p.name || '').replace(/'/g, "''");
  const category = (p.category || 'General').replace(/'/g, "''");
  const stock = p.stock || 0;
  const retail = p.retail_price || p.price || 0;
  const wholesale = p.wholesale_price || (retail * 0.85) || 0;
  const cost = p.cost_price || (retail * 0.6) || 0;
  const status = p.status === 'Active' ? 'active' : 'inactive';
  const desc = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL';
  const barcode = p.barcode ? `'${p.barcode.replace(/'/g, "''")}'` : 'NULL';
  
  const isLast = i === data.products.length - 1;
  return `('${sku}', '${name}', '${category}', ${stock}, ${retail}, ${wholesale}, ${cost}, '${status}', ${desc}, ${barcode})${isLast ? ';' : ','}`;
});

console.log(values.join('\n'));

console.log('\n-- INSERT ALL CUSTOMERS');
console.log('INSERT INTO customers (name, email, phone, address, customer_type, status) VALUES');

const customerValues = data.customers.map((c, i) => {
  const name = (c.name || '').replace(/'/g, "''");
  const email = c.email ? `'${c.email.replace(/'/g, "''")}'` : 'NULL';
  const phone = c.phone ? `'${c.phone.replace(/'/g, "''")}'` : 'NULL';
  const address = c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL';
  const type = c.customer_type || 'retail';
  const status = c.status === 'Active' ? 'active' : 'inactive';
  
  const isLast = i === data.customers.length - 1;
  return `('${name}', ${email}, ${phone}, ${address}, '${type}', '${status}')${isLast ? ';' : ','}`;
});

console.log(customerValues.join('\n'));

console.log('\n-- VERIFY');
console.log('SELECT COUNT(*) as total_products FROM products;');
console.log('SELECT COUNT(*) as total_customers FROM customers;');
