const express = require('express');
const router  = express.Router();

const controller = require('../controllers/weeks.controller');

// Order matters: /current and /navigate must come before /:year/:week
router.get('/current',          controller.getCurrent);
router.get('/navigate',         controller.navigate);
router.get('/:year/:week',      controller.getByYearWeek);

module.exports = router;
