const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Получение отзывов для товара (доступно всем)
router.get('/:productId', reviewController.getProductReviews);
// Создание отзыва (только для авторизованных)
router.post('/:productId', authMiddleware, reviewController.createReview); 
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;