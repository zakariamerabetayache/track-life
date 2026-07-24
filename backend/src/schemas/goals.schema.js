const { z } = require('zod');

// ── Create ────────────────────────────────────────────────────────────────────
const createGoalSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(255),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  is_fixed:    z.boolean().optional().default(true),
  is_daily:    z.boolean().optional().default(true),
  times_a_day: z.coerce.number().int().min(1).max(20).optional().default(1),
  sort_order:  z.coerce.number().int().min(0).optional().default(0),
});

// ── Update ────────────────────────────────────────────────────────────────────
const updateGoalSchema = z.object({
  title:       z.string().min(1).max(255).optional(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  is_fixed:    z.boolean().optional(),
  is_daily:    z.boolean().optional(),
  times_a_day: z.coerce.number().int().min(1).max(20).optional(),
  is_active:   z.boolean().optional(),
  sort_order:  z.coerce.number().int().min(0).optional(),
}).strict();

module.exports = { createGoalSchema, updateGoalSchema };
