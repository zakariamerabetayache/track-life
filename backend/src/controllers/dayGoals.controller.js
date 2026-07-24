const prisma = require('../db/prisma');

// ── POST /api/day-goals ────────────────────────────────────────────────────────
// Can create a brand-new goal on the fly via new_goal, OR link an existing goal_id.
// Both operations are wrapped in a Prisma transaction so they succeed or fail together.
const create = async (req, res, next) => {
  try {
    const { week_id, day_of_week, goal_id, new_goal, prayer_time } = req.body;

    // Run in a transaction: if the new_goal create fails, the dayGoal isn't created
    const dayGoal = await prisma.$transaction(async (tx) => {
      let actualGoalId = goal_id;

      // Create the goal on the fly if requested
      if (new_goal) {
        const created = await tx.goal.create({
          data: {
            title: new_goal.title,
            category_id: new_goal.category_id ?? null,
            is_fixed: false, // on-the-fly goals are never fixed
            times_a_day: new_goal.times_a_day ?? 1,
          },
          select: { id: true },
        });
        actualGoalId = created.id;
      }

      return tx.dayGoal.create({
        data: {
          week_id,
          day_of_week,
          goal_id: actualGoalId,
          is_auto: false,
          prayer_time: prayer_time ?? null,
        },
        include: {
          goal: { include: { category: true } },
          completions: true,
        },
      });
    });

    res.status(201).json({ success: true, data: dayGoal });
  } catch (error) {
    // P2002 = unique constraint — goal already added to this day
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This goal is already added to that day.',
      });
    }
    next(error);
  }
};

// ── DELETE /api/day-goals/:id ──────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // findUniqueOrThrow — lets the global error handler return a clean 404
    const dayGoal = await prisma.dayGoal.findUniqueOrThrow({ where: { id } });

    if (dayGoal.is_auto) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove automatically scheduled fixed goals.',
      });
    }

    await prisma.dayGoal.delete({ where: { id } });

    res.json({ success: true, message: 'Goal removed from day.' });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/day-goals/:id ─────────────────────────────────────────────────────
// Updates time_from, time_to, and/or prayer_time on a day goal.
// id is now taken from the URL param, not the request body.
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid day goal id.' });
    }

    const { prayer_time, time_from, time_to } = req.body;

    const dayGoal = await prisma.dayGoal.update({
      where: { id },
      data: {
        ...(prayer_time !== undefined && { prayer_time: prayer_time ?? null }),
        ...(time_from !== undefined  && { time_from:   time_from  ?? null }),
        ...(time_to   !== undefined  && { time_to:     time_to    ?? null }),
      },
      include: {
        goal: { include: { category: true } },
        completions: true,
      },
    });

    res.json({ success: true, data: dayGoal });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, remove, update };
