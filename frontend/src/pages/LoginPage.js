import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password,
            });
            const { token } = response.data;
            const decodedUser = jwtDecode(token);

            // Сохраняем токен в localStorage
            localStorage.setItem('token', token);
            onLogin(); // Сообщаем родительскому компоненту об успешном входе

            // Перенаправляем в зависимости от роли
            if (decodedUser.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/'); // Клиентов перенаправляем на главную
            }
        } catch (err) {
            setError('Неверное имя пользователя или пароль.');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Вход для администратора</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Имя пользователя:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Пароль:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Войти</button>
            </form>
            <p>Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></p>
        </div>
    );
};

export default LoginPage;
