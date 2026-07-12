const prisma = require('../lib/prisma');


async function setVehicleStatus(vehicleId, newStatus) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });
  
  if (!vehicle) {
    throw new Error(`Vehicle with ID ${vehicleId} not found.`);
  }

  const oldStatus = vehicle.status;

  if (oldStatus !== newStatus) {
    if (oldStatus === 'RETIRED') {
      throw new Error(`Illegal vehicle status transition: RETIRED vehicles cannot transition back to active statuses.`);
    }

    if (oldStatus === 'AVAILABLE' && !['ON_TRIP', 'IN_SHOP', 'RETIRED'].includes(newStatus)) {
      throw new Error(`Illegal vehicle status transition from ${oldStatus} to ${newStatus}.`);
    }
    if (oldStatus === 'ON_TRIP' && !['AVAILABLE', 'IN_SHOP'].includes(newStatus)) {
      throw new Error(`Illegal vehicle status transition from ${oldStatus} to ${newStatus}.`);
    }
    if (oldStatus === 'IN_SHOP' && !['AVAILABLE', 'RETIRED'].includes(newStatus)) {
      throw new Error(`Illegal vehicle status transition from ${oldStatus} to ${newStatus}.`);
    }
  }

  return await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: newStatus }
  });
}


async function setDriverStatus(driverId, newStatus) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  });

  if (!driver) {
    throw new Error(`Driver with ID ${driverId} not found.`);
  }

  const oldStatus = driver.status;

  if (oldStatus !== newStatus) {
    if (oldStatus === 'AVAILABLE' && !['ON_TRIP', 'OFF_DUTY', 'SUSPENDED'].includes(newStatus)) {
      throw new Error(`Illegal driver status transition from ${oldStatus} to ${newStatus}.`);
    }
    if (oldStatus === 'ON_TRIP' && !['AVAILABLE', 'OFF_DUTY'].includes(newStatus)) {
      throw new Error(`Illegal driver status transition from ${oldStatus} to ${newStatus}.`);
    }
    if (oldStatus === 'OFF_DUTY' && !['AVAILABLE', 'SUSPENDED'].includes(newStatus)) {
      throw new Error(`Illegal driver status transition from ${oldStatus} to ${newStatus}.`);
    }
    if (oldStatus === 'SUSPENDED' && !['AVAILABLE', 'OFF_DUTY'].includes(newStatus)) {
      throw new Error(`Illegal driver status transition from ${oldStatus} to ${newStatus}.`);
    }
  }

  return await prisma.driver.update({
    where: { id: driverId },
    data: { status: newStatus }
  });
}

module.exports = {
  setVehicleStatus,
  setDriverStatus
};
