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


// ── GET /api/day-goals/dashboard/bad-habits ───────────────────────────────────

const getBadHubbitsStatus = async (req, res, next) => {
  try {
    // Fetch bad habits from the database
    const badHabits = await prisma.goal.findMany({
      where: {
        category: { name: 'Bad Habbits' },
       
        },
   
    });



    res.json({ success: true, data: {badHabits :badHabits ,badHabits_tusus: [
  {
    name: "Smoking",
    count_list: [
      { count: 43, date_from: "2026-06-21", date_to: "2026-08-02" },
      { count: 18, date_from: "2026-05-28", date_to: "2026-06-14" },
      { count: 9, date_from: "2026-05-12", date_to: "2026-05-20" },
      { count: 5, date_from: "2026-04-30", date_to: "2026-05-04" },
      { count: 3, date_from: "2026-04-18", date_to: "2026-04-20" },
      { count: 14, date_from: "2026-03-15", date_to: "2026-03-28" },
      { count: 0, date_from: "2026-02-22", date_to: "2026-02-27" },
    ].reverse(), // Reverse to have the most recent first
  },

  {
    name: "Wasting Time",
    count_list: [
      { count: 12, date_from: "2026-07-22", date_to: "2026-08-02" },
      { count: 21, date_from: "2026-06-18", date_to: "2026-07-08" },
      { count: 14, date_from: "2026-05-27", date_to: "2026-06-09" },
      { count: 7, date_from: "2026-05-10", date_to: "2026-05-16" },
      { count: 4, date_from: "2026-04-25", date_to: "2026-04-28" },
      { count: 17, date_from: "2026-03-29", date_to: "2026-04-14" },
      { count: 8, date_from: "2026-02-18", date_to: "2026-02-25" },
    ].reverse(), // Reverse to have the most recent first
  },

  {
    name: "Sleeping Late",
    count_list: [
      { count: 67, date_from: "2026-05-28", date_to: "2026-08-02" },
      { count: 24, date_from: "2026-04-22", date_to: "2026-05-15" },
      { count: 11, date_from: "2026-03-28", date_to: "2026-04-07" },
      { count: 8, date_from: "2026-03-10", date_to: "2026-03-17" },
      { count: 3, date_from: "2026-02-25", date_to: "2026-02-27" },
      { count: 15, date_from: "2026-01-30", date_to: "2026-02-13" },
      { count: 10, date_from: "2026-01-10", date_to: "2026-01-19" },
    ].reverse(), // Reverse to have the most recent first
  },

  {
    name: "Watching Porn",
    count_list: [
      { count: 31, date_from: "2026-07-03", date_to: "2026-08-02" },
      { count: 19, date_from: "2026-06-05", date_to: "2026-06-23" },
      { count: 12, date_from: "2026-05-11", date_to: "2026-05-22" },
      { count: 6, date_from: "2026-04-18", date_to: "2026-04-23" },
      { count: 2, date_from: "2026-04-01", date_to: "2026-04-02" },
      { count: 16, date_from: "2026-03-05", date_to: "2026-03-20" },
      { count: 9, date_from: "2026-02-12", date_to: "2026-02-20" },
    ].reverse(),
   },

  {
    name: "Skipping Workout",
    count_list: [
      { count: 9, date_from: "2026-07-25", date_to: "2026-08-02" },
      { count: 16, date_from: "2026-06-29", date_to: "2026-07-14" },
      { count: 10, date_from: "2026-05-30", date_to: "2026-06-08" },
      { count: 5, date_from: "2026-05-12", date_to: "2026-05-16" },
      { count: 3, date_from: "2026-04-20", date_to: "2026-04-22" },
      { count: 18, date_from: "2026-03-18", date_to: "2026-04-04" },
      { count: 7, date_from: "2026-02-08", date_to: "2026-02-14" },
    ].reverse(), 
  },

  {
    name: "Eating Junk Food",
    count_list: [
      { count: 25, date_from: "2026-07-09", date_to: "2026-08-02" },
      { count: 14, date_from: "2026-06-10", date_to: "2026-06-23" },
      { count: 8, date_from: "2026-05-14", date_to: "2026-05-21" },
      { count: 6, date_from: "2026-04-30", date_to: "2026-05-05" },
      { count: 2, date_from: "2026-04-08", date_to: "2026-04-09" },
      { count: 13, date_from: "2026-03-12", date_to: "2026-03-24" },
      { count: 5, date_from: "2026-02-15", date_to: "2026-02-19" },
    ].reverse(), 
  },

  {
    name: "Overthinking",
    count_list: [
      { count: 54, date_from: "2026-06-10", date_to: "2026-08-02" },
      { count: 27, date_from: "2026-05-01", date_to: "2026-05-27" },
      { count: 15, date_from: "2026-04-03", date_to: "2026-04-17" },
      { count: 7, date_from: "2026-03-18", date_to: "2026-03-24" },
      { count: 4, date_from: "2026-02-26", date_to: "2026-03-01" },
      { count: 20, date_from: "2026-01-28", date_to: "2026-02-16" },
      { count: 11, date_from: "2026-01-05", date_to: "2026-01-15" },
    ].reverse(),
  },
]}});
  } catch (error) {
    next(error);
  }
};

module.exports = { create, remove, update, getBadHubbitsStatus }; 

