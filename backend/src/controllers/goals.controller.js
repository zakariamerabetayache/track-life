const prisma = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

// ── GET /api/goals ─────────────────────────────────────────────────────────────
// Server-side pagination, search, filter, and sort.
const getAll = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query || {};
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const pageSize = Number(query.pageSize) > 0 ? Math.min(Number(query.pageSize), 100) : 10;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = query.status || 'all';
  const sortBy = ['title', 'created_at', 'updated_at', 'sort_order', 'times_a_day'].includes(query.sortBy)
    ? query.sortBy
    : 'created_at';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  // ── Build WHERE clause ────────────────────────────────────────────────────
  const where = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (status !== 'all') {
    where.is_active = status === 'active';
  }

  // ── Parallel execution for performance ────────────────────────────────────
  const [data, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
      },
    }),
    prisma.goal.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  });
});

// ── GET /api/goals/:id ─────────────────────────────────────────────────────────
const getOne = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!goal) {
    throw new NotFoundError(`Goal with ID ${id} not found.`);
  }

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// ── POST /api/goals ────────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const body = req.validatedBody || req.body;
  const { title, category_id, is_fixed, times_a_day, sort_order, is_daily, is_active } = body;

  const goal = await prisma.goal.create({
    data: {
      title,
      category_id: category_id || null,
      is_fixed: is_fixed ?? true,
      times_a_day: times_a_day ?? 1,
      sort_order: sort_order ?? 0,
      is_daily: is_daily ?? true,
      is_active: is_active ?? true,
    },
    include: {
      category: true,
    },
  });

  res.status(201).json({
    success: true,
    data: goal,
  });
});

// ── PUT /api/goals/:id ─────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);
  const data = req.validatedBody || req.body;

  const existing = await prisma.goal.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Goal with ID ${id} not found.`);
  }

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });

  res.status(200).json({
    success: true,
    data: updatedGoal,
  });
});

// ── DELETE /api/goals/:id ──────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const existing = await prisma.goal.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Goal with ID ${id} not found.`);
  }

  await prisma.goal.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully.',
  });
});

// ── PATCH /api/goals/:id/toggle ────────────────────────────────────────────────
const toggleStatus = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);
  const body = req.validatedBody || req.body || {};

  const existing = await prisma.goal.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Goal with ID ${id} not found.`);
  }

  const nextStatus = typeof body.is_active === 'boolean'
    ? body.is_active
    : !existing.is_active;

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: { is_active: nextStatus },
    include: {
      category: true,
    },
  });

  res.status(200).json({
    success: true,
    data: updatedGoal,
    message: `Goal ${nextStatus ? 'activated' : 'deactivated'} successfully.`,
  });
});

module.exports = { getAll, getOne, create, update, remove, toggleStatus };
