import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password@123", 10);

  await prisma.user.upsert({
    where: { username: "ADMIN-001" },
    update: {
      name: "System Admin",
      email: "admin@amu.edu.et",
      password,
      role: "ADMIN",
      status: "ACTIVE",
      campus: "ARBA_MINCH_MAIN",
      department: "ICT",
      passwordChangedOnFirstLogin: true,
      tempPasswordExpiration: null,
    },
    create: {
      username: "ADMIN-001",
      name: "System Admin",
      email: "admin@amu.edu.et",
      password,
      role: "ADMIN",
      status: "ACTIVE",
      campus: "ARBA_MINCH_MAIN",
      department: "ICT",
      passwordChangedOnFirstLogin: true,
      tempPasswordExpiration: null,
    },
  });

  console.log("admin ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
