const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Mutates vehicle status with transition validation
 * @param {string} vehicleId 
 * @param {string} newStatus 
 */
async function setVehicleStatus(vehicleId, newStatus) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });
  
  if (!vehicle) {
    throw new Error(`Vehicle with ID ${vehicleId} not found.`);
  }

  // Business Rule: RETIRED vehicles cannot go back to AVAILABLE (or other active statuses)
  if (vehicle.status === 'RETIRED' && newStatus !== 'RETIRED') {
    throw new Error('Illegal vehicle status transition: RETIRED vehicles cannot transition back to active statuses.');
  }

  return await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: newStatus }
  });
}

/**
 * Mutates driver status with transition validation
 * @param {string} driverId 
 * @param {string} newStatus 
 */
async function setDriverStatus(driverId, newStatus) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  });

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`);
  }

  // Business Rule: Suspended drivers must undergo specific safety process (optional check or just direct update)
  return await prisma.driver.update({
    where: { id: driverId },
    data: { status: newStatus }
  });
}

module.exports = {
  setVehicleStatus,
  setDriverStatus
};
