const db = require('../models');
const { Review, Product, User } = db;

// Получить все отзывы для товара
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5; // По 5 отзывов на странице
        const offset = (page - 1) * limit;

        const { count, rows } = await Review.findAndCountAll({
            where: { productId },
            include: [{ model: User, attributes: ['username'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            reviews: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Создать новый отзыв
exports.createReview = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        // Проверка, оставлял ли пользователь уже отзыв на этот товар
        const existingReview = await Review.findOne({ where: { userId, productId } });
        if (existingReview) {
            return res.status(409).json({ message: 'Вы уже оставляли отзыв на этот товар.' });
        }

        await Review.create({ rating, comment, userId, productId }, { transaction: t });

        // Обновляем средний рейтинг и количество отзывов у товара
        const reviews = await Review.findAll({ where: { productId }, transaction: t });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await Product.update(
            {
                averageRating: averageRating.toFixed(2),
                reviewCount: reviews.length,
            },
            { where: { id: productId }, transaction: t }
        );

        await t.commit();
        res.status(201).json({ message: 'Отзыв успешно добавлен.' });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка при создании отзыва:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Вспомогательная функция для обновления рейтинга продукта
const updateProductRating = async (productId, transaction) => {
    const reviews = await Review.findAll({ where: { productId }, transaction });
    const reviewCount = reviews.length;
    let averageRating = null;

    if (reviewCount > 0) {
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        averageRating = (totalRating / reviewCount).toFixed(2);
    }

    await Product.update(
        { averageRating, reviewCount },
        { where: { id: productId }, transaction }
    );
};

exports.updateReview = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { rating, comment } = req.body;

        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден.' });
        }

        if (review.userId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав для редактирования этого отзыва.' });
        }

        await review.update({ rating, comment }, { transaction: t });
        await updateProductRating(review.productId, t);
        await t.commit();

        res.json({ message: 'Отзыв успешно обновлен.' });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка при обновлении отзыва:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteReview = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден.' });
        }

        if (review.userId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав для удаления этого отзыва.' });
        }

        const productId = review.productId;
        await review.destroy({ transaction: t });
        await updateProductRating(productId, t);
        await t.commit();

        res.json({ message: 'Отзыв успешно удален.' });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка при удалении отзыва:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};