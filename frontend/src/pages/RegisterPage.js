import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import styles from '../styles/AuthForm.module.css';

const RegisterPage = () => {
    // Импортируем общий модуль стилей
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username,
                password,
            });
            setSuccess('Регистрация прошла успешно! Теперь вы можете войти.');
            // Опционально: автоматическое перенаправление через несколько секунд
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Произошла ошибка при регистрации.');
            }
            console.error(err);
        }
    };

    return (
        <div className={styles.formContainer}> {/* Используем класс из общего модуля */}
            <h2>Регистрация нового пользователя</h2>
            <form onSubmit={handleRegister}>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>Имя пользователя:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className={styles.formGroup}> {/* Используем класс из общего модуля */}
                    <label>Пароль:</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <i 
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>} {/* Используем класс из общего модуля */}
                {success && <p className={styles.successMessage}>{success}</p>} {/* Используем класс из общего модуля */}
                <button type="submit" className={styles.formButton}>Зарегистрироваться</button> {/* Используем класс из общего модуля */}
            </form>
            <p className={styles.formLink}>Уже есть аккаунт? <Link to="/login">Войти</Link></p> {/* Используем класс из общего модуля */}
        </div>
    );
};

export default RegisterPage;
