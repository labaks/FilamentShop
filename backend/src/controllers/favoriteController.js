const db = require('../models');
const { Favorite, Product, User } = db;

// Получить все избранные товары пользователя
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            include: [{
                model: Product,
                through: { attributes: [] } // Не включать данные из промежуточной таблицы
            }]
        });
        res.json(user.Products || []);
    } catch (error) {
        console.error('Ошибка при получении избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Добавить товар в избранное
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const favorite = await Favorite.findOne({ where: { userId, productId } });
        if (favorite) {
            return res.status(409).json({ message: 'Товар уже в избранном' });
        }

        await Favorite.create({ userId, productId });
        res.status(201).json({ message: 'Товар добавлен в избранное' });
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удалить товар из избранного
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const result = await Favorite.destroy({ where: { userId, productId } });
        res.status(200).json({ message: 'Товар удален из избранного', count: result });
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
