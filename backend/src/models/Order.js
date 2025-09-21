const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
            defaultValue: 'pending',
            allowNull: false,
        },
        customerInfo: {
            type: DataTypes.JSONB, // Используем JSONB для гибкого хранения данных клиента
            allowNull: false,
        },
        deliveryInfo: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        // UserId будет добавлено автоматически через ассоциацию
    }, {
        tableName: 'orders',
        timestamps: true,
    });

    return Order;
};