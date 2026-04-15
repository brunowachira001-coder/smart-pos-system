import { PrismaClient } from '@prisma/client';
import { encryption } from '../lib/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create default roles
    console.log('📋 Creating roles...');
    const adminRole = await prisma.role.upsert({
      where: { roleName: 'ADMIN' },
      update: {},
      create: {
        roleName: 'ADMIN',
        description: 'Administrator with full access',
        isSystemRole: true,
      },
    });

    const managerRole = await prisma.role.upsert({
      where: { roleName: 'MANAGER' },
      update: {},
      create: {
        roleName: 'MANAGER',
        description: 'Store manager with management access',
        isSystemRole: true,
      },
    });

    const cashierRole = await prisma.role.upsert({
      where: { roleName: 'CASHIER' },
      update: {},
      create: {
        roleName: 'CASHIER',
        description: 'Cashier with transaction access',
        isSystemRole: true,
      },
    });

    // Create permissions
    console.log('🔐 Creating permissions...');
    const permissions = [
      { name: 'CREATE_TRANSACTION', entity: 'Transaction', operation: 'CREATE' },
      { name: 'READ_TRANSACTION', entity: 'Transaction', operation: 'READ' },
      { name: 'UPDATE_TRANSACTION', entity: 'Transaction', operation: 'UPDATE' },
      { name: 'DELETE_TRANSACTION', entity: 'Transaction', operation: 'DELETE' },
      { name: 'MANAGE_INVENTORY', entity: 'Inventory', operation: 'MANAGE' },
      { name: 'MANAGE_CUSTOMERS', entity: 'Customer', operation: 'MANAGE' },
      { name: 'VIEW_ANALYTICS', entity: 'Analytics', operation: 'READ' },
      { name: 'MANAGE_USERS', entity: 'User', operation: 'MANAGE' },
      { name: 'VIEW_AUDIT_LOGS', entity: 'AuditLog', operation: 'READ' },
    ];

    const createdPermissions = await Promise.all(
      permissions.map((perm) =>
        prisma.permission.upsert({
          where: { permissionName: perm.name },
          update: {},
          create: {
            permissionName: perm.name,
            entityType: perm.entity,
            operation: perm.operation,
          },
        })
      )
    );

    // Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');
    for (const permission of createdPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@smartpos.local',
        passwordHash: encryption.hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
      },
    });

    // Assign admin role to admin user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    // Create default branch
    console.log('🏪 Creating default branch...');
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
        email: 'main@smartpos.local',
        status: 'ACTIVE',
        timezone: 'Africa/Nairobi',
      },
    });

    // Create sample category first
    console.log('📂 Creating product category...');
    const category = await prisma.category.upsert({
      where: { categoryName: 'General' },
      update: {},
      create: {
        categoryName: 'General',
        description: 'General products',
      },
    });

    // Create sample products
    console.log('📦 Creating sample products...');
    const products = [
      {
        sku: 'PROD001',
        name: 'Milk (1L)',
        costPrice: 100,
        retailPrice: 150,
        wholesalePrice: 130,
      },
      {
        sku: 'PROD002',
        name: 'Bread (Loaf)',
        costPrice: 50,
        retailPrice: 80,
        wholesalePrice: 70,
      },
      {
        sku: 'PROD003',
        name: 'Eggs (Dozen)',
        costPrice: 140,
        retailPrice: 200,
        wholesalePrice: 180,
      },
      {
        sku: 'PROD004',
        name: 'Rice (2kg)',
        costPrice: 200,
        retailPrice: 300,
        wholesalePrice: 270,
      },
      {
        sku: 'PROD005',
        name: 'Sugar (1kg)',
        costPrice: 80,
        retailPrice: 120,
        wholesalePrice: 105,
      },
    ];

    const createdProducts = await Promise.all(
      products.map((prod) =>
        prisma.product.upsert({
          where: { sku: prod.sku },
          update: {},
          create: {
            ...prod,
            categoryId: category.id,
            status: 'ACTIVE',
          },
        })
      )
    );

    // Create inventory items
    console.log('📊 Creating inventory items...');
    await Promise.all(
      createdProducts.map((product) =>
        prisma.branchInventory.upsert({
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
        })
      )
    );

    // Create sample customers
    console.log('👥 Creating sample customers...');
    const customers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        email: 'john@example.com',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+254723456789',
        email: 'jane@example.com',
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '+254734567890',
        email: 'bob@example.com',
      },
    ];

    await Promise.all(
      customers.map((cust) =>
        prisma.customer.upsert({
          where: { phone: cust.phone },
          update: {},
          create: {
            ...cust,
            status: 'ACTIVE',
          },
        })
      )
    );

    console.log('✅ Database seed completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🏪 Default branch: MAIN');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
