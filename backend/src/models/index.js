const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/database');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: config.logging,
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Загружаем модели
db.Product = require('./Product')(sequelize, DataTypes);
db.Category = require('./Category')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Order = require('./Order')(sequelize, DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, DataTypes);
db.Favorite = require('./Favorite')(sequelize, DataTypes);

// Здесь можно определить ассоциации между моделями, например:
db.Category.hasMany(db.Product, { foreignKey: 'categoryId' });
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId' });

// Связи для заказов
db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

db.Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId' });

// Связи для избранного (многие-ко-многим)
db.User.belongsToMany(db.Product, { through: db.Favorite, foreignKey: 'userId' });
db.Product.belongsToMany(db.User, { through: db.Favorite, foreignKey: 'productId' });

// Также можно добавить прямые связи, если нужно
db.User.hasMany(db.Favorite, { foreignKey: 'userId' });
db.Favorite.belongsTo(db.User, { foreignKey: 'userId' });
db.Product.hasMany(db.Favorite, { foreignKey: 'productId' });
db.Favorite.belongsTo(db.Product, { foreignKey: 'productId' });

module.exports = db;
