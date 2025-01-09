const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✓ Database connection successful');

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'sharma.raj2302@gmail.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      }
    });

    if (user) {
      console.log('✓ User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password
      });
    } else {
      console.log('✗ User not found');
    }

  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 