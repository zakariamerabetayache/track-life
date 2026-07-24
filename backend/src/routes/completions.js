const express = require('express');
const router  = express.Router();

const controller = require('../controllers/completions.controller');
const validate   = require('../middleware/validate');
const { toggleCompletionSchema } = require('../schemas/completions.schema');

router.post('/toggle', validate(toggleCompletionSchema), controller.toggle);

module.exports = router;
