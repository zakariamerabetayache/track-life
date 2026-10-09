/**
 * Senior-level Domain Error Hierarchy.
 *
 * Distinguishes between operational errors (known, expected domain failures like
 * invalid input, not found, conflict) and programmer/system errors (bugs, db crash).
 *
 * Every error maintains:
 * - statusCode: HTTP status code (400, 404, 409, 422, 500, etc.)
 * - code: Machine-readable error code for frontend/API consumers
 * - isOperational: true for controlled application errors
 * - errors: Optional field-level error dictionary (e.g. for validation)
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST', errors = {}) {
    super(message, 400, code, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 422, 'VALIDATION_ERROR', errors);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
    this.isOperational = false;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
};
