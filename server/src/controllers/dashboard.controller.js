const prisma = require('../lib/prisma');
const { handlePrismaError } = require('../utils/controllerHelpers');

exports.getKpis = async (req, res) => {
  try {
    const [
      activeVehicles,
      availableVehicles,
      inMaintenance,
      onTripVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty
    ] = await Promise.all([
      prisma.vehicle.count({ where: { status: { not: 'RETIRED' } } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
      prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      prisma.trip.count({ where: { status: 'DRAFT' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    ]);

    const fleetUtilizationPct = activeVehicles === 0 ? 0 : (onTripVehicles / activeVehicles) * 100;

    return res.json({
      kpis: {
        activeVehicles,
        availableVehicles,
        inMaintenance,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilizationPct: Number(fleetUtilizationPct.toFixed(2)),
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
