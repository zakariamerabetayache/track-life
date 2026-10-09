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
// Validates query-string parameters for GET /api/reminders
// Every field has a safe default so the controller never receives undefined.
const listRemindersSchema = z.object({
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

  // "all" → no filter, "active" → is_active=true, "inactive" → is_active=false
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),

  // Allowlisted columns only — prevents SQL-injection-like orderBy abuse
  sortBy: z
    .enum(['title', 'created_at', 'updated_at'])
    .optional()
    .default('created_at'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ── Create ───────────────────────────────────────────────────────────────────
const createReminderSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title cannot exceed 255 characters'),

  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Content is required'),

  is_active: z.boolean().optional().default(true),
});

// ── Update (partial) ─────────────────────────────────────────────────────────
// Every field is optional so the client can send only what changed.
const updateReminderSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title cannot exceed 255 characters')
      .optional(),

    content: z
      .string()
      .trim()
      .min(1, 'Content cannot be empty')
      .optional(),

    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update' }
  );

module.exports = {
  idParamSchema,
  listRemindersSchema,
  createReminderSchema,
  updateReminderSchema,
};
