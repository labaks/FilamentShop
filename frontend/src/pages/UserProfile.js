import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import styles from '../styles/AuthForm.module.css';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', preferredDeliveryMethod: '', preferredDeliveryType: '' });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [initialProfile, setInitialProfile] = useState(null); // Для отмены изменений
    const [error, setError] = useState('');    
    const { t } = useTranslation();

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/profile');
                // Убедимся, что все поля имеют значение, чтобы избежать uncontrolled-to-controlled warning
                const profileData = {
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    email: response.data.email || '', // email обычно всегда есть
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    preferredDeliveryMethod: response.data.preferredDeliveryMethod || '',
                    preferredDeliveryType: response.data.preferredDeliveryType || '',
                };
                if (isMounted) {
                    setProfile(profileData);
                    setInitialProfile(profileData); // Сохраняем исходные данные
                }
            } catch (err) {
                if (isMounted) setError(t('profile_load_error'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchProfile();
        return () => { isMounted = false; };
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleCancelEdit = () => {
        setProfile(initialProfile); // Возвращаем исходные данные
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiClient.put('/auth/profile', profile);
            toast.success(t('profile_update_success'));
            setInitialProfile(profile); // Обновляем исходные данные после сохранения
            setIsEditing(false); // Выходим из режима редактирования
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('profile_update_error');
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <div className={styles.formContainer} style={{ backgroundColor: 'white' }}>
            <div className={styles.profileHeader}>
                <h3>{t('personal_data')}</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                        <i className="fas fa-pencil-alt" style={{ marginRight: '8px' }}></i>
                        {t('edit')}
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>{t('first_name')}</label><input type="text" name="firstName" value={profile.firstName} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('last_name')}</label><input type="text" name="lastName" value={profile.lastName} onChange={handleChange} />
                        </div>
                    </div>
                    <div className={styles.formGroup}><label>Email</label><input type="email" name="email" value={profile.email} onChange={handleChange} /></div>
                    <div className={styles.formGroup}><label>{t('phone')}</label><input type="tel" name="phone" value={profile.phone} onChange={handleChange} /></div>
                    <div className={styles.formGroup}><label>{t('address')}</label><textarea name="address" value={profile.address} onChange={handleChange} rows="3"></textarea></div>
                    <div className={styles.formGroup}>
                        <label>{t('preferred_delivery_method')}</label>
                        <div className={styles.radioGroup} style={{ justifyContent: 'flex-start' }}>
                            <div className={styles.toggleSwitch}>
                                <div className={`${styles.toggleOption} ${profile.preferredDeliveryMethod === 'econt' ? styles.active : ''}`} onClick={() => setProfile({ ...profile, preferredDeliveryMethod: 'econt' })}>
                                    Еконт
                                </div>
                                <div className={`${styles.toggleOption} ${profile.preferredDeliveryMethod === 'speedy' ? styles.active : ''}`} onClick={() => setProfile({ ...profile, preferredDeliveryMethod: 'speedy' })}>
                                    Speedy
                                </div>
                                {profile.preferredDeliveryMethod && <div className={styles.toggleSlider} style={{ transform: profile.preferredDeliveryMethod === 'speedy' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                            </div>
                            <div className={styles.toggleSwitch}>
                                <div className={`${styles.toggleOption} ${profile.preferredDeliveryType === 'office' ? styles.active : ''}`} onClick={() => setProfile({ ...profile, preferredDeliveryType: 'office' })}>
                                    {t('to_office')}
                                </div>
                                <div className={`${styles.toggleOption} ${profile.preferredDeliveryType === 'address' ? styles.active : ''}`} onClick={() => setProfile({ ...profile, preferredDeliveryType: 'address' })}>
                                    {t('to_address')}
                                </div>
                                {profile.preferredDeliveryType && <div className={styles.toggleSlider} style={{ transform: profile.preferredDeliveryType === 'address' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.formButton}>{t('save_changes')}</button>
                        <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>{t('cancel')}</button>
                    </div>
                </form>
            ) : (
                <div className={styles.profileView}>
                    <div className={styles.profileField}>
                        <strong>{t('full_name')}:</strong>
                        <p>{`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || t('not_specified')}</p>
                    </div>
                    <div className={styles.profileField}><strong>Email:</strong><p>{profile.email || 'Не указано'}</p></div>
                    <div className={styles.profileField}><strong>{t('phone')}:</strong><p>{profile.phone || t('not_specified')}</p></div>
                    <div className={styles.profileField}><strong>{t('address')}:</strong><p>{profile.address || t('not_specified')}</p></div>
                    <div className={styles.profileField}>
                        <strong>{t('delivery')}:</strong>
                        <p>{profile.preferredDeliveryMethod && profile.preferredDeliveryType ? `${profile.preferredDeliveryMethod}, ${profile.preferredDeliveryType === 'office' ? t('to_office') : t('to_address')}` : t('not_specified')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;