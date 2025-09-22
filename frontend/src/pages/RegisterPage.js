import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '../styles/AuthForm.module.css';

const RegisterPage = () => {
    // Импортируем общий модуль стилей
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username,
                password,
            });
            setSuccess(t('registration_success'));
            // Опционально: автоматическое перенаправление через несколько секунд
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                // Map backend error messages to translation keys if possible
                if (err.response.data.message.includes('уже существует')) {
                    setError(t('username_exists_error'));
                } else {
                    setError(err.response.data.message);
                }
            } else {
                setError(t('registration_error'));
            }
            console.error(err);
        }
    };

    return (
        <div className={styles.formContainer}> {/* Используем класс из общего модуля */}
            <h2>{t('register_title')}</h2>
            <form onSubmit={handleRegister}>
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
                {success && <p className={styles.successMessage}>{success}</p>} {/* Используем класс из общего модуля */}
                <button type="submit" className={styles.formButton}>{t('register_button')}</button> {/* Используем класс из общего модуля */}
            </form>
            <p className={styles.formLink}>{t('already_have_account')} <Link to="/login">{t('login')}</Link></p> {/* Используем класс из общего модуля */}
        </div>
    );
};

export default RegisterPage;
