const { z } = require('zod');

// ── ID param schema ──────────────────────────────────────────────────────────
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be an integer')
    .transform(Number)
    .pipe(z.number().int().positive('ID must be a positive integer')),
});

// ── List / search / filter / paginate ────────────────────────────────────────
const listGoalsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1, 'Page must be at least 1')),

  pageSize: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100, 'Page size cannot exceed 100')),

  search: z.string().optional().default(''),

  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),

  sortBy: z
    .enum(['title', 'created_at', 'updated_at', 'sort_order', 'times_a_day'])
    .optional()
    .default('created_at'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ── Create ────────────────────────────────────────────────────────────────────
const createGoalSchema = z.object({
  title:       z.string({ required_error: 'Title is required' }).trim().min(1, 'Title is required').max(255),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  is_fixed:    z.boolean().optional().default(true),
  is_daily:    z.boolean().optional().default(true),
  times_a_day: z.coerce.number().int().min(1).max(20).optional().default(1),
  is_active:   z.boolean().optional().default(true),
  sort_order:  z.coerce.number().int().min(0).optional().default(0),
});

// ── Update ────────────────────────────────────────────────────────────────────
const updateGoalSchema = z.object({
  title:       z.string().trim().min(1).max(255).optional(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  is_fixed:    z.boolean().optional(),
  is_daily:    z.boolean().optional(),
  times_a_day: z.coerce.number().int().min(1).max(20).optional(),
  is_active:   z.boolean().optional(),
  sort_order:  z.coerce.number().int().min(0).optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided to update' }
);

// ── Toggle Status ────────────────────────────────────────────────────────────
const toggleGoalSchema = z.object({
  is_active: z.boolean().optional(),
});

module.exports = {
  idParamSchema,
  listGoalsSchema,
  createGoalSchema,
  updateGoalSchema,
  toggleGoalSchema,
};
