const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.expense.deleteMany({});
  await prisma.fuelLog.deleteMany({});
  await prisma.maintenanceLog.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const roles = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const role of roles) {
    const email = `${role.toLowerCase().replace('_', '')}@transitops.com`;
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });
    console.log(`Created user: ${email} with role: ${role}`);
  }

  // Seed Vehicles
  const vehicles = [
    { regNumber: 'KA-01-A-1234', name: 'Tata Ace Gold', type: 'Mini Truck', maxLoadKg: 750, odometer: 15000, acquisitionCost: 500000, status: 'AVAILABLE' },
    { regNumber: 'KA-02-B-5678', name: 'Ashok Leyland Dost', type: 'Pickup', maxLoadKg: 1250, odometer: 22000, acquisitionCost: 750000, status: 'ON_TRIP' },
    { regNumber: 'KA-03-C-9012', name: 'BharatBenz 1917R', type: 'Heavy Truck', maxLoadKg: 10500, odometer: 85000, acquisitionCost: 2800000, status: 'IN_SHOP' },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
    console.log(`Created vehicle: ${v.regNumber} (${v.status})`);
  }

  // Seed Drivers
  const drivers = [
    {
      name: 'John Doe',
      licenseNumber: 'DL-1234567890',
      licenseCategory: 'HEAVY_VEHICLE',
      licenseExpiry: new Date('2028-12-31'),
      contactNumber: '+919876543210',
      safetyScore: 95.5,
      status: 'AVAILABLE',
    },
    {
      name: 'Jane Smith',
      licenseNumber: 'DL-0987654321',
      licenseCategory: 'LIGHT_VEHICLE',
      licenseExpiry: new Date('2027-06-30'),
      contactNumber: '+918765432109',
      safetyScore: 98.0,
      status: 'ON_TRIP',
    },
    {
      name: 'Robert Brown',
      licenseNumber: 'DL-5555555555',
      licenseCategory: 'HEAVY_VEHICLE',
      licenseExpiry: new Date('2026-05-15'),
      contactNumber: '+917654321098',
      safetyScore: 82.0,
      status: 'SUSPENDED',
    },
  ];

  for (const d of drivers) {
    await prisma.driver.create({ data: d });
    console.log(`Created driver: ${d.name} (${d.status})`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
