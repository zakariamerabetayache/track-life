const express = require('express');
const router  = express.Router();

const controller = require('../controllers/goals.controller');
const validate   = require('../middleware/validate');
const { createGoalSchema, updateGoalSchema } = require('../schemas/goals.schema');

router.get   ('/',    controller.getAll);
router.post  ('/',    validate(createGoalSchema),  controller.create);
router.put   ('/:id', validate(updateGoalSchema),  controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
