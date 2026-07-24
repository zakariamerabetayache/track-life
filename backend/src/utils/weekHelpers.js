const prisma = require('../db/prisma');

// ─────────────────────────────────────────────────────────────────────────────
// Shared Prisma include shape — defined once, reused everywhere so that
// "week with all day_goals" queries stay DRY and consistent.
// ─────────────────────────────────────────────────────────────────────────────
const WEEK_WITH_GOALS = {
  day_goals: {
    orderBy: [
      { goal: { is_fixed: 'desc' } },
      { goal: { sort_order: 'asc' } },
    ],
    include: {
      goal:        { include: { category: true } },
      completions: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// getISOWeekInfo — returns the ISO 8601 { year, week } for any date
// ─────────────────────────────────────────────────────────────────────────────
function getISOWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;           // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);  // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

// ─────────────────────────────────────────────────────────────────────────────
// getISOWeeksInYear — some years have 53 ISO weeks (e.g. 2015, 2020, 2026).
// The safest check: if Dec 28 is in week 53, the year has 53 weeks.
// ─────────────────────────────────────────────────────────────────────────────
function getISOWeeksInYear(year) {
  const dec28 = new Date(year, 11, 28); // Dec 28 is always in the last ISO week
  return getISOWeekInfo(dec28).week;
}

// ─────────────────────────────────────────────────────────────────────────────
// getSundayOfWeek — returns the Sunday that starts a given ISO week
// (our calendar treats Sunday as day 0, so we go one day before ISO Monday)
// ─────────────────────────────────────────────────────────────────────────────
function getSundayOfWeek(year, week) {
  // Start with Jan 1, shift to the ISO week's Monday, then back one day to Sunday
  const jan1   = new Date(year, 0, 1);
  const dow    = jan1.getDay(); // 0=Sun … 6=Sat

  // First ISO Monday of the year
  const firstMonday = new Date(jan1);
  firstMonday.setDate(jan1.getDate() + (dow <= 4 ? 1 - dow : 8 - dow));

  // Monday of the target week
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + (week - 1) * 7);

  // Sunday before that Monday
  const sunday = new Date(targetMonday);
  sunday.setDate(targetMonday.getDate() - 1);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

// ─────────────────────────────────────────────────────────────────────────────
// getOrCreateWeek — the heart of the week logic.
//
// Improvements over the old version:
//   1. WEEK_WITH_GOALS constant — no duplicated include objects
//   2. select: { id: true } when fetching fixed goals — only ID is needed
//   3. Set-based lookup for existing day_goals — O(1) instead of .some() loop
//   4. Prisma $transaction for atomic week + dayGoal creation
//   5. Single refetch at the end of the "new week" path (not two)
// ─────────────────────────────────────────────────────────────────────────────
async function getOrCreateWeek(year, weekNumber) {
  // ── 1. Look up existing week ──────────────────────────────────────────────
  const existing = await prisma.week.findUnique({
    where: { year_week_number: { year, week_number: weekNumber } },
    include: WEEK_WITH_GOALS,
  });

  if (existing) {
    // ── 2. Check for missing fixed goals (e.g. a new goal was added after
    //       this week was first created)
    const fixedGoals = await prisma.goal.findMany({
      where:  { is_fixed: true, is_active: true },
      select: { id: true }, // only need IDs for the comparison
    });

    // Build a fast lookup set: "dayOfWeek-goalId"
    const existingKeys = new Set(
      existing.day_goals.map((dg) => `${dg.day_of_week}-${dg.goal_id}`)
    );

    const missing = [];
    for (let day = 0; day <= 6; day++) {
      for (const goal of fixedGoals) {
        if (!existingKeys.has(`${day}-${goal.id}`)) {
          missing.push({ week_id: existing.id, day_of_week: day, goal_id: goal.id, is_auto: true });
        }
      }
    }

    // No gaps — return immediately without another DB round-trip
    if (missing.length === 0) return existing;

    await prisma.dayGoal.createMany({ data: missing });

    // Refetch only when we actually inserted new rows
    return prisma.week.findUnique({
      where:   { id: existing.id },
      include: WEEK_WITH_GOALS,
    });
  }

  // ── 3. Week doesn't exist — create it atomically ──────────────────────────
  const startDate = getSundayOfWeek(year, weekNumber);
  const endDate   = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  // Fetch fixed goals before the transaction (read-only, no need to be inside it)
  const fixedGoals = await prisma.goal.findMany({
    where:  { is_fixed: true, is_active: true },
    select: { id: true },
  });

  // $transaction: week creation + dayGoal bulk insert are atomic
  // If either fails, nothing is committed
  const newWeek = await prisma.$transaction(async (tx) => {
    const week = await tx.week.create({
      data: { year, week_number: weekNumber, start_date: startDate, end_date: endDate },
    });

    if (fixedGoals.length > 0) {
      const dayGoalsData = [];
      for (let day = 0; day <= 6; day++) {
        for (const goal of fixedGoals) {
          dayGoalsData.push({ week_id: week.id, day_of_week: day, goal_id: goal.id, is_auto: true });
        }
      }
      await tx.dayGoal.createMany({ data: dayGoalsData });
    }

    return week;
  });

  // Single fetch with full relations after the transaction
  return prisma.week.findUnique({
    where:   { id: newWeek.id },
    include: WEEK_WITH_GOALS,
  });
}

module.exports = { getISOWeekInfo, getISOWeeksInYear, getSundayOfWeek, getOrCreateWeek };
