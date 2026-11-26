const { z } = require('zod');

// ── HH:MM validator ───────────────────────────────────────────────────────────
const timeField = z.preprocess(
  (v) => (v === '' ? null : v),
  z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:MM format (24h)')
    .nullable()
    .optional()
);

// ── Upsert (partial — only provided fields are written) ───────────────────────
const upsertDailyInsightSchema = z
  .object({
    week_id: z.coerce.number().int().positive('week_id is required'),
    day_of_week: z.coerce.number().int().min(0).max(6, 'day_of_week must be 0–6'),

    sleep_time: timeField,
    wake_up_time: timeField,

    energy: z.coerce.number().int().min(1).max(10).nullable().optional(),
    focus: z.coerce.number().int().min(1).max(10).nullable().optional(),
    satisfaction: z.coerce.number().int().min(1).max(10).nullable().optional(),

    work_hours: z.coerce.number().min(0).max(24).nullable().optional(),

    evaluation: z.string().trim().max(5000).nullable().optional().transform((v) => v === '' ? null : v),
    lesson: z.string().trim().max(5000).nullable().optional().transform((v) => v === '' ? null : v),
  })
  .refine(
    (d) => {
      const keys = ['sleep_time', 'wake_up_time', 'energy', 'focus', 'satisfaction', 'work_hours', 'evaluation', 'lesson'];
      return keys.some((k) => d[k] !== undefined);
    },
    { message: 'At least one field must be provided' }
  );

// ── List / paginate ───────────────────────────────────────────────────────────
const listDailyInsightsSchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().min(1)),
  pageSize: z.string().optional().default('20').transform(Number).pipe(z.number().int().min(1).max(100)),
  search: z.string().optional().default(''),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number).pipe(z.number().int().positive()),
});

module.exports = { upsertDailyInsightSchema, listDailyInsightsSchema, idParamSchema };
