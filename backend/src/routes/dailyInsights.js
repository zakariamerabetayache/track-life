const express = require('express');
const router  = express.Router();

const controller = require('../controllers/dailyInsights.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
  upsertDailyInsightSchema,
  listDailyInsightsSchema,
  idParamSchema,
} = require('../schemas/dailyInsights.schema');

router.get('/today',         controller.getToday);
router.get('/',              validateQuery(listDailyInsightsSchema), controller.getAll);
router.put('/',              validate(upsertDailyInsightSchema),     controller.upsert);
router.delete('/:id',        validateParams(idParamSchema),          controller.remove);

module.exports = router;
