const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = 'jsonwebtoken';
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Имя пользователя и пароль обязательны.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword });

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован.', userId: newUser.id });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует.' });
        }
        res.status(500).json({ message: 'Ошибка при регистрации.', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Неверные учетные данные.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверные учетные данные.' });
        }

        const token = require(jwt).sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Ошибка при входе в систему.', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // ID из токена
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Все поля обязательны.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный текущий пароль.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Пароль успешно изменен.' });
    } catch (error) {
        console.error('Ошибка при смене пароля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
