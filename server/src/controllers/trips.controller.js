const prisma = require('../lib/prisma');
const { handlePrismaError, parseNumber, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
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
    const { source, destination, cargoWeightKg, plannedDistKm, vehicleId, driverId, status } = req.body;

    if (!source || !destination || cargoWeightKg === undefined || plannedDistKm === undefined || !vehicleId || !driverId) {
      return res.status(400).json({ error: 'source, destination, cargoWeightKg, plannedDistKm, vehicleId, and driverId are required.' });
    }

    const trip = await prisma.trip.create({
      data: {
        source,
        destination,
        cargoWeightKg: parseNumber(cargoWeightKg, 'cargoWeightKg'),
        plannedDistKm: parseNumber(plannedDistKm, 'plannedDistKm'),
        vehicleId,
        driverId,
        status,
      },
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

    const updatedTrip = await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } });
      return tx.trip.update({ where: { id }, data: { status: 'DISPATCHED' } });
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
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DISPATCHED') {
      return res.status(400).json({ error: 'Only dispatched trips can be completed.' });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const parsedOdometer = finalOdometer === undefined ? undefined : parseNumber(finalOdometer, 'finalOdometer');

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE', ...(parsedOdometer === undefined ? {} : { odometer: parsedOdometer }) },
      });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });

      return tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          finalOdometer: finalOdometer === undefined ? undefined : parseNumber(finalOdometer, 'finalOdometer'),
          fuelConsumedL: fuelConsumedL === undefined ? undefined : parseNumber(fuelConsumedL, 'fuelConsumedL'),
        },
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

    if (trip.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Completed trips cannot be cancelled.' });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
      return tx.trip.update({ where: { id }, data: { status: 'CANCELLED' } });
    });

    return res.json({ trip: updatedTrip });
  } catch (error) {
    return handlePrismaError(res, error, 'Trip not found.');
  }
};
