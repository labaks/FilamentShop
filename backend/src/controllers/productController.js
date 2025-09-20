const db = require('../models');
const Product = db.Product;

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
  }
};

// Создание нового товара
exports.createProduct = async (req, res) => {
  try {
    // name, price, description, imageUrl, stock
    const { name, price, description, imageUrl, stock } = req.body;

    // Простая валидация
    if (!name || !price) {
      return res.status(400).json({ message: 'Поля "name" и "price" обязательны' });
    }

    const newProduct = await Product.create({ name, price, description, imageUrl, stock });
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
