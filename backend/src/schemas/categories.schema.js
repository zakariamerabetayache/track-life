const { z } = require('zod');

// ── ID param schema ──────────────────────────────────────────────────────────
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be an integer')
    .transform(Number)
    .pipe(z.number().int().positive('ID must be a positive integer')),
});

// ── List / search / paginate ────────────────────────────────────────────────
const listCategoriesSchema = z.object({
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

  all: z.enum(['true', 'false']).optional(),

  sortBy: z
    .enum(['name', 'sort_order', 'created_at', 'updated_at'])
    .optional()
    .default('sort_order'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// ── Create ────────────────────────────────────────────────────────────────────
const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a 6-digit hex like #6366F1')
    .optional()
    .default('#6366F1'),

  sort_order: z.coerce
    .number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order cannot be negative')
    .optional()
    .default(0),
});

// ── Update ────────────────────────────────────────────────────────────────────
const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),

    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a 6-digit hex like #6366F1')
      .optional(),

    sort_order: z.coerce
      .number()
      .int('Sort order must be an integer')
      .min(0, 'Sort order cannot be negative')
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update' }
  );

module.exports = {
  idParamSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
};
