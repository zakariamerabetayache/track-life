const { getOrCreateWeek, getISOWeekInfo, getISOWeeksInYear } = require('../utils/weekHelpers');

// ── GET /api/weeks/current ─────────────────────────────────────────────────────
const getCurrent = async (req, res, next) => {
  try {
    const { year, week } = getISOWeekInfo(new Date());
    const data = await getOrCreateWeek(year, week);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/weeks/navigate?year=&week=&direction= ────────────────────────────
const navigate = async (req, res, next) => {
  try {
    const { year, week, direction } = req.query;

    if (!year || !week || !direction) {
      return res.status(400).json({
        success: false,
        message: 'year, week, and direction are required query params.',
      });
    }

    if (!['prev', 'next'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'direction must be "prev" or "next".',
      });
    }

    let targetYear = parseInt(year);
    let targetWeek = parseInt(week);

    if (direction === 'prev') {
      targetWeek--;
      if (targetWeek < 1) {
        targetYear--;
        // FIX: use actual ISO week count — some years have 53 weeks (e.g. 2026)
        targetWeek = getISOWeeksInYear(targetYear);
      }
    } else {
      targetWeek++;
      // FIX: use actual ISO week count instead of hardcoded 52
      if (targetWeek > getISOWeeksInYear(targetYear)) {
        targetYear++;
        targetWeek = 1;
      }
    }

    const data = await getOrCreateWeek(targetYear, targetWeek);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/weeks/:year/:week ────────────────────────────────────────────────
const getByYearWeek = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const week = parseInt(req.params.week);

    if (isNaN(year) || isNaN(week) || week < 1 || week > 53) {
      return res.status(400).json({ success: false, message: 'Invalid year or week number.' });
    }

    const data = await getOrCreateWeek(year, week);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrent, navigate, getByYearWeek };
