const fs = require('fs');
const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));

console.log('-- ========================================');
console.log('-- COMPLETE DATA RESTORATION');
console.log('-- Products: ' + data.products.length);
console.log('-- Customers: ' + data.customers.length);
console.log('-- Returns: ' + (data.returns?.length || 0));
console.log('-- Expenses: ' + (data.expenses?.length || 0));
console.log('-- Debts: ' + (data.debts?.length || 0));
console.log('-- Shop Settings: ' + (data.shop_settings?.length || 0));
console.log('-- ========================================');
console.log('');

// Delete existing data
console.log('-- CLEAN UP EXISTING DATA');
console.log("DELETE FROM products WHERE sku LIKE 'TEST-%';");
console.log('DELETE FROM returns;');
console.log('DELETE FROM expenses;');
console.log('DELETE FROM debts;');
console.log('DELETE FROM shop_settings;');
console.log('');

// Insert Products
console.log('-- INSERT PRODUCTS (' + data.products.length + ')');
console.log('INSERT INTO products (');
console.log('  sku, name, category, stock_quantity, retail_price, wholesale_price,');
console.log('  cost_price, status, description, barcode, image_url, minimum_stock_level');
console.log(') VALUES');

const productValues = data.products.map((p, i) => {
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
  const image = p.image_url ? `'${p.image_url.replace(/'/g, "''")}'` : 'NULL';
  const minStock = p.minimum_stock_level || 10;
  
  const isLast = i === data.products.length - 1;
  return `('${sku}', '${name}', '${category}', ${stock}, ${retail}, ${wholesale}, ${cost}, '${status}', ${desc}, ${barcode}, ${image}, ${minStock})${isLast ? ';' : ','}`;
});

console.log(productValues.join('\n'));
console.log('');

// Insert Customers
console.log('-- INSERT CUSTOMERS (' + data.customers.length + ')');
console.log('INSERT INTO customers (');
console.log('  name, email, phone, address, customer_type, status');
console.log(') VALUES');

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
console.log('');

// Insert Returns
if (data.returns && data.returns.length > 0) {
  console.log('-- INSERT RETURNS (' + data.returns.length + ')');
  console.log('INSERT INTO returns (');
  console.log('  product_id, quantity, reason, status, refund_amount, created_at');
  console.log(') VALUES');
  
  const returnValues = data.returns.map((r, i) => {
    const productId = r.product_id ? `'${r.product_id}'` : 'NULL';
    const qty = r.quantity || 1;
    const reason = r.reason ? `'${r.reason.replace(/'/g, "''")}'` : "'Other'";
    const status = r.status ? `'${r.status}'` : "'completed'";
    const refund = r.refund_amount || 0;
    const created = r.created_at ? `'${r.created_at}'` : 'NOW()';
    
    const isLast = i === data.returns.length - 1;
    return `(${productId}, ${qty}, ${reason}, ${status}, ${refund}, ${created})${isLast ? ';' : ','}`;
  });
  
  console.log(returnValues.join('\n'));
  console.log('');
}

// Insert Expenses
if (data.expenses && data.expenses.length > 0) {
  console.log('-- INSERT EXPENSES (' + data.expenses.length + ')');
  console.log('INSERT INTO expenses (');
  console.log('  category, amount, description, date, created_at');
  console.log(') VALUES');
  
  const expenseValues = data.expenses.map((e, i) => {
    const category = e.category ? `'${e.category.replace(/'/g, "''")}'` : "'Other'";
    const amount = e.amount || 0;
    const desc = e.description ? `'${e.description.replace(/'/g, "''")}'` : 'NULL';
    const date = e.date ? `'${e.date}'` : 'NOW()';
    const created = e.created_at ? `'${e.created_at}'` : 'NOW()';
    
    const isLast = i === data.expenses.length - 1;
    return `(${category}, ${amount}, ${desc}, ${date}, ${created})${isLast ? ';' : ','}`;
  });
  
  console.log(expenseValues.join('\n'));
  console.log('');
}

// Insert Debts
if (data.debts && data.debts.length > 0) {
  console.log('-- INSERT DEBTS (' + data.debts.length + ')');
  console.log('INSERT INTO debts (');
  console.log('  customer_id, amount, paid_amount, status, due_date, created_at');
  console.log(') VALUES');
  
  const debtValues = data.debts.map((d, i) => {
    const customerId = d.customer_id ? `'${d.customer_id}'` : 'NULL';
    const amount = d.amount || 0;
    const paid = d.paid_amount || 0;
    const status = d.status ? `'${d.status}'` : "'pending'";
    const dueDate = d.due_date ? `'${d.due_date}'` : 'NULL';
    const created = d.created_at ? `'${d.created_at}'` : 'NOW()';
    
    const isLast = i === data.debts.length - 1;
    return `(${customerId}, ${amount}, ${paid}, ${status}, ${dueDate}, ${created})${isLast ? ';' : ','}`;
  });
  
  console.log(debtValues.join('\n'));
  console.log('');
}

// Insert Shop Settings
if (data.shop_settings && data.shop_settings.length > 0) {
  console.log('-- INSERT SHOP SETTINGS');
  const s = data.shop_settings[0];
  const shopName = s.shop_name ? `'${s.shop_name.replace(/'/g, "''")}'` : "'My Shop'";
  const address = s.address ? `'${s.address.replace(/'/g, "''")}'` : 'NULL';
  const phone = s.phone ? `'${s.phone.replace(/'/g, "''")}'` : 'NULL';
  const email = s.email ? `'${s.email.replace(/'/g, "''")}'` : 'NULL';
  const currency = s.currency ? `'${s.currency}'` : "'KES'";
  const taxRate = s.tax_rate || 0;
  const logo = s.logo_url ? `'${s.logo_url.replace(/'/g, "''")}'` : 'NULL';
  
  console.log('INSERT INTO shop_settings (');
  console.log('  shop_name, address, phone, email, currency, tax_rate, logo_url');
  console.log(') VALUES (');
  console.log(`  ${shopName}, ${address}, ${phone}, ${email}, ${currency}, ${taxRate}, ${logo}`);
  console.log(');');
  console.log('');
}

// Verification
console.log('-- VERIFY DATA');
console.log('SELECT COUNT(*) as total_products FROM products;');
console.log('SELECT COUNT(*) as total_customers FROM customers;');
console.log('SELECT COUNT(*) as total_returns FROM returns;');
console.log('SELECT COUNT(*) as total_expenses FROM expenses;');
console.log('SELECT COUNT(*) as total_debts FROM debts;');
console.log('SELECT COUNT(*) as total_shop_settings FROM shop_settings;');
