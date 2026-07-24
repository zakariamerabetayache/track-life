const express = require('express');
const router = express.Router();

const controller = require('../controllers/weekGoals.controller');
const validate = require('../middleware/validate');
const { createWeekGoalSchema, updateWeekGoalSchema } = require('../schemas/weekGoals.schema');

router.get('/', controller.getAll);
router.post('/', validate(createWeekGoalSchema), controller.create);
router.put('/:id', validate(updateWeekGoalSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;