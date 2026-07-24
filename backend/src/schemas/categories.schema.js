const { z } = require('zod');

// ── Create ────────────────────────────────────────────────────────────────────
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a 6-digit hex like #6366F1')
    .optional()
    .default('#6366F1'),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
});

// ── Update ────────────────────────────────────────────────────────────────────
const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
}).strict(); // reject unknown keys

module.exports = { createCategorySchema, updateCategorySchema };
