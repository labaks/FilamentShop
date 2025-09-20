// backend/src/app.js
const express = require('express');
const cors = require('cors');

require('dotenv').config(); // Для загрузки переменных окружения из .env файла
const db = require('./models'); // Подключение к базе данных
const productRoutes = require('./routes/productRoutes'); // Маршруты для товаров

const app = express();

// Middleware
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Позволяем серверу принимать JSON в теле запроса

// Простой тестовый маршрут
app.get('/', (req, res) => {
    res.send('Привет от бэкенда интернет-магазина!');
});

// Подключаем маршруты для товаров
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Подключение к базе данных установлено успешно.');

        // `force: false` означает, что таблицы не будут удаляться при каждом запуске
        await db.sequelize.sync({ force: false }); 
        console.log('Все модели синхронизированы успешно.');

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error('Не удалось запустить сервер:', error);
    }
})();
