import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import styles from '../styles/AuthForm.module.css';

const UserProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/profile');
                setProfile(response.data);
            } catch (err) {
                setError('Не удалось загрузить данные профиля.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const { username, ...updateData } = profile; // Исключаем username из отправки
            const response = await apiClient.put('/auth/profile', updateData);
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось обновить профиль.');
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <h3>Профиль пользователя</h3>
            <p><strong>Имя пользователя:</strong> {profile.username}</p>
            <form onSubmit={handleSubmit} className={styles.formContainer} style={{ margin: '0', maxWidth: '500px' }}>
                <div className={styles.formGroup}><label>Полное имя</label><input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} /></div>
                <div className={styles.formGroup}><label>Email</label><input type="email" name="email" value={profile.email || ''} onChange={handleInputChange} /></div>
                <div className={styles.formGroup}><label>Телефон</label><input type="tel" name="phone" value={profile.phone || ''} onChange={handleInputChange} /></div>
                <div className={styles.formGroup}><label>Адрес</label><textarea name="address" value={profile.address || ''} onChange={handleInputChange} rows="3"></textarea></div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <button type="submit" className={styles.formButton}>Сохранить изменения</button>
            </form>
        </div>
    );
};

export default UserProfile;