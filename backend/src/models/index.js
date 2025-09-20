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
// db.Order = require('./Order')(sequelize, DataTypes);

// Здесь можно определить ассоциации между моделями, например:
db.Category.hasMany(db.Product, { foreignKey: 'categoryId' });
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId' });

module.exports = db;
