const { z } = require('zod');

// ── Create ────────────────────────────────────────────────────────────────────
const createWeekGoalSchema = z.object({
    week_id: z.coerce.number().int().positive('week_id is required'),
    designation: z.string(),
    order: z.coerce.number().int().min(0).optional().default(0),
});

// ── Update ────────────────────────────────────────────────────────────────────
const updateWeekGoalSchema = z.object({
    week_id: z.coerce.number().int().positive('week_id is required').optional(),
    designation: z.string().optional(),
    is_checked: z.boolean().optional(),
    order: z.coerce.number().int().min(0).optional(),
}).strict(); // reject unknown keys

module.exports = { createWeekGoalSchema, updateWeekGoalSchema };
