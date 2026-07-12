const duplicateKeyPattern = /(Unique constraint failed|duplicate key value violates unique constraint)/i;

function handlePrismaError(res, error, notFoundMessage) {
  if (error?.code === 'P2025') {
    return res.status(404).json({ error: notFoundMessage || 'Record not found.' });
  }

  if (error?.code === 'P2002' || duplicateKeyPattern.test(error?.message || '')) {
    return res.status(409).json({ error: 'A record with the same unique field already exists.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
}

function parseNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error(`${fieldName} must be a valid number.`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function parseDate(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${fieldName} must be a valid date.`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function sendValidationError(res, error) {
  const statusCode = error.statusCode || 400;
  return res.status(statusCode).json({ error: error.message || 'Invalid request.' });
}

function asCsvRow(values) {
  return values.map((value) => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
  }).join(',');
}

module.exports = {
  handlePrismaError,
  parseNumber,
  parseDate,
  sendValidationError,
  asCsvRow,
};