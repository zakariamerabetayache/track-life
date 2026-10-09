const { ValidationError } = require('../utils/errors');

/**
 * Helper to format Zod error issues into a clean, normalized field map:
 * { [field]: ["message 1", "message 2"] }
 */
const formatZodErrors = (error) => {
  const formatted = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'general';
    if (!formatted[key]) {
      formatted[key] = [];
    }
    formatted[key].push(issue.message);
  }
  return formatted;
};

/**
 * validate(schema) — Validates request BODY against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    return next(new ValidationError('Request body validation failed', errors));
  }

  req.body = result.data;
  req.validatedBody = result.data;
  next();
};

/**
 * validateQuery(schema) — Validates request QUERY parameters against a Zod schema.
 * Note: Express 5 defines req.query via prototype getter, so Object.defineProperty
 * is used to safely override it with the coerced/parsed data.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    return next(new ValidationError('Invalid query parameters', errors));
  }

  req.validatedQuery = result.data;
  Object.defineProperty(req, 'query', {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
};

/**
 * validateParams(schema) — Validates route PARAMS (e.g., /:id) against a Zod schema.
 */
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    return next(new ValidationError('Invalid route parameters', errors));
  }

  req.validatedParams = result.data;
  Object.defineProperty(req, 'params', {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
};

module.exports = { validate, validateQuery, validateParams, formatZodErrors };
