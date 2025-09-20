const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Маршрут для получения всех товаров
router.get('/', productController.getAllProducts);

// Маршрут для получения одного товара по ID
router.get('/:id', productController.getProductById);

// Защищенные маршруты
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
