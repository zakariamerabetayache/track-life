const { AppError } = require('../utils/errors');

/**
 * Senior Global Centralized Error Handling Middleware.
 *
 * Responsibilities:
 * 1. Transform low-level driver/database exceptions into client-safe domain responses.
 * 2. Handle ORM/Prisma codes (P2002, P2025, P2003, P2021, etc.).
 * 3. Handle malformed JSON request bodies.
 * 4. Separate operational (safe for users) vs programmer/system errors.
 * 5. Provide structured logging for observability.
 * 6. Guarantee a predictable, consistent error response schema across all endpoints.
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let errors = err.errors || {};

  // ── 1. Malformed JSON Body (Express parser) ──────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'MALFORMED_JSON';
    message = 'Malformed JSON syntax in request body.';
  }

  // ── 2. Prisma Known Request Errors ───────────────────────────────────────
  if (err.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        code = 'CONFLICT';
        const fields = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
        message = `A record with this ${fields} already exists.`;
        if (err.meta?.target) {
          const targetKey = Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target;
          errors = { [targetKey]: [`Already in use`] };
        }
        break;
      }
      case 'P2025': {
        statusCode = 404;
        code = 'NOT_FOUND';
        message = err.meta?.cause || 'Requested record was not found.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        code = 'FOREIGN_KEY_VIOLATION';
        message = `Related record not found (${err.meta?.field_name || 'relation constraint failed'}).`;
        break;
      }
      case 'P2021': {
        statusCode = 500;
        code = 'DATABASE_TABLE_MISSING';
        message = `Database table does not exist: ${err.meta?.table || 'unknown'}. Please run database migrations.`;
        break;
      }
      case 'P2024': {
        statusCode = 503;
        code = 'DATABASE_CONNECTION_TIMEOUT';
        message = 'Timed out connecting to the database pool.';
        break;
      }
      default: {
        statusCode = 400;
        code = `PRISMA_${err.code}`;
        message = err.message.split('\n').pop() || 'Database request error.';
        break;
      }
    }
  }

  // ── 3. Prisma Validation Errors ──────────────────────────────────────────
  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
    message = 'Invalid data provided to database query.';
  }

  // ── 4. Prisma Initialization / Connection Errors ────────────────────────
  if (err.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Could not establish connection to the database.';
  }

  // ── 5. Operational vs Internal Unknown Error Sanitization ────────────────
  const isOperational = err.isOperational || statusCode < 500;
  const isDev = process.env.NODE_ENV !== 'production';

  // In production, sanitize 500 error messages to prevent leaking internals
  if (!isOperational && !isDev) {
    message = 'Internal server error. Please try again later.';
  }

  // ── 6. Structured Logging ────────────────────────────────────────────────
  if (statusCode >= 500) {
    console.error(`[ERROR 5xx] ${req.method} ${req.originalUrl || req.url} | Code: ${code} | Message: ${err.message}`);
    if (err.stack) console.error(err.stack);
  } else if (isDev) {
    console.warn(`[WARN ${statusCode}] ${req.method} ${req.originalUrl || req.url} | Code: ${code} | Message: ${message}`);
  }

  // ── 7. Unified Response Payload ──────────────────────────────────────────
  return res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    path: req.originalUrl || req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
