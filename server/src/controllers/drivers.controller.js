const prisma = require('../lib/prisma');
const { handlePrismaError, parseDate, parseNumber, sendValidationError } = require('../utils/controllerHelpers');
const { setDriverStatus } = require('../services/statusService');

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const drivers = await prisma.driver.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const driversWithExpiry = drivers.map((driver) => ({
      ...driver,
      licenseExpired: new Date(driver.licenseExpiry) < now,
    }));

    return res.json({ drivers: driversWithExpiry });
  } catch (error) {
    return handlePrismaError(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !contactNumber) {
      return res.status(400).json({ error: 'name, licenseNumber, licenseCategory, licenseExpiry, and contactNumber are required.' });
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: parseDate(licenseExpiry, 'licenseExpiry'),
        contactNumber,
        safetyScore: safetyScore === undefined ? 100 : parseNumber(safetyScore, 'safetyScore'),
        status: status || 'AVAILABLE',
      },
    });

    return res.status(201).json({ driver });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A driver with this license number already exists.' });
    }
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Driver not found.');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...otherData } = req.body;

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    if (status !== undefined) {
      try {
        await setDriverStatus(id, status);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    const data = {};
    if (otherData.name !== undefined) data.name = otherData.name;
    if (otherData.licenseNumber !== undefined) data.licenseNumber = otherData.licenseNumber;
    if (otherData.licenseCategory !== undefined) data.licenseCategory = otherData.licenseCategory;
    if (otherData.licenseExpiry !== undefined) data.licenseExpiry = parseDate(otherData.licenseExpiry, 'licenseExpiry');
    if (otherData.contactNumber !== undefined) data.contactNumber = otherData.contactNumber;
    if (otherData.safetyScore !== undefined) data.safetyScore = parseNumber(otherData.safetyScore, 'safetyScore');

    let updatedDriver = driver;
    if (Object.keys(data).length > 0) {
      updatedDriver = await prisma.driver.update({
        where: { id },
        data,
      });
    } else if (status !== undefined) {
      updatedDriver = await prisma.driver.findUnique({ where: { id } });
    }

    return res.json({ driver: updatedDriver });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A driver with this license number already exists.' });
    }
    if (error.statusCode) {
      return sendValidationError(res, error);
    }
    return handlePrismaError(res, error, 'Driver not found.');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const tripCount = await prisma.trip.count({ where: { driverId: id } });
    if (tripCount > 0) {
      return res.status(409).json({
        error: `Cannot delete driver — they have ${tripCount} trip(s) linked to them. Delete the trips first, or set the driver to OFF_DUTY/SUSPENDED instead.`,
      });
    }

    await prisma.driver.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(res, error, 'Driver not found.');
  }
};
