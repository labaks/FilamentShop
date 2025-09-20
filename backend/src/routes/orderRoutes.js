const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware для аутентифицированных пользователей

// Создание заказа (доступно всем, логика userId внутри контроллера)
router.post('/', orderController.createOrder);

// Получение всех заказов (только для админов)
router.get('/', adminOnlyMiddleware, orderController.getAllOrders);

// Получение заказов текущего пользователя
router.get('/my', authMiddleware, orderController.getMyOrders);

// Обновление статуса заказа (только для админов)
router.put('/:id/status', adminOnlyMiddleware, orderController.updateOrderStatus);

// Получение одного заказа по ID (только для админов)
router.get('/:id', adminOnlyMiddleware, orderController.getOrderById);

module.exports = router;