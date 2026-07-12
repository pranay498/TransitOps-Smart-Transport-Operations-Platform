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
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: { select: { liters: true } },
        trips: {
          where: { status: 'COMPLETED' },
          select: { plannedDistKm: true },
        },
      },
    });

    const data = vehicles.map((v) => {
      const completedTrips = v.trips || [];
      const totalDistanceKm = completedTrips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
      const totalFuelLiters = v.fuelLogs.reduce((sum, log) => sum + Number(log.liters || 0), 0);
      const kilometersPerLiter = totalFuelLiters === 0 ? 0 : totalDistanceKm / totalFuelLiters;

      return {
        vehicleId: v.id,
        regNumber: v.regNumber,
        name: v.name,
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalFuelLiters: Number(totalFuelLiters.toFixed(2)),
        kilometersPerLiter: Number(kilometersPerLiter.toFixed(2)),
      };
    });

    // Fleet-wide aggregate
    let totalFleetDistanceKm = 0;
    let totalFleetFuelLiters = 0;
    for (const v of data) {
      totalFleetDistanceKm += v.totalDistanceKm;
      totalFleetFuelLiters += v.totalFuelLiters;
    }
    const fleetKilometersPerLiter = totalFleetFuelLiters === 0 ? 0 : totalFleetDistanceKm / totalFleetFuelLiters;

    return res.json({
      fuelEfficiency: {
        fleetAverage: {
          totalDistanceKm: Number(totalFleetDistanceKm.toFixed(2)),
          totalFuelLiters: Number(totalFleetFuelLiters.toFixed(2)),
          kilometersPerLiter: Number(fleetKilometersPerLiter.toFixed(2)),
        },
        vehicles: data,
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getUtilization = async (req, res) => {
  try {
    const [vehicles, trips, drivers] = await Promise.all([
      prisma.vehicle.findMany({ select: { id: true, regNumber: true, name: true, status: true } }),
      prisma.trip.findMany({ select: { status: true, vehicleId: true } }),
      prisma.driver.findMany({ select: { status: true } }),
    ]);

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'ON_TRIP').length;
    const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
    const inMaintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === 'IN_SHOP').length;
    const nonRetiredVehicles = vehicles.filter((v) => v.status !== 'RETIRED').length;

    const totalTrips = trips.length;
    const dispatchedTrips = trips.filter((trip) => trip.status === 'DISPATCHED').length;
    const completedTrips = trips.filter((trip) => trip.status === 'COMPLETED').length;
    const pendingTrips = trips.filter((trip) => trip.status === 'DRAFT').length;
    const driversOnDuty = drivers.filter((driver) => driver.status === 'ON_TRIP').length;

    const fleetUtilizationRate = totalVehicles === 0 ? 0 : Number((((activeVehicles + dispatchedTrips) / totalVehicles) * 100).toFixed(2));
    const fleetUtilizationPct = nonRetiredVehicles === 0 ? 0 : Number(((activeVehicles / nonRetiredVehicles) * 100).toFixed(2));

    const vehicleDetails = vehicles.map((v) => {
      const vehicleTrips = trips.filter((t) => t.vehicleId === v.id);
      const vehicleCompletedCount = vehicleTrips.filter((t) => t.status === 'COMPLETED').length;
      const vehicleDispatchedCount = vehicleTrips.filter((t) => t.status === 'DISPATCHED').length;

      return {
        vehicleId: v.id,
        regNumber: v.regNumber,
        name: v.name,
        status: v.status,
        tripsCount: vehicleTrips.length,
        completedCount: vehicleCompletedCount,
        dispatchedCount: vehicleDispatchedCount,
      };
    });

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
        fleetUtilizationRate,
        fleetUtilizationPct,
        vehicles: vehicleDetails,
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getOperationalCost = async (req, res) => {
  try {
    const summary = await buildCostSummary();

    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: { select: { cost: true } },
        maintenanceLogs: { select: { cost: true } },
        expenses: { select: { amount: true } }
      }
    });

    const data = vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
      const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
      const totalCost = fuelCost + maintenanceCost;

      return {
        vehicleId: v.id,
        regNumber: v.regNumber,
        name: v.name,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalCost,
      };
    });

    return res.json({
      operationalCost: {
        totalCost: summary.totalCost,
        fuelCost: summary.fuelCost,
        maintenanceCost: summary.maintenanceCost,
        expenseCost: summary.expenseCost,
        vehicles: data,
      },
    });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.getRoi = async (req, res) => {
  try {
    const [summary, vehicles] = await Promise.all([
      buildCostSummary(),
      prisma.vehicle.findMany({
        include: {
          fuelLogs: { select: { cost: true } },
          maintenanceLogs: { select: { cost: true } },
          trips: {
            where: { status: 'COMPLETED' },
            select: { plannedDistKm: true },
          },
        },
      }),
    ]);

    const estimatedRevenuePerKm = Number(process.env.REVENUE_PER_KM || 12);

    let totalFleetDistanceKm = 0;
    const data = vehicles.map((v) => {
      const completedTrips = v.trips || [];
      const vehicleDistanceKm = completedTrips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
      totalFleetDistanceKm += vehicleDistanceKm;

      const revenue = vehicleDistanceKm * estimatedRevenuePerKm;
      const fuelCost = v.fuelLogs.reduce((sum, f) => sum + Number(f.cost || 0), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
      const totalCost = fuelCost + maintenanceCost;
      const vehicleRoi = v.acquisitionCost === 0 ? 0 : ((revenue - totalCost) / v.acquisitionCost) * 100;

      return {
        vehicleId: v.id,
        regNumber: v.regNumber,
        name: v.name,
        acquisitionCost: v.acquisitionCost,
        actualDistanceKm: Number(vehicleDistanceKm.toFixed(2)),
        revenue: Number(revenue.toFixed(2)),
        fuelCost,
        maintenanceCost,
        roiPercent: Number(vehicleRoi.toFixed(2)),
      };
    });

    const estimatedRevenue = totalFleetDistanceKm * estimatedRevenuePerKm;
    const roiPercent = summary.totalCost === 0 ? 0 : ((estimatedRevenue - summary.totalCost) / summary.totalCost) * 100;

    return res.json({
      roi: {
        estimatedRevenuePerKm,
        totalCompletedDistanceKm: Number(totalFleetDistanceKm.toFixed(2)),
        estimatedRevenue: Number(estimatedRevenue.toFixed(2)),
        totalCost: summary.totalCost,
        roiPercent: Number(roiPercent.toFixed(2)),
        vehicles: data,
      },
    });

  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const { report } = req.query;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transitops-${report || 'summary'}-report.csv"`);

    if (report === 'fuel-efficiency') {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          fuelLogs: { select: { liters: true } },
          trips: {
            where: { status: 'COMPLETED' },
            select: { plannedDistKm: true },
          },
        },
      });
      const rows = [
        asCsvRow(['Vehicle ID', 'Registration Number', 'Name', 'Actual Distance (km)', 'Total Fuel (Liters)', 'Fuel Efficiency (km/L)'])
      ];
      for (const v of vehicles) {
        const completedTrips = v.trips || [];
        const totalDistance = completedTrips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
        const totalFuel = v.fuelLogs.reduce((sum, f) => sum + (f.liters || 0), 0);
        const efficiency = totalFuel === 0 ? 0 : totalDistance / totalFuel;
        rows.push(asCsvRow([v.id, v.regNumber, v.name, totalDistance.toFixed(2), totalFuel.toFixed(2), efficiency.toFixed(2)]));
      }
      return res.send(rows.join('\n'));
    }

    if (report === 'utilization') {
      const [vehicles, trips, drivers] = await Promise.all([
        prisma.vehicle.findMany({ select: { id: true, regNumber: true, name: true, status: true } }),
        prisma.trip.findMany({ select: { status: true, vehicleId: true } }),
        prisma.driver.findMany({ select: { status: true } }),
      ]);
      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
      const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
      const inMaintenanceVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;
      const nonRetiredVehicles = vehicles.filter(v => v.status !== 'RETIRED').length;
      const fleetUtilizationPct = nonRetiredVehicles === 0 ? 0 : (activeVehicles / nonRetiredVehicles) * 100;

      const rows = [
        asCsvRow(['Metric', 'Value']),
        asCsvRow(['Total Vehicles', totalVehicles]),
        asCsvRow(['Non-Retired Vehicles', nonRetiredVehicles]),
        asCsvRow(['Active Vehicles (On Trip)', activeVehicles]),
        asCsvRow(['Available Vehicles', availableVehicles]),
        asCsvRow(['In Shop Vehicles', inMaintenanceVehicles]),
        asCsvRow(['Drivers On Duty', drivers.filter(d => d.status === 'ON_TRIP').length]),
        asCsvRow(['Fleet Utilization (%)', fleetUtilizationPct.toFixed(2)])
      ];
      return res.send(rows.join('\n'));
    }

    if (report === 'operational-cost') {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          fuelLogs: { select: { cost: true } },
          maintenanceLogs: { select: { cost: true } },
          expenses: { select: { amount: true } }
        }
      });
      const rows = [
        asCsvRow(['Vehicle ID', 'Registration Number', 'Name', 'Fuel Cost (₹)', 'Maintenance Cost (₹)', 'Expense Cost (₹)', 'Total Operational Cost (₹)'])
      ];
      for (const v of vehicles) {
        const fuelCost = v.fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
        const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
        const expenseCost = v.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalCost = fuelCost + maintenanceCost;
        rows.push(asCsvRow([v.id, v.regNumber, v.name, fuelCost, maintenanceCost, expenseCost, totalCost]));
      }
      return res.send(rows.join('\n'));
    }

    if (report === 'roi') {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          fuelLogs: { select: { cost: true } },
          maintenanceLogs: { select: { cost: true } },
          trips: {
            where: { status: 'COMPLETED' },
            select: { plannedDistKm: true },
          },
        }
      });
      const estimatedRevenuePerKm = Number(process.env.REVENUE_PER_KM || 12);
      const rows = [
        asCsvRow(['Vehicle ID', 'Registration Number', 'Name', 'Acquisition Cost (₹)', 'Actual Distance (km)', 'Est. Revenue (₹)', 'Fuel Cost (₹)', 'Maintenance Cost (₹)', 'ROI (%)'])
      ];
      for (const v of vehicles) {
        const completedTrips = v.trips || [];
        const vehicleDistanceKm = completedTrips.reduce((sum, trip) => sum + Number(trip.plannedDistKm || 0), 0);
        const revenue = vehicleDistanceKm * estimatedRevenuePerKm;
        const fuelCost = v.fuelLogs.reduce((sum, f) => sum + Number(f.cost || 0), 0);
        const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
        const totalCost = fuelCost + maintenanceCost;
        const roiPercent = v.acquisitionCost === 0 ? 0 : ((revenue - totalCost) / v.acquisitionCost) * 100;
        rows.push(asCsvRow([v.id, v.regNumber, v.name, v.acquisitionCost, vehicleDistanceKm.toFixed(2), revenue.toFixed(2), fuelCost, maintenanceCost, roiPercent.toFixed(2)]));
      }
      return res.send(rows.join('\n'));
    }

    // Default fallback: general summary
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
    return res.send(rows.join('\n'));
  } catch (error) {
    return handlePrismaError(res, error);
  }
};
