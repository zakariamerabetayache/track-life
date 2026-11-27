const prisma = require('../db/prisma');
const { getISOWeekInfo, getOrCreateWeek } = require('../utils/weekHelpers');

// ── 5 Fixed Prayers Configuration ─────────────────────────────────────────────
const FIVE_PRAYERS = [
  { key: 'fajr', title: 'Fajr Prayer' },
  { key: 'dhuhr', title: 'Dhuhr Prayer' },
  { key: 'asr', title: 'Asr Prayer' },
  { key: 'maghrib', title: 'Maghrib Prayer' },
  { key: 'isha', title: 'Isha Prayer' },
];

/** Ensures that for the given week & day, each of the 5 prayers has a fixed DayGoal */
async function ensureFivePrayersForToday(weekId, dayOfWeek) {
  // Find Worship category if available
  const worshipCategory = await prisma.category.findFirst({
    where: { name: { equals: 'Worship', mode: 'insensitive' } },
  });

  for (let i = 0; i < FIVE_PRAYERS.length; i++) {
    const { key, title } = FIVE_PRAYERS[i];

    // Find or create the Goal
    let goal = await prisma.goal.findFirst({
      where: { title: { equals: title, mode: 'insensitive' } },
    });

    if (!goal) {
      goal = await prisma.goal.create({
        data: {
          title,
          category_id: worshipCategory ? worshipCategory.id : null,
          is_fixed: true,
          times_a_day: 1,
          sort_order: i,
          is_daily: true,
        },
      });
    }

    // Check if DayGoal already exists for today
    const existing = await prisma.dayGoal.findUnique({
      where: {
        week_id_day_of_week_goal_id: {
          week_id: weekId,
          day_of_week: dayOfWeek,
          goal_id: goal.id,
        },
      },
    });

    if (!existing) {
      await prisma.dayGoal.create({
        data: {
          week_id: weekId,
          day_of_week: dayOfWeek,
          goal_id: goal.id,
          prayer_time: key,
          is_auto: true,
        },
      });
    } else if (existing.prayer_time !== key || !existing.is_auto) {
      await prisma.dayGoal.update({
        where: { id: existing.id },
        data: { prayer_time: key, is_auto: true },
      });
    }
  }
}

/** Ensures that for the given week & day, the Sleep goal has a DayGoal row */
async function ensureSleepGoalForToday(weekId, dayOfWeek) {
  // Find or create the Sleep category
  let sleepCategory = await prisma.category.findFirst({
    where: { name: { equals: 'Sleep', mode: 'insensitive' } },
  });
  if (!sleepCategory) {
    sleepCategory = await prisma.category.create({ data: { name: 'Sleep' } });
  }

  // Find or create the Sleep goal (master goal)
  let sleepGoal = await prisma.goal.findFirst({
    where: {
      category: { name: { equals: 'Sleep', mode: 'insensitive' } },
      is_active: true,
    },
  });
  if (!sleepGoal) {
    sleepGoal = await prisma.goal.create({
      data: {
        title: 'Sleep',
        category_id: sleepCategory.id,
        is_fixed: true,
        times_a_day: 1,
        sort_order: 0,
        is_daily: true,
      },
    });
  }

  // Ensure a DayGoal exists for today
  const existing = await prisma.dayGoal.findUnique({
    where: {
      week_id_day_of_week_goal_id: {
        week_id: weekId,
        day_of_week: dayOfWeek,
        goal_id: sleepGoal.id,
      },
    },
  });

  if (!existing) {
    await prisma.dayGoal.create({
      data: {
        week_id: weekId,
        day_of_week: dayOfWeek,
        goal_id: sleepGoal.id,
        prayer_time: null,
        is_auto: true,
      },
    });
  }
}

async function setTheNewDayHabits(weekId, dayOfWeek) {
  // 1. Remove day_goals for any habits whose master goal is inactive
  await prisma.dayGoal.deleteMany({
    where: {
      week_id: weekId,
      day_of_week: dayOfWeek,
      goal: {
        category: { name: { equals: 'Habits', mode: 'insensitive' } },
        is_active: false,
      },
    },
  });

  // 2. Fetch all active goals in the "Habits" category
  const activeHabits = await prisma.goal.findMany({
    where: {
      category: {
        name: { equals: 'Habits', mode: 'insensitive' },
      },
      is_active: true,
    },
  });

  if (activeHabits.length === 0) return;

  // 3. Ensure each active habit is present in day_goals for today
  for (const habit of activeHabits) {
    const existing = await prisma.dayGoal.findUnique({
      where: {
        week_id_day_of_week_goal_id: {
          week_id: weekId,
          day_of_week: dayOfWeek,
          goal_id: habit.id,
        },
      },
    });

    if (!existing) {
      await prisma.dayGoal.create({
        data: {
          week_id: weekId,
          day_of_week: dayOfWeek,
          goal_id: habit.id,
          prayer_time: null,
          is_auto: true,
        },
      });
    }
  }
}


// ── Time helper utilities for sleep / wake up schedule ─────────────────────────
function calcHoursBetween(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) return 0;
  const fromMins = fh * 60 + fm;
  const toMins = th * 60 + tm;
  const diffMins = toMins >= fromMins ? toMins - fromMins : 24 * 60 - fromMins + toMins;
  return Math.round((diffMins / 60) * 100) / 100;
}

function timeStrTo12h(timeStr) {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH < 10 ? `0${displayH}` : displayH}:${displayM} ${period}`;
}

function formatHoursAndMins(h) {
  if (!h || h === 0) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

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
// the function behind the dashbord bage in the bad habits suction 
const getBadHubbitsStatus = async (req, res, next) => {
  try {
    // 1. Fetch all active "Bad Habits" goals, with every DayGoal they appear in,
    //    the DayGoal's week (for start_date), and the DayGoal's completions.
    const badHabits = await prisma.goal.findMany({
      where: {
        category: { name: 'Habits' },
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

// ── GET /api/day-goals/today ──────────────────────────────────────────────────
// Returns today's day goals from the current week, with a streak count per goal.
// - 5 prayers are guaranteed as fixed goals at the top of their respective cards
// - prayer_time is set  → belongs to a prayer period card
// - prayer_time is null → belongs to the habits section
const getToday = async (req, res, next) => {
  try {
    const today = new Date();
    const realTodayDayOfWeek = today.getDay(); // 0 = Sunday … 6 = Saturday
    const todayDayOfWeek = req.query.day != undefined ? realTodayDayOfWeek + Number(req.query.day) : realTodayDayOfWeek

    // ── 1. Find or create current week ────────────────────────────────────────
    const { year, week: weekNumber } = getISOWeekInfo(today);
    const currentWeek = await getOrCreateWeek(year, weekNumber);

    if (!currentWeek) {
      return res.json({ success: true, data: { week_id: null, day_of_week: todayDayOfWeek, sleep_data: null, day_goals: [] } });
    }

    // ── 2. Ensure 5 fixed prayers exist for today ─────────────────────────────
    await ensureFivePrayersForToday(currentWeek.id, todayDayOfWeek);

    // 2 . part 2 set the habits in the habits component
    await setTheNewDayHabits(currentWeek.id, todayDayOfWeek)

    // ── 3. Fetch today's day goals ────────────────────────────────────────────
    const todayGoals = await prisma.dayGoal.findMany({
      where: {
        week_id: currentWeek.id,
        day_of_week: todayDayOfWeek,
        goal: { is_active: true },
      },
      include: {
        goal: { include: { category: true } },
        completions: true,
      },
      orderBy: [
        { is_auto: 'desc' },
        { goal: { sort_order: 'asc' } },
        { id: 'asc' },
      ],
    });

    // ── 4. Find sleep / wake up schedule (prefer daily_insights, fallback to DayGoal) ──
    const todayInsight = await prisma.dailyInsight.findUnique({
      where: {
        week_id_day_of_week: {
          week_id: currentWeek.id,
          day_of_week: todayDayOfWeek,
        },
      },
      select: { sleep_time: true, wake_up_time: true },
    });

    let sleepData = null;
    if (todayInsight?.sleep_time && todayInsight?.wake_up_time) {
      const hours = calcHoursBetween(todayInsight.sleep_time, todayInsight.wake_up_time);
      sleepData = {
        wake_up: timeStrTo12h(todayInsight.wake_up_time),
        sleep_target: timeStrTo12h(todayInsight.sleep_time),
        goal_duration: formatHoursAndMins(hours),
      };
    } else {
      const keywords = ['Sleep', 'sleep', 'نوم', 'النوم'];
      let sleepGoalMatch = todayGoals.find((dg) =>
        keywords.some((kw) => {
          const title = (dg.goal?.title ?? '').toLowerCase();
          const cat = (dg.goal?.category?.name ?? '').toLowerCase();
          return title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase());
        }) && dg.time_from && dg.time_to
      );

      if (!sleepGoalMatch) {
        sleepGoalMatch = await prisma.dayGoal.findFirst({
          where: {
            week_id: currentWeek.id,
            time_from: { not: null },
            time_to: { not: null },
            goal: {
              OR: [
                { title: { contains: 'sleep', mode: 'insensitive' } },
                { title: { contains: 'نوم' } },
                { category: { name: { contains: 'sleep', mode: 'insensitive' } } },
                { category: { name: { contains: 'نوم' } } },
              ],
            },
          },
        });
      }

      if (sleepGoalMatch?.time_from && sleepGoalMatch?.time_to) {
        const hours = calcHoursBetween(sleepGoalMatch.time_from, sleepGoalMatch.time_to);
        sleepData = {
          wake_up: timeStrTo12h(sleepGoalMatch.time_to),
          sleep_target: timeStrTo12h(sleepGoalMatch.time_from),
          goal_duration: formatHoursAndMins(hours),
        };
      }
    }

    // ── 5. Compute streak for each unique goal ────────────────────────────────
    const goalIds = [...new Set(todayGoals.map((dg) => dg.goal_id))];

    const pastDayGoals = await prisma.dayGoal.findMany({
      where: { goal_id: { in: goalIds } },
      include: {
        completions: { select: { id: true } },
        week: { select: { start_date: true } },
      },
    });

    // Build a map: goalId → sorted array of "YYYY-MM-DD" dates on which it was completed
    const doneDatesByGoal = {};
    for (const dg of pastDayGoals) {
      if (dg.completions.length === 0) continue;

      const d = new Date(dg.week.start_date);
      d.setDate(d.getDate() + dg.day_of_week);
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

      if (!doneDatesByGoal[dg.goal_id]) doneDatesByGoal[dg.goal_id] = new Set();
      doneDatesByGoal[dg.goal_id].add(dateStr);
    }

    // Convert sets → sorted arrays → compute current streak
    const streakByGoal = {};
    for (const goalId of goalIds) {
      const dates = doneDatesByGoal[goalId]
        ? [...doneDatesByGoal[goalId]].sort()
        : [];
      const streaks = computeStreaks(dates);
      streakByGoal[goalId] = streaks.length > 0 ? streaks[0].count : 0;
    }

    // ── 6. Attach streak to each day goal and return ──────────────────────────
    const enriched = todayGoals.map((dg) => ({
      ...dg,
      streak: streakByGoal[dg.goal_id] ?? 0,
    }));

    res.json({
      success: true,
      data: {
        week_id: currentWeek.id,
        day_of_week: todayDayOfWeek,
        sleep_data: sleepData,
        day_goals: enriched,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, remove, update, getBadHubbitsStatus, getToday };

