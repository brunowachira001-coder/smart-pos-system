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
  const status = c.status === 'active' ? 'active' : 'inactive';
  
  const isLast = i === data.customers.length - 1;
  return `('${name}', ${email}, ${phone}, ${address}, '${type}', '${status}')${isLast ? ';' : ','}`;
});

console.log(customerValues.join('\n'));
console.log('');

// Insert Returns - Match actual schema
if (data.returns && data.returns.length > 0) {
  console.log('-- INSERT RETURNS (' + data.returns.length + ')');
  console.log('INSERT INTO returns (');
  console.log('  return_id, transaction_id, customer_id, customer_name, product_id, product_name,');
  console.log('  quantity, amount, reason, status, refund_method, refund_amount, notes,');
  console.log('  processed_by, return_date, processed_date, created_at, updated_at');
  console.log(') VALUES');
  
  const returnValues = data.returns.map((r, i) => {
    const returnId = r.return_id ? `'${r.return_id}'` : 'NULL';
    const txnId = r.transaction_id ? `'${r.transaction_id.replace(/'/g, "''")}'` : 'NULL';
    const custId = r.customer_id ? `'${r.customer_id}'` : 'NULL';
    const custName = r.customer_name ? `'${r.customer_name.replace(/'/g, "''")}'` : "'Walk-in Customer'";
    const prodId = r.product_id ? `'${r.product_id}'` : 'NULL';
    const prodName = r.product_name ? `'${r.product_name.replace(/'/g, "''")}'` : "'Unknown'";
    const qty = r.quantity || 1;
    const amount = r.amount || 0;
    const reason = r.reason ? `'${r.reason.replace(/'/g, "''")}'` : "'Other'";
    const status = r.status ? `'${r.status}'` : "'Completed'";
    const refundMethod = r.refund_method ? `'${r.refund_method}'` : 'NULL';
    const refund = r.refund_amount || 0;
    const notes = r.notes ? `'${r.notes.replace(/'/g, "''")}'` : 'NULL';
    const processedBy = r.processed_by ? `'${r.processed_by}'` : 'NULL';
    const returnDate = r.return_date ? `'${r.return_date}'` : 'NOW()';
    const processedDate = r.processed_date ? `'${r.processed_date}'` : 'NULL';
    const created = r.created_at ? `'${r.created_at}'` : 'NOW()';
    const updated = r.updated_at ? `'${r.updated_at}'` : 'NOW()';
    
    const isLast = i === data.returns.length - 1;
    return `(${returnId}, ${txnId}, ${custId}, ${custName}, ${prodId}, ${prodName}, ${qty}, ${amount}, ${reason}, ${status}, ${refundMethod}, ${refund}, ${notes}, ${processedBy}, ${returnDate}, ${processedDate}, ${created}, ${updated})${isLast ? ';' : ','}`;
  });
  
  console.log(returnValues.join('\n'));
  console.log('');
}

// Insert Expenses - Match actual schema
if (data.expenses && data.expenses.length > 0) {
  console.log('-- INSERT EXPENSES (' + data.expenses.length + ')');
  console.log('INSERT INTO expenses (');
  console.log('  expense_id, category, subcategory, amount, description, payment_method,');
  console.log('  vendor_name, receipt_number, is_recurring, recurrence_period, notes,');
  console.log('  expense_date, created_by, approved_by, status, created_at, updated_at');
  console.log(') VALUES');
  
  const expenseValues = data.expenses.map((e, i) => {
    const expenseId = e.expense_id ? `'${e.expense_id}'` : 'NULL';
    const category = e.category ? `'${e.category.replace(/'/g, "''")}'` : "'Other'";
    const subcategory = e.subcategory ? `'${e.subcategory.replace(/'/g, "''")}'` : 'NULL';
    const amount = e.amount || 0;
    const desc = e.description ? `'${e.description.replace(/'/g, "''")}'` : 'NULL';
    const paymentMethod = e.payment_method ? `'${e.payment_method}'` : "'Cash'";
    const vendor = e.vendor_name ? `'${e.vendor_name.replace(/'/g, "''")}'` : 'NULL';
    const receipt = e.receipt_number ? `'${e.receipt_number}'` : 'NULL';
    const recurring = e.is_recurring ? 'true' : 'false';
    const recurrence = e.recurrence_period ? `'${e.recurrence_period}'` : 'NULL';
    const notes = e.notes ? `'${e.notes.replace(/'/g, "''")}'` : 'NULL';
    const expenseDate = e.expense_date ? `'${e.expense_date}'` : 'CURRENT_DATE';
    const createdBy = e.created_by ? `'${e.created_by}'` : "'Admin'";
    const approvedBy = e.approved_by ? `'${e.approved_by}'` : 'NULL';
    const status = e.status ? `'${e.status}'` : "'Approved'";
    const created = e.created_at ? `'${e.created_at}'` : 'NOW()';
    const updated = e.updated_at ? `'${e.updated_at}'` : 'NOW()';
    
    const isLast = i === data.expenses.length - 1;
    return `(${expenseId}, ${category}, ${subcategory}, ${amount}, ${desc}, ${paymentMethod}, ${vendor}, ${receipt}, ${recurring}, ${recurrence}, ${notes}, ${expenseDate}, ${createdBy}, ${approvedBy}, ${status}, ${created}, ${updated})${isLast ? ';' : ','}`;
  });
  
  console.log(expenseValues.join('\n'));
  console.log('');
}

// Insert Debts - Match actual schema
if (data.debts && data.debts.length > 0) {
  console.log('-- INSERT DEBTS (' + data.debts.length + ')');
  console.log('INSERT INTO debts (');
  console.log('  customer_id, customer_name, sale_id, total_amount, amount_paid,');
  console.log('  amount_remaining, credit_limit, status, due_date, notes, created_at, updated_at');
  console.log(') VALUES');
  
  const debtValues = data.debts.map((d, i) => {
    const customerId = d.customer_id ? `'${d.customer_id}'` : 'NULL';
    const customerName = d.customer_name ? `'${d.customer_name.replace(/'/g, "''")}'` : "'Unknown'";
    const saleId = d.sale_id ? `'${d.sale_id}'` : "'SALE-000000'";
    const totalAmount = d.total_amount || 0;
    const amountPaid = d.amount_paid || 0;
    const amountRemaining = d.amount_remaining || 0;
    const creditLimit = d.credit_limit || 0;
    const status = d.status ? `'${d.status}'` : "'Outstanding'";
    const dueDate = d.due_date ? `'${d.due_date}'` : 'NULL';
    const notes = d.notes ? `'${d.notes.replace(/'/g, "''")}'` : 'NULL';
    const created = d.created_at ? `'${d.created_at}'` : 'NOW()';
    const updated = d.updated_at ? `'${d.updated_at}'` : 'NOW()';
    
    const isLast = i === data.debts.length - 1;
    return `(${customerId}, ${customerName}, ${saleId}, ${totalAmount}, ${amountPaid}, ${amountRemaining}, ${creditLimit}, ${status}, ${dueDate}, ${notes}, ${created}, ${updated})${isLast ? ';' : ','}`;
  });
  
  console.log(debtValues.join('\n'));
  console.log('');
}

// Insert Shop Settings - Match actual schema
if (data.shop_settings && data.shop_settings.length > 0) {
  console.log('-- INSERT SHOP SETTINGS');
  const s = data.shop_settings[0];
  const userId = s.user_id ? `'${s.user_id}'` : 'NULL';
  const businessName = s.business_name ? `'${s.business_name.replace(/'/g, "''")}'` : "'My Shop'";
  const tagline = s.business_tagline ? `'${s.business_tagline.replace(/'/g, "''")}'` : 'NULL';
  const email = s.business_email ? `'${s.business_email.replace(/'/g, "''")}'` : 'NULL';
  const phone = s.business_phone ? `'${s.business_phone.replace(/'/g, "''")}'` : 'NULL';
  const address = s.business_address ? `'${s.business_address.replace(/'/g, "''")}'` : 'NULL';
  const logo = s.logo_url ? `'${s.logo_url.replace(/'/g, "''")}'` : 'NULL';
  const primaryColor = s.primary_color ? `'${s.primary_color}'` : "'#10b981'";
  const secondaryColor = s.secondary_color ? `'${s.secondary_color}'` : "'#059669'";
  const currency = s.currency ? `'${s.currency}'` : "'KES'";
  const currencySymbol = s.currency_symbol ? `'${s.currency_symbol}'` : "'KSh'";
  const timezone = s.timezone ? `'${s.timezone}'` : "'Africa/Nairobi'";
  const dateFormat = s.date_format ? `'${s.date_format}'` : "'DD/MM/YYYY'";
  const receiptHeader = s.receipt_header ? `'${s.receipt_header.replace(/'/g, "''")}'` : 'NULL';
  const receiptFooter = s.receipt_footer ? `'${s.receipt_footer.replace(/'/g, "''")}'` : 'NULL';
  const showLogo = s.show_logo_on_receipt ? 'true' : 'false';
  const businessType = s.business_type ? `'${s.business_type.replace(/'/g, "''")}'` : 'NULL';
  
  console.log('INSERT INTO shop_settings (');
  console.log('  user_id, business_name, business_tagline, business_email, business_phone,');
  console.log('  business_address, logo_url, primary_color, secondary_color, currency,');
  console.log('  currency_symbol, timezone, date_format, receipt_header, receipt_footer,');
  console.log('  show_logo_on_receipt, business_type');
  console.log(') VALUES (');
  console.log(`  ${userId}, ${businessName}, ${tagline}, ${email}, ${phone}, ${address}, ${logo},`);
  console.log(`  ${primaryColor}, ${secondaryColor}, ${currency}, ${currencySymbol}, ${timezone},`);
  console.log(`  ${dateFormat}, ${receiptHeader}, ${receiptFooter}, ${showLogo}, ${businessType}`);
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
