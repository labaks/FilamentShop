import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import styles from '../styles/AuthForm.module.css';
import { useTranslation } from 'react-i18next';

const UserSecurity = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError(t('passwords_do_not_match'));
            return;
        }

        try {
            await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            setSuccess(t('password_change_success'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || t('password_change_fail'));
        }
    };

    return (
        <div>
            <h3>{t('change_password')}</h3>
            <form onSubmit={handleSubmit} className={styles.formContainer} style={{ margin: '0', maxWidth: '500px' }}>
                <div className={styles.formGroup}>
                    <label>{t('current_password')}</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                        ></i>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>{t('new_password')}</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                        ></i>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>{t('confirm_new_password')}</label>
                    <div className={styles.passwordInputContainer}>
                        <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <i
                            className={`fas ${showPasswords ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`} 
                            onClick={() => setShowPasswords(!showPasswords)}
                            title={showPasswords ? t('hide_password') : t('show_password')}
                        ></i>
                    </div>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <button type="submit" className={styles.formButton}>
                    {t('change_password')}
                </button>
            </form>
        </div>
    );
};

export default UserSecurity;
