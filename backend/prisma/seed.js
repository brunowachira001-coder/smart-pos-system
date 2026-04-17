const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      location: 'Nairobi',
      phone: '+254712345678',
      email: 'main@smartpos.com',
      manager: 'John Doe'
    }
  });

  console.log('✅ Branch created:', branch.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartpos.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      branchId: branch.id
    }
  });

  console.log('✅ Admin user created:', adminUser.username);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Groceries', description: 'Food and grocery items' } }),
    prisma.category.create({ data: { name: 'Beverages', description: 'Drinks and beverages' } }),
    prisma.category.create({ data: { name: 'Dairy', description: 'Milk and dairy products' } }),
    prisma.category.create({ data: { name: 'Bakery', description: 'Bread and baked goods' } })
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'MILK001',
        name: 'Fresh Milk (1L)',
        description: 'Fresh pasteurized milk',
        price: 150,
        cost: 100,
        categoryId: categories[2].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'BREAD001',
        name: 'Whole Wheat Bread',
        description: 'Healthy whole wheat bread',
        price: 80,
        cost: 50,
        categoryId: categories[3].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'EGGS001',
        name: 'Eggs (Dozen)',
        description: 'Fresh farm eggs',
        price: 200,
        cost: 140,
        categoryId: categories[2].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'RICE001',
        name: 'Basmati Rice (2kg)',
        description: 'Premium basmati rice',
        price: 300,
        cost: 200,
        categoryId: categories[0].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SUGAR001',
        name: 'Sugar (1kg)',
        description: 'Refined sugar',
        price: 120,
        cost: 80,
        categoryId: categories[0].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'OIL001',
        name: 'Cooking Oil (1L)',
        description: 'Vegetable cooking oil',
        price: 250,
        cost: 180,
        categoryId: categories[0].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'BEANS001',
        name: 'Beans (1kg)',
        description: 'Dried beans',
        price: 180,
        cost: 120,
        categoryId: categories[0].id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'FLOUR001',
        name: 'Wheat Flour (2kg)',
        description: 'All-purpose wheat flour',
        price: 140,
        cost: 90,
        categoryId: categories[0].id,
        isActive: true
      }
    })
  ]);

  console.log('✅ Products created:', products.length);

  // Create inventory
  await Promise.all(
    products.map(product =>
      prisma.inventory.create({
        data: {
          productId: product.id,
          branchId: branch.id,
          quantity: Math.floor(Math.random() * 100) + 20,
          minStock: 10,
          maxStock: 100
        }
      })
    )
  );

  console.log('✅ Inventory created');

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254712345678',
        address: '123 Main St',
        city: 'Nairobi',
        country: 'Kenya',
        creditLimit: 5000,
        branchId: branch.id
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+254712345679',
        address: '456 Oak Ave',
        city: 'Nairobi',
        country: 'Kenya',
        creditLimit: 3000,
        branchId: branch.id
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+254712345680',
        address: '789 Pine Rd',
        city: 'Nairobi',
        country: 'Kenya',
        creditLimit: 4000,
        branchId: branch.id
      }
    })
  ]);

  console.log('✅ Customers created:', customers.length);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
