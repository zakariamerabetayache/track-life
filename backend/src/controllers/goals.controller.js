const prisma = require('../db/prisma');

// ── GET /api/goals ─────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { is_active, category_id, is_daily } = req.query;

    const where = {};

    // Coerce string query params to booleans
    if (is_active  !== undefined) where.is_active  = is_active  === 'true';
    if (is_daily   !== undefined) where.is_daily   = is_daily   === 'true'; // BUG FIX: was === 'false'
    if (category_id !== undefined) where.category_id = parseInt(category_id);

    const goals = await prisma.goal.findMany({
      where,
      include: { category: true },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/goals ────────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    // req.body already validated + coerced by Zod middleware
    const { title, category_id, is_fixed, is_daily, times_a_day, sort_order } = req.body;

    const goal = await prisma.goal.create({
      data: { title, category_id, is_fixed, is_daily, times_a_day, sort_order },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/goals/:id ─────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Zod .strict() already stripped unknown keys — safe to spread directly
    const goal = await prisma.goal.update({
      where: { id },
      data: req.body,
      include: { category: true },
    });

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/goals/:id ──────────────────────────────────────────────────────
// Soft delete — sets is_active = false so history is preserved
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // select: { id } — we only need to confirm it happened, not return the full record
    await prisma.goal.update({
      where: { id },
      data: { is_active: false },
      select: { id: true },
    });

    res.json({ success: true, message: 'Goal disabled.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
