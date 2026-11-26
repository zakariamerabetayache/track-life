require('dotenv').config();
const prisma = require('../src/db/prisma');

function buildInsightDate(weekStartDate, dayOfWeek) {
  const d = new Date(weekStartDate);
  d.setDate(d.getDate() + dayOfWeek);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function computeGoalSnapshot(weekId, dayOfWeek) {
  const dayGoals = await prisma.dayGoal.findMany({
    where: { week_id: weekId, day_of_week: dayOfWeek, goal: { is_active: true } },
    include: { goal: { select: { times_a_day: true } }, completions: { select: { id: true } } },
  });

  let total = 0;
  let achieved = 0;
  for (const dg of dayGoals) {
    const times = dg.goal.times_a_day ?? 1;
    total += times;
    achieved += Math.min(dg.completions.length, times);
  }
  const pct = total > 0 ? Math.round((achieved / total) * 100 * 10) / 10 : null;
  return { goals_total: total, goals_achieved: achieved, goals_pct: pct };
}

/** Backfills historical Sleep DayGoal time_from/time_to rows into daily_insights. */
async function backfillSleep() {
  const sleepDayGoals = await prisma.dayGoal.findMany({
    where: {
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
    include: { week: { select: { id: true, start_date: true } } },
  });

  let migrated = 0;
  for (const dg of sleepDayGoals) {
    const existing = await prisma.dailyInsight.findUnique({
      where: { week_id_day_of_week: { week_id: dg.week_id, day_of_week: dg.day_of_week } },
    });

    if (existing?.sleep_time && existing?.wake_up_time) continue;

    const insightDate = buildInsightDate(dg.week.start_date, dg.day_of_week);
    const snapshot = await computeGoalSnapshot(dg.week_id, dg.day_of_week);

    await prisma.dailyInsight.upsert({
      where: { week_id_day_of_week: { week_id: dg.week_id, day_of_week: dg.day_of_week } },
      create: {
        week_id: dg.week_id,
        day_of_week: dg.day_of_week,
        insight_date: insightDate,
        sleep_time: dg.time_from,
        wake_up_time: dg.time_to,
        ...snapshot,
      },
      update: {
        sleep_time: existing?.sleep_time ?? dg.time_from,
        wake_up_time: existing?.wake_up_time ?? dg.time_to,
        ...snapshot,
      },
    });
    migrated++;
  }

  console.log(`Scanned ${sleepDayGoals.length} sleep DayGoals; backfilled ${migrated} daily_insights rows.`);
}

backfillSleep()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
