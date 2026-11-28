const express = require('express');
const router = express.Router();

const controller = require('../controllers/prayeTimesApi.controller');
const { validate } = require('../middleware/validate');

router.get('/currentdate', controller.getcurrentDate);



module.exports = router;
