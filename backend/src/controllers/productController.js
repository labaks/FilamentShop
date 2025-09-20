const db = require('../models');
const Product = db.Product;
const { Op } = require('sequelize'); // Импортируем операторы Sequelize

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const { search, categoryId, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } }, // iLike для регистронезависимого поиска
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Валидация параметров сортировки, чтобы разрешить только определенные поля
    const allowedSortBy = ['createdAt', 'price', 'name'];
    const orderField = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const order = [[orderField, orderDirection]];

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    res.json({
      products: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
  }
};

// Создание нового товара
exports.createProduct = async (req, res) => {
  try {
    // name, price, description, imageUrl, stock
    const { name, price, description, imageUrl, stock, categoryId } = req.body;

    // Простая валидация
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Поля "name", "price" и "categoryId" обязательны' });
    }

    const newProduct = await Product.create({ name, price, description, imageUrl, stock, categoryId });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании товара' });
  }
};

// Получение одного товара по ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Ошибка при получении товара с ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера при получении товара' });
  }
};

// Обновление товара по ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Обновляем товар данными из тела запроса
    const updatedProduct = await product.update(req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error(`Ошибка при обновлении товара с ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
  }
};

// Удаление товара по ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    await product.destroy();
    res.status(200).json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error(`Ошибка при удалении товара с ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
  }
};
