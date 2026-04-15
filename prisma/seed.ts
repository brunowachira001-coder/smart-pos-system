import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { roleName: 'ADMIN' },
    update: {},
    create: {
      roleName: 'ADMIN',
      description: 'Administrator with full access',
      isSystemRole: true,
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { roleName: 'CASHIER' },
    update: {},
    create: {
      roleName: 'CASHIER',
      description: 'Cashier for POS transactions',
      isSystemRole: true,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@smartpos.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // Create branch
  const branch = await prisma.branch.upsert({
    where: { branchCode: 'MAIN' },
    update: {},
    create: {
      branchCode: 'MAIN',
      branchName: 'Main Branch',
      address: '123 Main Street',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254712345678',
      email: 'main@smartpos.com',
      status: 'ACTIVE',
      configuration: {
        create: {
          paymentMethods: ['CASH', 'CARD', 'MPESA'],
          pricingStrategy: 'RETAIL',
          taxRate: 16,
          receiptFormat: 'THERMAL',
        },
      },
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { categoryName: 'Dairy' },
      update: {},
      create: { categoryName: 'Dairy', description: 'Milk and dairy products' },
    }),
    prisma.category.upsert({
      where: { categoryName: 'Bakery' },
      update: {},
      create: { categoryName: 'Bakery', description: 'Bread and baked goods' },
    }),
    prisma.category.upsert({
      where: { categoryName: 'Grains' },
      update: {},
      create: { categoryName: 'Grains', description: 'Rice, flour, and grains' },
    }),
    prisma.category.upsert({
      where: { categoryName: 'Groceries' },
      update: {},
      create: { categoryName: 'Groceries', description: 'General groceries' },
    }),
    prisma.category.upsert({
      where: { categoryName: 'Oils' },
      update: {},
      create: { categoryName: 'Oils', description: 'Cooking oils and fats' },
    }),
  ]);

  // Create products
  const products = [
    { sku: 'PROD001', name: 'Milk (1L)', categoryId: categories[0].id, costPrice: 80, retailPrice: 150, wholesalePrice: 140 },
    { sku: 'PROD002', name: 'Bread (Loaf)', categoryId: categories[1].id, costPrice: 40, retailPrice: 80, wholesalePrice: 75 },
    { sku: 'PROD003', name: 'Eggs (Dozen)', categoryId: categories[0].id, costPrice: 120, retailPrice: 200, wholesalePrice: 190 },
    { sku: 'PROD004', name: 'Rice (2kg)', categoryId: categories[2].id, costPrice: 180, retailPrice: 300, wholesalePrice: 280 },
    { sku: 'PROD005', name: 'Sugar (1kg)', categoryId: categories[3].id, costPrice: 70, retailPrice: 120, wholesalePrice: 110 },
    { sku: 'PROD006', name: 'Cooking Oil (1L)', categoryId: categories[4].id, costPrice: 150, retailPrice: 250, wholesalePrice: 240 },
    { sku: 'PROD007', name: 'Beans (1kg)', categoryId: categories[2].id, costPrice: 100, retailPrice: 180, wholesalePrice: 170 },
    { sku: 'PROD008', name: 'Flour (2kg)', categoryId: categories[2].id, costPrice: 80, retailPrice: 140, wholesalePrice: 130 },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        status: 'ACTIVE',
      },
    });

    // Create branch inventory
    await prisma.branchInventory.upsert({
      where: {
        branchId_productId: {
          branchId: branch.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        branchId: branch.id,
        productId: product.id,
        stockLevel: 100,
        reorderPoint: 20,
        reorderQuantity: 50,
      },
    });

    // Create branch pricing
    await prisma.branchPricing.upsert({
      where: {
        branchId_productId: {
          branchId: branch.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        branchId: branch.id,
        productId: product.id,
        retailPrice: productData.retailPrice,
        wholesalePrice: productData.wholesalePrice,
        costPrice: productData.costPrice,
      },
    });
  }

  // Create payment methods
  await prisma.paymentMethod.upsert({
    where: { methodName: 'CASH' },
    update: {},
    create: {
      methodName: 'CASH',
      description: 'Cash payment',
      enabled: true,
      processingFee: 0,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { methodName: 'CARD' },
    update: {},
    create: {
      methodName: 'CARD',
      description: 'Card payment',
      enabled: true,
      processingFee: 2.5,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { methodName: 'MPESA' },
    update: {},
    create: {
      methodName: 'MPESA',
      description: 'M-Pesa mobile money',
      enabled: true,
      processingFee: 1.5,
    },
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
