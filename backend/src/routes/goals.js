const express = require('express');
const router = express.Router();

const controller = require('../controllers/goals.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
    idParamSchema,
    listGoalsSchema,
    createGoalSchema,
    updateGoalSchema,
    toggleGoalSchema,
} = require('../schemas/goals.schema');

router.get('/', validateQuery(listGoalsSchema), controller.getAll);
router.get('/:id', validateParams(idParamSchema), controller.getOne);
router.post('/', validate(createGoalSchema), controller.create);
router.put(
    '/:id',
    validateParams(idParamSchema),
    validate(updateGoalSchema),
    controller.update
);
router.patch(
    '/:id/toggle',
    validateParams(idParamSchema),
    validate(toggleGoalSchema),
    controller.toggleStatus
);
router.patch(
    '/:id',
    validateParams(idParamSchema),
    validate(updateGoalSchema),
    controller.update
);
router.delete('/:id', validateParams(idParamSchema), controller.remove);

module.exports = router;