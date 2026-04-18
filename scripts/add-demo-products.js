// Script to add demo products to Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ugemjqouxnholwlgvzer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZW1qcW91eG5ob2x3bGd2emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA2NzA1NywiZXhwIjoyMDkxNjQzMDU3fQ.WHvAHGslQVJfoDK5hdlPc_f1vcMzTh3QP1Y4xPSqfL4';

const supabase = createClient(supabaseUrl, supabaseKey);

const demoProducts = [
  {
    name: 'Milk (1L)',
    sku: 'PROD001',
    price: 150.00,
    retail_price: 150.00,
    wholesale_price: 140.00,
    cost_price: 80.00,
    stock: 100,
    stock_quantity: 100,
    minimum_stock_level: 10,
    category: 'Dairy',
    description: 'Fresh milk',
    barcode: '1234567890001'
  },
  {
    name: 'Bread (Loaf)',
    sku: 'PROD002',
    price: 80.00,
    retail_price: 80.00,
    wholesale_price: 75.00,
    cost_price: 40.00,
    stock: 50,
    stock_quantity: 50,
    minimum_stock_level: 5,
    category: 'Bakery',
    description: 'Fresh bread',
    barcode: '1234567890002'
  },
  {
    name: 'Eggs (Dozen)',
    sku: 'PROD003',
    price: 200.00,
    retail_price: 200.00,
    wholesale_price: 190.00,
    cost_price: 120.00,
    stock: 75,
    stock_quantity: 75,
    minimum_stock_level: 10,
    category: 'Dairy',
    description: 'Fresh eggs',
    barcode: '1234567890003'
  },
  {
    name: 'Rice (2kg)',
    sku: 'PROD004',
    price: 300.00,
    retail_price: 300.00,
    wholesale_price: 280.00,
    cost_price: 180.00,
    stock: 120,
    stock_quantity: 120,
    minimum_stock_level: 15,
    category: 'Grains',
    description: 'White rice',
    barcode: '1234567890004'
  },
  {
    name: 'Sugar (1kg)',
    sku: 'PROD005',
    price: 120.00,
    retail_price: 120.00,
    wholesale_price: 110.00,
    cost_price: 70.00,
    stock: 90,
    stock_quantity: 90,
    minimum_stock_level: 10,
    category: 'Groceries',
    description: 'White sugar',
    barcode: '1234567890005'
  },
  {
    name: 'Cooking Oil (1L)',
    sku: 'PROD006',
    price: 250.00,
    retail_price: 250.00,
    wholesale_price: 240.00,
    cost_price: 150.00,
    stock: 60,
    stock_quantity: 60,
    minimum_stock_level: 10,
    category: 'Oils',
    description: 'Vegetable oil',
    barcode: '1234567890006'
  },
  {
    name: 'Beans (1kg)',
    sku: 'PROD007',
    price: 180.00,
    retail_price: 180.00,
    wholesale_price: 170.00,
    cost_price: 100.00,
    stock: 80,
    stock_quantity: 80,
    minimum_stock_level: 10,
    category: 'Grains',
    description: 'Dried beans',
    barcode: '1234567890007'
  },
  {
    name: 'Flour (2kg)',
    sku: 'PROD008',
    price: 140.00,
    retail_price: 140.00,
    wholesale_price: 130.00,
    cost_price: 80.00,
    stock: 100,
    stock_quantity: 100,
    minimum_stock_level: 15,
    category: 'Grains',
    description: 'Wheat flour',
    barcode: '1234567890008'
  },
  {
    name: 'Tea Leaves (250g)',
    sku: 'PROD009',
    price: 180.00,
    retail_price: 180.00,
    wholesale_price: 170.00,
    cost_price: 100.00,
    stock: 60,
    stock_quantity: 60,
    minimum_stock_level: 10,
    category: 'Beverages',
    description: 'Premium tea',
    barcode: '1234567890009'
  },
  {
    name: 'Coffee (500g)',
    sku: 'PROD010',
    price: 350.00,
    retail_price: 350.00,
    wholesale_price: 330.00,
    cost_price: 200.00,
    stock: 40,
    stock_quantity: 40,
    minimum_stock_level: 5,
    category: 'Beverages',
    description: 'Ground coffee',
    barcode: '1234567890010'
  },
  {
    name: 'Salt (1kg)',
    sku: 'PROD011',
    price: 50.00,
    retail_price: 50.00,
    wholesale_price: 45.00,
    cost_price: 25.00,
    stock: 150,
    stock_quantity: 150,
    minimum_stock_level: 20,
    category: 'Groceries',
    description: 'Iodized salt',
    barcode: '1234567890011'
  },
  {
    name: 'Pasta (500g)',
    sku: 'PROD012',
    price: 120.00,
    retail_price: 120.00,
    wholesale_price: 110.00,
    cost_price: 65.00,
    stock: 70,
    stock_quantity: 70,
    minimum_stock_level: 10,
    category: 'Grains',
    description: 'Spaghetti pasta',
    barcode: '1234567890012'
  }
];

async function addProducts() {
  console.log('🚀 Starting to add demo products to Supabase...\n');

  try {
    // Check if products table exists and has data
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking products table:', countError.message);
      return;
    }

    console.log(`📊 Current products in database: ${count}\n`);

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .upsert(demoProducts, { onConflict: 'sku' })
      .select();

    if (error) {
      console.error('❌ Error adding products:', error.message);
      return;
    }

    console.log(`✅ Successfully added ${data.length} products!\n`);
    
    // Verify
    const { count: newCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total products in database now: ${newCount}\n`);
    console.log('✨ Demo products added successfully!');
    console.log('\n📝 Products added:');
    data.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.sku}) - KSH ${product.retail_price}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addProducts();
