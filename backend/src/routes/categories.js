const express = require('express');
const router = express.Router();

const controller = require('../controllers/categories.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
  idParamSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
} = require('../schemas/categories.schema');

router.get('/', validateQuery(listCategoriesSchema), controller.getAll);
router.get('/:id', validateParams(idParamSchema), controller.getOne);
router.post('/', validate(createCategorySchema), controller.create);
router.put(
  '/:id',
  validateParams(idParamSchema),
  validate(updateCategorySchema),
  controller.update
);
router.patch(
  '/:id',
  validateParams(idParamSchema),
  validate(updateCategorySchema),
  controller.update
);
router.delete('/:id', validateParams(idParamSchema), controller.remove);

module.exports = router;
