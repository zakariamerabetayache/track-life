const prisma = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const { getISOWeekInfo, getOrCreateWeek, resolveDayOfWeek } = require('../utils/weekHelpers');

// ── Time helpers (same logic as dayGoals.controller) ─────────────────────────
function calcHoursBetween(from, to) {
  if (!from || !to) return null;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) return null;
  const fromMins = fh * 60 + fm;
  const toMins   = th * 60 + tm;
  const diffMins = toMins >= fromMins ? toMins - fromMins : 24 * 60 - fromMins + toMins;
  return Math.round((diffMins / 60) * 100) / 100;
}

function timeStrTo12h(timeStr) {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  const period   = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH < 10 ? `0${displayH}` : displayH}:${displayM} ${period}`;
}

function formatHoursAndMins(h) {
  if (!h || h === 0) return '0h';
  const hrs  = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
}

// Build insight_date from week.start_date + day_of_week (UTC-safe)
function buildInsightDate(weekStartDate, dayOfWeek) {
  const d = new Date(weekStartDate);
  d.setDate(d.getDate() + dayOfWeek);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Compute goal completion snapshot from day_goals for a given (weekId, dayOfWeek)
async function computeGoalSnapshot(weekId, dayOfWeek) {
  const dayGoals = await prisma.dayGoal.findMany({
    where: { week_id: weekId, day_of_week: dayOfWeek, goal: { is_active: true } },
    include: { goal: { select: { times_a_day: true } }, completions: { select: { id: true } } },
  });

  let total = 0;
  let achieved = 0;
  for (const dg of dayGoals) {
    const times = dg.goal.times_a_day ?? 1;
    total    += times;
    achieved += Math.min(dg.completions.length, times);
  }
  const pct = total > 0 ? Math.round((achieved / total) * 100 * 10) / 10 : null;
  return { goals_total: total, goals_achieved: achieved, goals_pct: pct };
}

// ── GET /api/daily-insights/today ─────────────────────────────────────────────
const getToday = asyncHandler(async (req, res) => {
  const today       = new Date();
  const { year, week: weekNumber } = getISOWeekInfo(today);
  const currentWeek = await getOrCreateWeek(year, weekNumber);
  const dayOfWeek   = resolveDayOfWeek(req.query.day, today.getDay()); // 0 = Sunday

  if (dayOfWeek === null) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "day" must be an integer between 0 and 6.',
    });
  }

  const insight = await prisma.dailyInsight.findUnique({
    where: { week_id_day_of_week: { week_id: currentWeek.id, day_of_week: dayOfWeek } },
  });

  // Build sleep_data shape (same as dayGoals.controller) for the SleepAnchor UI
  let sleep_data = null;
  const st = insight?.sleep_time;
  const wu = insight?.wake_up_time;
  if (st && wu) {
    const hours = calcHoursBetween(st, wu);
    sleep_data = {
      wake_up:       timeStrTo12h(wu),
      sleep_target:  timeStrTo12h(st),
      goal_duration: formatHoursAndMins(hours),
    };
  }

  res.json({
    success: true,
    data: {
      week_id:     currentWeek.id,
      day_of_week: dayOfWeek,
      insight_date: buildInsightDate(currentWeek.start_date, dayOfWeek),
      sleep_data,
      insight: insight ?? null,
    },
  });
});

// ── PUT /api/daily-insights ────────────────────────────────────────────────────
// Partial upsert — only the fields sent in the body are updated
const upsert = asyncHandler(async (req, res) => {
  const body = req.validatedBody || req.body;
  const { week_id, day_of_week, ...fields } = body;

  // Verify week exists
  const week = await prisma.week.findUnique({ where: { id: week_id } });
  if (!week) {
    return res.status(404).json({ success: false, message: `Week ${week_id} not found.` });
  }

  const insight_date = buildInsightDate(week.start_date, day_of_week);

  // Compute goal snapshot so it's always fresh at save time
  const snapshot = await computeGoalSnapshot(week_id, day_of_week);

  const insight = await prisma.dailyInsight.upsert({
    where: { week_id_day_of_week: { week_id, day_of_week } },
    create: {
      week_id,
      day_of_week,
      insight_date,
      ...fields,
      ...snapshot,
    },
    update: {
      ...fields,
      ...snapshot,
    },
  });

  // Rebuild sleep_data for the response
  let sleep_data = null;
  const st = insight.sleep_time;
  const wu = insight.wake_up_time;
  if (st && wu) {
    const hours = calcHoursBetween(st, wu);
    sleep_data = {
      wake_up:       timeStrTo12h(wu),
      sleep_target:  timeStrTo12h(st),
      goal_duration: formatHoursAndMins(hours),
    };
  }

  res.json({ success: true, data: { ...insight, sleep_data } });
});

// ── GET /api/daily-insights ────────────────────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const query    = req.validatedQuery || req.query || {};
  const page     = Number(query.page)     > 0 ? Number(query.page)     : 1;
  const pageSize = Number(query.pageSize) > 0 ? Math.min(Number(query.pageSize), 100) : 20;
  const search   = typeof query.search === 'string' ? query.search.trim() : '';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const where = {};
  if (search) {
    where.OR = [
      { evaluation: { contains: search, mode: 'insensitive' } },
      { lesson:     { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.dailyInsight.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { insight_date: sortOrder },
      include: { week: { select: { year: true, week_number: true, start_date: true } } },
    }),
    prisma.dailyInsight.count({ where }),
  ]);

  // Enrich each record with computed sleep_data + sleep_hours
  const enriched = data.map((insight) => {
    const st  = insight.sleep_time;
    const wu  = insight.wake_up_time;
    const hours = st && wu ? calcHoursBetween(st, wu) : null;
    return {
      ...insight,
      sleep_hours: hours,
      sleep_data: st && wu ? {
        wake_up:       timeStrTo12h(wu),
        sleep_target:  timeStrTo12h(st),
        goal_duration: formatHoursAndMins(hours),
      } : null,
    };
  });

  res.json({
    success: true,
    data: enriched,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  });
});

// ── DELETE /api/daily-insights/:id ────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const existing = await prisma.dailyInsight.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Daily insight ${id} not found.`);

  await prisma.dailyInsight.delete({ where: { id } });
  res.json({ success: true, message: 'Daily insight deleted.' });
});

module.exports = { getToday, upsert, getAll, remove };
