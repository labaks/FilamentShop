const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), // Цена на момент покупки
            allowNull: false,
        },
        // OrderId и ProductId будут добавлены через ассоциации
    }, {
        tableName: 'order_items',
        timestamps: false,
    });

    return OrderItem;
};