const db = require('../models');
const { Order, OrderItem, Product } = db;
const { sequelize } = db;

exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction(); // Начинаем транзакцию

    try {
        const { customerInfo, cartItems, userId, deliveryMethod, deliveryType } = req.body;

        if (!customerInfo || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Некорректные данные для создания заказа.' });
        }

        // 1. Рассчитываем общую сумму заказа
        let totalAmount = 0;
        for (const item of cartItems) {
            const product = await Product.findByPk(item.id);
            if (!product) {
                throw new Error(`Товар с ID ${item.id} не найден.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Недостаточно товара "${product.name}" на складе.`);
            }
            totalAmount += product.price * item.quantity;
        }

        // 2. Создаем заказ
        const order = await Order.create({
            userId, // Может быть null для гостевых заказов
            customerInfo,
            totalAmount,
            // Добавляем информацию о доставке
            deliveryInfo: {
                method: deliveryMethod,
                type: deliveryType,
                // Сюда можно будет добавить ID офиса или полный адрес
            },
            status: 'pending',
        }, { transaction: t });

        // 3. Создаем позиции заказа и обновляем остатки на складе
        for (const item of cartItems) {
            const product = await Product.findByPk(item.id, { transaction: t });
            await OrderItem.create({
                orderId: order.id,
                productId: item.id,
                quantity: item.quantity,
                price: product.price, // Фиксируем цену на момент покупки
            }, { transaction: t });

            // Уменьшаем количество на складе
            product.stock -= item.quantity;
            await product.save({ transaction: t });
        }

        await t.commit(); // Завершаем транзакцию
        res.status(201).json({ message: 'Заказ успешно создан', orderId: order.id });

    } catch (error) {
        await t.rollback(); // Откатываем транзакцию в случае ошибки
        console.error('Ошибка при создании заказа:', error);
        res.status(500).json({ message: error.message || 'Ошибка сервера при создании заказа.' });
    }
};

// Получение всех заказов (для администратора)
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: db.User, attributes: ['id', 'username'] }] // Включаем информацию о пользователе
        });

        res.json({
            orders: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении всех заказов:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении заказов.' });
    }
};

// Получение заказов текущего пользователя
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id; // ID пользователя из токена
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'imageUrls'] }] }] // Включаем детали заказа
        });
        res.json(orders);
    } catch (error) {
        console.error('Ошибка при получении заказов пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении заказов.' });
    }
};

// Обновление статуса заказа (для администратора)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден.' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.' });
    }
};

// Получение одного заказа по ID (для администратора)
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [
                { model: db.User, attributes: ['id', 'username'] },
                {
                    model: OrderItem,
                    include: [{ model: Product, attributes: ['id', 'name'] }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден.' });
        }

        res.json(order);
    } catch (error) {
        console.error(`Ошибка при получении заказа с ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Ошибка сервера при получении заказа.' });
    }
};