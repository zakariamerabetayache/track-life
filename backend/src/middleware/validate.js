const { z } = require('zod');

/**
 * validate(schema) — Express middleware factory.
 *
 * Usage:
 *   router.post('/', validate(mySchema), myController.create);
 *
 * On success:  req.body is replaced with the parsed + coerced Zod output.
 * On failure:  returns 400 with { success: false, message, errors }
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Replace req.body with the clean, coerced, default-filled Zod output
  req.body = result.data;
  next();
};

module.exports = validate;
