const db = require('../models');
const Product = db.Product;
const Category = db.Category;
const Manufacturer = db.Manufacturer;
const Material = db.Material;
const { Op } = require('sequelize'); // Импортируем операторы Sequelize

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const { search, categoryIds, manufacturerIds, materialIds, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } }, // iLike для регистронезависимого поиска
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Валидация параметров сортировки, чтобы разрешить только определенные поля
    const allowedSortBy = ['createdAt', 'price', 'name'];
    const orderField = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const order = [[orderField, orderDirection]];

    const options = {
      limit,
      offset,
      order,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Manufacturer, attributes: ['id', 'name'] },
        { model: Material, attributes: ['id', 'name'] },
      ]
    };

    if (categoryIds) { // Фильтрация по категориям (многие ко многим)
      where['$Categories.id$'] = { [Op.in]: categoryIds.split(',') };
    }
    if (manufacturerIds) {
      where.ManufacturerId = { [Op.in]: manufacturerIds.split(',') };
    }
    if (materialIds) {
      where.MaterialId = { [Op.in]: materialIds.split(',') };
    }

    options.where = where;
    const { count, rows } = await Product.findAndCountAll(options);

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
    const { name, price, description, imageUrls, stock, categoryIds, manufacturerId, materialId } = req.body;

    // Простая валидация
    if (!name || !price) {
      return res.status(400).json({ message: 'Поля "name" и "price" обязательны' });
    }

    const newProduct = await Product.create({ name, price, description, imageUrls, stock, manufacturerId, materialId });

    if (categoryIds && categoryIds.length > 0) {
      await newProduct.setCategories(categoryIds);
    }

    if (manufacturerId) {
      await newProduct.setManufacturer(manufacturerId);
    }
    if (materialId) {
      await newProduct.setMaterial(materialId);
    }

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
    const product = await Product.findByPk(id, {
      include: [
        { model: Category },
        { model: Manufacturer },
        { model: Material },
      ]
    });
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
    const { categoryIds, manufacturerId, materialId, ...productData } = req.body;
    const updatedProduct = await product.update(productData);

    if (categoryIds) { // Позволяем передавать пустой массив для удаления всех категорий
      await updatedProduct.setCategories(categoryIds);
    }

    if (manufacturerId !== undefined) { // Позволяем передавать null для удаления связи
      await updatedProduct.setManufacturer(manufacturerId);
    }

    if (materialId !== undefined) { // Позволяем передавать null для удаления связи
      await updatedProduct.setMaterial(materialId);
    }

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
