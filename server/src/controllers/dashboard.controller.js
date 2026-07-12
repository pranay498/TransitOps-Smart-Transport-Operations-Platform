const prisma = require('../lib/prisma');
const { handlePrismaError } = require('../utils/controllerHelpers');

exports.getKpis = async (req, res) => {
  try {
    const [totalVehicles, availableVehicles, inMaintenanceVehicles, activeTrips, pendingTrips, driversOnDuty] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      prisma.trip.count({ where: { status: 'DRAFT' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    ]);

    const fleetUtilization = totalVehicles === 0 ? 0 : ((totalVehicles - availableVehicles - inMaintenanceVehicles) / totalVehicles) * 100;

    return res.json({
      kpis: {
        totalVehicles,
        availableVehicles,
        inMaintenanceVehicles,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization: Number(fleetUtilization.toFixed(2)),
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
