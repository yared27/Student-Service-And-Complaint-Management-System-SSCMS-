import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const targetId = 'b84522f2-ba73-4f54-ae82-1858a06c0fa8';

try {
  const before = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, name: true, username: true, email: true },
  });

  if (!before) {
    console.log(JSON.stringify({ deleted: false, message: 'User already missing.' }, null, 2));
  } else {
    await prisma.user.delete({ where: { id: targetId } });
    console.log(JSON.stringify({ deleted: true, user: before }, null, 2));
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
