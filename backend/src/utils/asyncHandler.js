/**
 * asyncHandler — High-order function wrapping async route handlers / controllers.
 *
 * Eliminates repetitive try/catch boilerplate across every route,
 * ensuring any unhandled promise rejections are automatically forwarded to
 * Express's next() error middleware.
 *
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
