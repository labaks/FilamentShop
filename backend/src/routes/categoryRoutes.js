const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', adminOnlyMiddleware, categoryController.createCategory);
router.put('/:id', adminOnlyMiddleware, categoryController.updateCategory);
router.delete('/:id', adminOnlyMiddleware, categoryController.deleteCategory);

module.exports = router;