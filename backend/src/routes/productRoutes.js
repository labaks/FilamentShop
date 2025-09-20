const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Маршрут для получения всех товаров
router.get('/', productController.getAllProducts);

// Маршрут для создания нового товара
router.post('/', productController.createProduct);

// Маршрут для получения одного товара по ID
router.get('/:id', productController.getProductById);

// Маршрут для обновления товара по ID
router.put('/:id', productController.updateProduct);

// Маршрут для удаления товара по ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
