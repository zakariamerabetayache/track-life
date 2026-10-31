const prisma = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

// ── GET /api/reminders ─────────────────────────────────────────────────────────
// Server-side pagination, search, filter, and sort.
const getAll = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query || {};
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const pageSize = Number(query.pageSize) > 0 ? Math.min(Number(query.pageSize), 100) : 10;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = query.status || 'all';
  const sortBy = ['title', 'created_at', 'updated_at'].includes(query.sortBy) ? query.sortBy : 'created_at';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  // ── Build WHERE clause ────────────────────────────────────────────────────
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== 'all') {
    where.is_active = status === 'active';
  }

  // ── Parallel execution for performance ────────────────────────────────────
  const [data, total] = await Promise.all([
    prisma.reminders.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.reminders.count({ where }),
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

// ── GET /api/reminders/:id ─────────────────────────────────────────────────────
const getOne = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const reminder = await prisma.reminders.findUnique({
    where: { id },
  });

  if (!reminder) {
    throw new NotFoundError(`Reminder with ID ${id} not found.`);
  }

  res.status(200).json({
    success: true,
    data: reminder,
  });
});

// ── POST /api/reminders ────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const body = req.validatedBody || req.body;
  const { title, content, is_active } = body;

  const reminder = await prisma.reminders.create({
    data: {
      title,
      content,
      is_active: is_active ?? true,
    },
  });

  res.status(201).json({
    success: true,
    data: reminder,
  });
});

// ── PUT /api/reminders/:id ─────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);
  const data = req.validatedBody || req.body;

  const existing = await prisma.reminders.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Reminder with ID ${id} not found.`);
  }

  const updatedReminder = await prisma.reminders.update({
    where: { id },
    data,
  });

  res.status(200).json({
    success: true,
    data: updatedReminder,
  });
});

// ── DELETE /api/reminders/:id ──────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);

  const existing = await prisma.reminders.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Reminder with ID ${id} not found.`);
  }

  await prisma.reminders.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Reminder deleted successfully.',
  });
});

// ── PATCH /api/reminders/:id/toggle ────────────────────────────────────────────
const toggleStatus = asyncHandler(async (req, res) => {
  const params = req.validatedParams || req.params;
  const id = Number(params.id);
  const body = req.validatedBody || req.body || {};

  const existing = await prisma.reminders.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Reminder with ID ${id} not found.`);
  }

  // If explicit is_active boolean is sent, use it; otherwise toggle
  const nextStatus = typeof body.is_active === 'boolean'
    ? body.is_active
    : !existing.is_active;

  const updatedReminder = await prisma.reminders.update({
    where: { id },
    data: { is_active: nextStatus },
  });

  res.status(200).json({
    success: true,
    data: updatedReminder,
    message: `Reminder ${nextStatus ? 'activated' : 'deactivated'} successfully.`,
  });
});

module.exports = { getAll, getOne, create, update, remove, toggleStatus };

