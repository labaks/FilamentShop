const db = require('../models');
const Category = db.Category;

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json(categories);
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении категорий' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Название категории обязательно' });
        }
        const newCategory = await Category.create({ name });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Ошибка при создании категории:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании категории' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }
        category.name = name;
        await category.save();
        res.json(category);
    } catch (error) {
        console.error('Ошибка при обновлении категории:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении категории' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }

        // Проверяем, есть ли у категории связанные товары
        const productCount = await category.countProducts();
        if (productCount > 0) {
            return res.status(409).json({ message: `Нельзя удалить категорию, так как к ней привязано ${productCount} товар(ов).` });
        }

        await category.destroy();
        res.status(200).json({ message: 'Категория успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении категории' });
    }
};