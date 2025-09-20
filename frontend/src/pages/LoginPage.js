import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import styles from '../styles/AuthForm.module.css'; // Используем общий модуль

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
        <div className={styles.formContainer}> {/* Используем класс из общего модуля */}
            <h2>Вход</h2>
            <form onSubmit={handleLogin}>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>Имя пользователя:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>Пароль:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>} {/* Используем класс из общего модуля */}
                <button type="submit" className={styles.formButton}>Войти</button> {/* Используем класс из общего модуля */}
            </form>
            <p className={styles.formLink}>Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></p> {/* Используем класс из общего модуля */}
        </div>
    );
};

export default LoginPage;
