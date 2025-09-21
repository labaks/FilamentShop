const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Все маршруты здесь требуют аутентификации

router.get('/', favoriteController.getFavorites);
router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);

module.exports = router;
