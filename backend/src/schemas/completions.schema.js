const { z } = require('zod');

const toggleCompletionSchema = z.object({
  day_goal_id:      z.coerce.number().int().positive('day_goal_id is required'),
  occurrence_index: z.coerce.number().int().min(0),
  is_completed:     z.boolean(),
});

module.exports = { toggleCompletionSchema };
