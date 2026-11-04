const prisma = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// ── GET /api/categories ────────────────────────────────────────────────────────
// Server-side pagination, search, and sort (or fetch all for dropdowns via ?all=true)
const getAll = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query || {};
  const isFetchAll = query.all === 'true';
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const pageSize = Number(query.pageSize) > 0 ? Math.min(Number(query.pageSize), 100) : 10;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sortBy = ['name', 'sort_order', 'created_at', 'updated_at'].includes(query.sortBy)
    ? query.sortBy
    : 'sort_order';
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  // ── Build WHERE clause ────────────────────────────────────────────────────
  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const includeConfig = {
    _count: {
      select: {
        goals: { where: { is_active: true } },
      },
    },
  };

  if (isFetchAll) {
    const rawData = await prisma.category.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: includeConfig,
    });

    const data = rawData.map(({ _count, ...cat }) => ({
      ...cat,
      goals_count: _count?.goals ?? 0,
    }));

    return res.status(200).json({
      success: true,
      data,
      meta: {
        page: 1,
        pageSize: data.length,
        total: data.length,
        totalPages: 1,
      },
    });
  }

  // ── Parallel execution for performance ────────────────────────────────────
  const [rawData, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: includeConfig,
    }),
    prisma.category.count({ where }),
  ]);

  const data = rawData.map(({ _count, ...cat }) => ({
    ...cat,
    goals_count: _count?.goals ?? 0,
  }));

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

// ── GET /api/categories/:id ─────────────────────────────────────────────────────
const getOne = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          goals: { where: { is_active: true } },
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError(`Category with ID ${id} not found.`);
  }

  const { _count, ...data } = category;

  res.status(200).json({
    success: true,
    data: {
      ...data,
      goals_count: _count?.goals ?? 0,
    },
  });
});

// ── POST /api/categories ────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const body = req.validatedBody || req.body;
  const { name, color, sort_order } = body;

  const category = await prisma.category.create({
    data: {
      name,
      color: color || '#6366F1',
      sort_order: sort_order ?? 0,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...category,
      goals_count: 0,
    },
  });
});

// ── PUT /api/categories/:id ─────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);
  const data = req.validatedBody || req.body;

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found.`);
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          goals: { where: { is_active: true } },
        },
      },
    },
  });

  const { _count, ...catData } = updatedCategory;

  res.status(200).json({
    success: true,
    data: {
      ...catData,
      goals_count: _count?.goals ?? 0,
    },
  });
});

// ── DELETE /api/categories/:id ──────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { goals: true },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found.`);
  }

  if (existing._count?.goals > 0) {
    throw new BadRequestError(
      `Cannot delete: ${existing._count.goals} goal(s) still reference this category.`
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
  });
});

module.exports = { getAll, getOne, create, update, remove };
