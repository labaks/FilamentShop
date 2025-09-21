import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import styles from '../styles/AuthForm.module.css';

const UserSecurity = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают.');
            return;
        }

        try {
            const response = await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            setSuccess(response.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось изменить пароль.');
        }
    };

    return (
        <div>
            <h3>Смена пароля</h3>
            <form onSubmit={handleSubmit} className={styles.formContainer} style={{ margin: '0', maxWidth: '500px' }}>
                <div className={styles.formGroup}>
                    <label>Текущий пароль</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                        ></i>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Новый пароль</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                        ></i>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Подтвердите новый пароль</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                            title={showPasswords ? 'Скрыть пароли' : 'Показать пароли'}
                        ></i>
                    </div>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <button type="submit" className={styles.formButton}>
                    Изменить пароль
                </button>
            </form>
        </div>
    );
};

export default UserSecurity;
