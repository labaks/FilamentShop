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
db.Review = require('./Review')(sequelize, DataTypes);
db.Manufacturer = require('./Manufacturer')(sequelize, DataTypes);
db.Material = require('./Material')(sequelize, DataTypes);

// Здесь можно определить ассоциации между моделями, например:
// Связь многие-ко-многим между Товарами и Категориями
db.Product.belongsToMany(db.Category, { through: 'ProductCategory' });
db.Category.belongsToMany(db.Product, { through: 'ProductCategory' });
db.Product.belongsToMany(db.Manufacturer, { through: 'ProductManufacturer' });
db.Manufacturer.belongsToMany(db.Product, { through: 'ProductManufacturer' });
db.Product.belongsToMany(db.Material, { through: 'ProductMaterial' });
db.Material.belongsToMany(db.Product, { through: 'ProductMaterial' });

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

// Связи для отзывов
db.User.hasMany(db.Review, { foreignKey: 'userId' });
db.Review.belongsTo(db.User, { foreignKey: 'userId' });

db.Product.hasMany(db.Review, { foreignKey: 'productId' });
db.Review.belongsTo(db.Product, { foreignKey: 'productId' });

module.exports = db;
