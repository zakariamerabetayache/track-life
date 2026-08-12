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
        ...(time_from !== undefined && { time_from: time_from ?? null }),
        ...(time_to !== undefined && { time_to: time_to ?? null }),
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
// the function behind the dashbord bage in the bad habbits suction 
const getBadHubbitsStatus = async (req, res, next) => {
  try {
    // 1. Fetch all active "Bad Habbits" goals, with every DayGoal they appear in,
    //    the DayGoal's week (for start_date), and the DayGoal's completions.
    const badHabits = await prisma.goal.findMany({
      where: {
        category: { name: 'Bad Habbits' },
        is_active: true,
      },
      include: {
        day_goals: {
          include: {
            completions: true, // tells us whether a day was actually "done"
            week: true,        // gives us start_date to compute a real calendar date
          },
        },
      },
    });

    // 2. For each habit compute its streak history from real DB data
    const badHabits_tusus = badHabits.map((habit) => {
      // Keep only DayGoals that have at least one completion (= the habit was done that day)
      const completedDayGoals = habit.day_goals.filter(
        (dg) => dg.completions.length > 0
      );

      // Convert each completed DayGoal → a "YYYY-MM-DD" calendar date.
      // week.start_date is always the Sunday of that ISO week (day_of_week = 0).
      // day_of_week is 0-indexed: 0 = Sunday, 1 = Monday, …, 6 = Saturday.
      // So:  real date = start_date + day_of_week days
      const doneDates = completedDayGoals
        .map((dg) => {
          const d = new Date(dg.week.start_date);
          d.setDate(d.getDate() + dg.day_of_week);
          // Use UTC parts to avoid timezone shifts flipping the date
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(d.getUTCDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        })
        .sort(); // sort ascending so the grouping algorithm can walk left → right

      const count_list = computeStreaks(doneDates);

      return {
        name: habit.title,
        count_list,
      };
    });

    res.json({ success: true, data: { badHabits, badHabits_tusus } });
  } catch (error) {
    next(error);
  }
};

// ── Helper: group sorted date strings into streak objects ─────────────────────
//
// Input:  ["2026-07-01", "2026-07-02", "2026-07-04"]  (sorted, ascending)
// Output (newest first):
//   [
//     { count: 1, date_from: "2026-07-04", date_to: "2026-07-04" },  ← current
//     { count: 2, date_from: "2026-07-01", date_to: "2026-07-02" },  ← previous
//   ]
//
// If the last done-date was 2+ days ago the streak is dead, so a
// { count: 0 } stub is prepended as the "current" entry.
// ─────────────────────────────────────────────────────────────────────────────
function computeStreaks(doneDates) {
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Habit has never been completed at all
  if (doneDates.length === 0) {
    return [{ count: 0, date_from: todayStr, date_to: todayStr }];
  }

  // ── Step 1: group consecutive dates ────────────────────────────────────────
  // Walk the sorted list; start a new group every time the gap is > 1 day.
  const groups = [];
  let currentGroup = [doneDates[0]];

  for (let i = 1; i < doneDates.length; i++) {
    const prev = new Date(doneDates[i - 1]);
    const curr = new Date(doneDates[i]);
    const dayDiff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      currentGroup.push(doneDates[i]); // same streak — extend it
    } else {
      groups.push(currentGroup);       // gap found — save & start fresh
      currentGroup = [doneDates[i]];
    }
  }
  groups.push(currentGroup); // save the final group

  // ── Step 2: convert groups → streak objects, newest first ──────────────────
  const streaks = groups
    .map((group) => ({
      count: group.length,
      date_from: group[0],
      date_to: group[group.length - 1],
    }))
    .reverse(); // newest → oldest

  // ── Step 3: is the current streak still alive? ─────────────────────────────
  // "Alive" = the last done-date was today OR yesterday.
  // If the gap is 2+ days the streak is broken; prepend a count:0 stub so
  // the frontend card still shows "0" as the current streak.
  const lastDone = new Date(doneDates[doneDates.length - 1]);
  const today = new Date(todayStr);
  const daysSinceLast = (today - lastDone) / (1000 * 60 * 60 * 24);

  if (daysSinceLast > 1) {
    streaks.unshift({ count: 0, date_from: todayStr, date_to: todayStr });
  }

  return streaks;
}

module.exports = { create, remove, update, getBadHubbitsStatus };

