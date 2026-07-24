const prisma = require('../db/prisma');

// ── GET /api/categories ────────────────────────────────────────────────────────
// Uses Prisma _count with a filtered where clause — returns goals_count per category
// (only active goals are counted)
const getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        _count: {
          select: {
            goals: { where: { is_active: true } }, // filtered count — Prisma 4.3+
          },
        },
      },
    });

    // Flatten _count.goals → goals_count for a cleaner API response
    const data = categories.map(({ _count, ...cat }) => ({
      ...cat,
      goals_count: _count.goals,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/categories ───────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { name, color, sort_order } = req.body; // already validated + coerced by Zod

    const category = await prisma.category.create({
      data: { name, color, sort_order },
    });

    res.status(201).json({ success: true, data: { ...category, goals_count: 0 } });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/categories/:id ────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Only include keys that were actually sent (Zod strips unknowns via .strict())
    const category = await prisma.category.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/categories/:id ─────────────────────────────────────────────────
// Business rule: cannot delete if active goals still reference this category
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Use _count instead of fetching full records just to check existence
    const { _count } = await prisma.category.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { goals: true } } },
    });

    if (_count.goals > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${_count.goals} goal(s) still reference this category.`,
      });
    }

    await prisma.category.delete({ where: { id } });

    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
