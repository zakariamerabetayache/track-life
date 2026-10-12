const express = require('express');
const router = express.Router();

const controller = require('../controllers/reminders.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
  idParamSchema,
  listRemindersSchema,
  createReminderSchema,
  updateReminderSchema,
  toggleReminderSchema,
} = require('../schemas/reminders.schema');

router.get('/', validateQuery(listRemindersSchema), controller.getAll);
router.get('/:id', validateParams(idParamSchema), controller.getOne);
router.post('/', validate(createReminderSchema), controller.create);
router.put(
  '/:id',
  validateParams(idParamSchema),
  validate(updateReminderSchema),
  controller.update
);
router.patch(
  '/:id/toggle',
  validateParams(idParamSchema),
  validate(toggleReminderSchema),
  controller.toggleStatus
);
router.patch(
  '/:id',
  validateParams(idParamSchema),
  validate(updateReminderSchema),
  controller.update
);
router.delete('/:id', validateParams(idParamSchema), controller.remove);

module.exports = router;