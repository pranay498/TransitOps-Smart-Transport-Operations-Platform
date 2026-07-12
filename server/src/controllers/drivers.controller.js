const prisma = require('../lib/prisma');
const { handlePrismaError, parseDate, parseNumber, sendValidationError } = require('../utils/controllerHelpers');

exports.getAll = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json({ drivers });
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
        status,
      },
    });

    return res.status(201).json({ driver });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }

    return handlePrismaError(res, error, 'Driver not found.');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {};

    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.licenseNumber !== undefined) data.licenseNumber = req.body.licenseNumber;
    if (req.body.licenseCategory !== undefined) data.licenseCategory = req.body.licenseCategory;
    if (req.body.licenseExpiry !== undefined) data.licenseExpiry = parseDate(req.body.licenseExpiry, 'licenseExpiry');
    if (req.body.contactNumber !== undefined) data.contactNumber = req.body.contactNumber;
    if (req.body.safetyScore !== undefined) data.safetyScore = parseNumber(req.body.safetyScore, 'safetyScore');
    if (req.body.status !== undefined) data.status = req.body.status;

    const driver = await prisma.driver.update({
      where: { id },
      data,
    });

    return res.json({ driver });
  } catch (error) {
    if (error.statusCode) {
      return sendValidationError(res, error);
    }

    return handlePrismaError(res, error, 'Driver not found.');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.driver.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(res, error, 'Driver not found.');
  }
};
