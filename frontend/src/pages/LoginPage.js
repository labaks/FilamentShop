import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

import styles from '../styles/AuthForm.module.css'; // Используем общий модуль

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

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
            setError(t('invalid_credentials_error'));
            console.error(err);
        }
    };

    return (
        <div className={styles.formContainer}> {/* Используем класс из общего модуля */}
            <h2>{t('login')}</h2>
            <form onSubmit={handleLogin}>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>{t('username_label')}</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>{t('password_label')}</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <i 
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>} {/* Используем класс из общего модуля */}
                <button type="submit" className={styles.formButton}>{t('login')}</button> {/* Используем класс из общего модуля */}
            </form>
            <p className={styles.formLink}>{t('no_account_prompt')} <Link to="/register">{t('register_link')}</Link></p> {/* Используем класс из общего модуля */}
        </div>
    );
};

export default LoginPage;
