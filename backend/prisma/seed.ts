import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'player1@test.com' },
    update: {},
    create: {
      email: 'player1@test.com',
      username: 'Player1',
      password_hash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'player2@test.com' },
    update: {},
    create: {
      email: 'player2@test.com',
      username: 'Player2',
      password_hash,
    },
  });

  console.log({ user1, user2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
