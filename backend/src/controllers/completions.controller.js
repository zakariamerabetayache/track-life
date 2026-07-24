const prisma = require('../db/prisma');

// ── POST /api/completions/toggle ──────────────────────────────────────────────
// Uses upsert instead of nested try/catch — cleaner and atomic
const toggle = async (req, res, next) => {
  try {
    const { day_goal_id, occurrence_index, is_completed } = req.body;

    if (is_completed) {
      // upsert: create if missing, no-op if already exists
      // This replaces the old nested try/catch for P2002
      const completion = await prisma.completion.upsert({
        where: {
          day_goal_id_occurrence_index: { day_goal_id, occurrence_index },
        },
        create: { day_goal_id, occurrence_index },
        update: {}, // already completed — nothing to change
      });

      return res.status(201).json({ success: true, data: completion });
    } else {
      // deleteMany is idempotent — safe even if the record is already gone
      await prisma.completion.deleteMany({
        where: { day_goal_id, occurrence_index },
      });

      return res.json({ success: true, message: 'Completion removed.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { toggle };
