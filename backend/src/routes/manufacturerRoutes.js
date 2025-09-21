const express = require('express');
const router = express.Router();
const createGenericController = require('../controllers/genericController');
const { Manufacturer } = require('../models');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');

const controller = createGenericController(Manufacturer);

router.get('/', controller.getAll);
router.post('/', adminOnlyMiddleware, controller.create);
router.put('/:id', adminOnlyMiddleware, controller.update);
router.delete('/:id', adminOnlyMiddleware, controller.delete);

module.exports = router;