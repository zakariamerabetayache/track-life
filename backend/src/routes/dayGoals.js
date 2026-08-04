const express = require('express');
const router = express.Router();

const controller = require('../controllers/dayGoals.controller');
const validate = require('../middleware/validate');
const { createDayGoalSchema, updateDayGoalSchema } = require('../schemas/dayGoals.schema');

router.post('/', validate(createDayGoalSchema), controller.create);
router.get('/dashboard/bad-habits', controller.getBadHubbitsStatus);

router.put('/:id', validate(updateDayGoalSchema), controller.update);
router.delete('/:id', controller.remove);



module.exports = router;
