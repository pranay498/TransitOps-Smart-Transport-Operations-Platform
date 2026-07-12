const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');
const { setVehicleStatus, setDriverStatus } = require('../services/statusService');

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const trips = await prisma.trip.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ trips });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { source, destination, cargoWeightKg, plannedDistKm, vehicleId, driverId } = req.body;

    if (!source || !destination || cargoWeightKg === undefined || plannedDistKm === undefined || !vehicleId || !driverId) {
      return res.status(400).json({ error: 'source, destination, cargoWeightKg, plannedDistKm, vehicleId, and driverId are required.' });
    }

    const parsedCargoWeight = parseNumber(cargoWeightKg, 'cargoWeightKg');
    const parsedPlannedDist = parseNumber(plannedDistKm, 'plannedDistKm');

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found.' });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return res.status(400).json({ error: 'Driver not found.' });
    }

    if (parsedCargoWeight > vehicle.maxLoadKg) {
      return res.status(400).json({ error: `Cargo weight exceeds vehicle max load of ${vehicle.maxLoadKg} kg.` });
    }

    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected vehicle is not AVAILABLE.' });
    }

    if (driver.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected driver is not AVAILABLE.' });
    }

    const now = new Date();
    if (new Date(driver.licenseExpiry) < now) {
      return res.status(400).json({ error: 'Selected driver license has expired.' });
    }

    const trip = await prisma.trip.create({
      data: {
        source,
        destination,
        cargoWeightKg: parsedCargoWeight,
        plannedDistKm: parsedPlannedDist,
        vehicleId,
        driverId,
        status: 'DRAFT',
      },
      include: { vehicle: true, driver: true },
    });

    return res.status(201).json({ trip });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Trip not found.');
  }
};

exports.dispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft trips can be dispatched.' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: trip.driverId } });

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected vehicle is no longer AVAILABLE.' });
    }

    if (!driver || driver.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Selected driver is no longer AVAILABLE.' });
    }

    const now = new Date();
    if (new Date(driver.licenseExpiry) < now) {
      return res.status(400).json({ error: 'Selected driver license has expired.' });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      await setVehicleStatus(trip.vehicleId, 'ON_TRIP');
      await setDriverStatus(trip.driverId, 'ON_TRIP');
      
      return tx.trip.update({
        where: { id },
        data: { status: 'DISPATCHED' },
        include: { vehicle: true, driver: true },
      });
    });

    return res.json({ trip: updatedTrip });
  } catch (error) {
    return handlePrismaError(res, error, 'Trip not found.');
  }
};

exports.complete = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalOdometer, fuelConsumedL } = req.body;

    if (finalOdometer === undefined || fuelConsumedL === undefined) {
      return res.status(400).json({ error: 'finalOdometer and fuelConsumedL are required.' });
    }

    const parsedOdometer = parseNumber(finalOdometer, 'finalOdometer');
    const parsedFuel = parseNumber(fuelConsumedL, 'fuelConsumedL');

    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DISPATCHED') {
      return res.status(400).json({ error: 'Only dispatched trips can be completed.' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    if (parsedOdometer < vehicle.odometer) {
      return res.status(400).json({ error: `Final odometer (${parsedOdometer}) cannot be less than vehicle's current odometer (${vehicle.odometer} km).` });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      await setVehicleStatus(trip.vehicleId, 'AVAILABLE');
      await setDriverStatus(trip.driverId, 'AVAILABLE');

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { odometer: parsedOdometer },
      });

      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          liters: parsedFuel,
          cost: parsedFuel * 100,
          date: new Date(),
        },
      });

      return tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          finalOdometer: parsedOdometer,
          fuelConsumedL: parsedFuel,
        },
        include: { vehicle: true, driver: true },
      });
    });

    return res.json({ trip: updatedTrip });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Trip not found.');
  }
};

exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return res.status(400).json({ error: `Cannot cancel a trip in ${trip.status} status.` });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      if (trip.status === 'DISPATCHED') {
        await setVehicleStatus(trip.vehicleId, 'AVAILABLE');
        await setDriverStatus(trip.driverId, 'AVAILABLE');
      }

      return tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { vehicle: true, driver: true },
      });
    });

    return res.json({ trip: updatedTrip });
  } catch (error) {
    return handlePrismaError(res, error, 'Trip not found.');
  }
};
