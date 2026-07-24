/**
 * Global error handler middleware.
 * Must be registered last (after all routes) in index.js.
 * Express identifies this as an error handler by its 4-argument signature.
 */
const errorHandler = (err, req, res, next) => {
  // Prisma known error codes
  const prismaErrors = {
    P2002: { status: 409, message: 'A record with this value already exists.' },
    P2025: { status: 404, message: 'Record not found.'                        },
    P2003: { status: 400, message: 'Related record not found.'                },
    P2014: { status: 400, message: 'Invalid relation data.'                   },
  };

  if (err.code && prismaErrors[err.code]) {
    const { status, message } = prismaErrors[err.code];
    return res.status(status).json({ success: false, message });
  }

  // Log unexpected errors in full
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.error(err.stack || err.message);
  }

  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Internal Server Error';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
