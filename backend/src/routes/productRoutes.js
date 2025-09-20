const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');

// Маршрут для получения всех товаров
router.get('/', productController.getAllProducts);

// Маршрут для получения одного товара по ID
router.get('/:id', productController.getProductById);

// Защищенные маршруты
router.post('/', adminOnlyMiddleware, productController.createProduct);
router.put('/:id', adminOnlyMiddleware, productController.updateProduct);
router.delete('/:id', adminOnlyMiddleware, productController.deleteProduct);

module.exports = router;
