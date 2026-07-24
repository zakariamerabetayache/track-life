const prisma = require('../db/prisma');

// ── GET /api/week-goals ─────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
    try {
        const { week_id } = req.query;

        const where = {};
        if (week_id !== undefined) {
            where.week_id = parseInt(week_id, 10);
        }

        const goals = await prisma.week_Goal.findMany({
            where,
            orderBy: [
                { order: 'asc' },
                { created_at: 'asc' }
            ],
        });

        res.json({ success: true, data: goals });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/week-goals ────────────────────────────────────────────────────────────
const create = async (req, res, next) => {
    try {
        const { week_id, designation, order } = req.body;

        const weekGoal = await prisma.week_Goal.create({
            data: { week_id, designation, order },
        });

        res.status(201).json({ success: true, data: weekGoal });
    } catch (error) {
        next(error);
    }
};

// ── DELETE /api/week-goals/:id ──────────────────────────────────────────────────────
const remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.week_Goal.delete({
            where: { id },
        });

        res.json({ success: true, message: "Week goal deleted successfully." });
    } catch (error) {
        next(error);
    }
};

// ── PUT /api/week-goals/:id ─────────────────────────────────────────────────────────
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const weekGoal = await prisma.week_Goal.update({
            where: { id },
            data: req.body,
        });

        res.json({ success: true, data: weekGoal });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAll, create, update, remove };
