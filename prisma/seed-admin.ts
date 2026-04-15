import { prisma } from '@/lib/prisma';
import { authService } from '@/services/auth.service';

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const passwordHash = authService.hashPassword('admin123');

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@smartpos.local',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Admin user created successfully');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`ID: ${admin.id}`);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
