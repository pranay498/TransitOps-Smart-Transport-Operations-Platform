const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');

  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'fleetmanager@transitops.com', role: 'FLEET_MANAGER' },
    { email: 'driver@transitops.com', role: 'DRIVER' },
    { email: 'safetyofficer@transitops.com', role: 'SAFETY_OFFICER' },
    { email: 'financialanalyst@transitops.com', role: 'FINANCIAL_ANALYST' },
  ];

  for (const u of users) {
    await prisma.user.create({ data: { ...u, password: hashedPassword } });
    console.log(`Created: ${u.email} (${u.role})`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
