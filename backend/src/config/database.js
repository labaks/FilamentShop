// backend/src/config/database.js
require('dotenv').config(); // Для загрузки переменных окружения из .env файла

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ecommercedb',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false, // Отключить логирование SQL-запросов в консоль
  },
  // Можно добавить конфигурации для production, test и т.д.
};
