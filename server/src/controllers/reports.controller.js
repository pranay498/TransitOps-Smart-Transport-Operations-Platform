const prisma = require('../lib/prisma');
const { handlePrismaError, asCsvRow } = require('../utils/controllerHelpers');

async function buildCostSummary() {
  const [fuel, maintenance, expenses] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { cost: true }, _count: true }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true }, _count: true }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
  ]);

  const fuelCost = fuel._sum.cost || 0;
  const maintenanceCost = maintenance._sum.cost || 0;
  const expenseCost = expenses._sum.amount || 0;

  return {
    fuelCost,
    maintenanceCost,
    expenseCost,
    totalCost: fuelCost + maintenanceCost + expenseCost,
  };
}

exports.getFuelEfficiency = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'COMPLETED', fuelConsumedL: { not: null } },
      select: { plannedDistKm: true, fuelConsumedL: true },
    });

    const totalDistanceKm = trips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
    const totalFuelLiters = trips.reduce((sum, trip) => sum + Number(trip.fuelConsumedL || 0), 0);
    const kilometersPerLiter = totalFuelLiters === 0 ? 0 : totalDistanceKm / totalFuelLiters;

    return res.json({
      fuelEfficiency: {
        totalDistanceKm,
        totalFuelLiters,
        kilometersPerLiter: Number(kilometersPerLiter.toFixed(2)),
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getUtilization = async (req, res) => {
  try {
    const [vehicles, trips, drivers] = await Promise.all([
      prisma.vehicle.findMany({ select: { status: true } }),
      prisma.trip.findMany({ select: { status: true } }),
      prisma.driver.findMany({ select: { status: true } }),
    ]);

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'ON_TRIP').length;
    const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
    const inMaintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === 'IN_SHOP').length;
    const totalTrips = trips.length;
    const dispatchedTrips = trips.filter((trip) => trip.status === 'DISPATCHED').length;
    const completedTrips = trips.filter((trip) => trip.status === 'COMPLETED').length;
    const pendingTrips = trips.filter((trip) => trip.status === 'DRAFT').length;
    const driversOnDuty = drivers.filter((driver) => driver.status === 'ON_TRIP').length;

    return res.json({
      utilization: {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        inMaintenanceVehicles,
        totalTrips,
        dispatchedTrips,
        completedTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilizationRate: totalVehicles === 0 ? 0 : Number((((activeVehicles + dispatchedTrips) / totalVehicles) * 100).toFixed(2)),
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getOperationalCost = async (req, res) => {
  try {
    const summary = await buildCostSummary();
    return res.json({ operationalCost: summary });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getRoi = async (req, res) => {
  try {
    const summary = await buildCostSummary();
    const completedTrips = await prisma.trip.findMany({
      where: { status: 'COMPLETED' },
      select: { plannedDistKm: true },
    });

    const estimatedRevenuePerKm = Number(process.env.REVENUE_PER_KM || 12);
    const totalCompletedDistanceKm = completedTrips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
    const estimatedRevenue = totalCompletedDistanceKm * estimatedRevenuePerKm;
    const roiPercent = summary.totalCost === 0 ? 0 : ((estimatedRevenue - summary.totalCost) / summary.totalCost) * 100;

    return res.json({
      roi: {
        estimatedRevenuePerKm,
        totalCompletedDistanceKm,
        estimatedRevenue,
        totalCost: summary.totalCost,
        roiPercent: Number(roiPercent.toFixed(2)),
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const [vehicleCount, driverCount, tripCount, costSummary] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.trip.count(),
      buildCostSummary(),
    ]);

    const rows = [
      asCsvRow(['metric', 'value']),
      asCsvRow(['vehicleCount', vehicleCount]),
      asCsvRow(['driverCount', driverCount]),
      asCsvRow(['tripCount', tripCount]),
      asCsvRow(['fuelCost', costSummary.fuelCost]),
      asCsvRow(['maintenanceCost', costSummary.maintenanceCost]),
      asCsvRow(['expenseCost', costSummary.expenseCost]),
      asCsvRow(['totalCost', costSummary.totalCost]),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.csv"');
    return res.send(rows.join('\n'));
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
