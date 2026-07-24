const { z } = require('zod');

const createDayGoalSchema = z
  .object({
    week_id: z.coerce.number().int().positive('week_id is required'),
    day_of_week: z.coerce.number().int().min(0).max(6, 'day_of_week must be 0–6'),
    goal_id: z.coerce.number().int().positive().optional(),
    prayer_time: z.string().max(50).nullable().optional(),
    new_goal: z.object({
      title: z.string().min(1, 'Title is required').max(255),
      category_id: z.coerce.number().int().positive().nullable().optional(),
      times_a_day: z.coerce.number().int().min(1).max(20).optional().default(1),
    }).optional(),
  })
  .refine((data) => data.goal_id || data.new_goal, {
    message: 'Provide either goal_id or new_goal',
    path: ['goal_id'],
  });

const updateDayGoalSchema = z.object({
  prayer_time: z
    .string()
    .max(50)
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v)),

  time_from: z
    .string()
    .max(8)
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v)),

  time_to: z
    .string()
    .max(8)
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v)),
});

module.exports = { createDayGoalSchema, updateDayGoalSchema };
