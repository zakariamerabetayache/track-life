const express = require('express');
const router  = express.Router();

const controller = require('../controllers/categories.controller');
const validate   = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../schemas/categories.schema');

router.get   ('/',    controller.getAll);
router.post  ('/',    validate(createCategorySchema), controller.create);
router.put   ('/:id', validate(updateCategorySchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
