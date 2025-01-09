const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const hashedPassword = await hash('Ollama123@', 10);
    const user = await prisma.user.update({
      where: { email: 'sharma.raj2302@gmail.com' },
      data: { password: hashedPassword },
    });
    console.log('Password updated successfully for user:', user.email);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword(); 