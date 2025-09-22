import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import styles from '../styles/AuthForm.module.css'; // Используем стили от форм для единообразия

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
    });
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState(''); // 'econt' или 'speedy'
    const [deliveryType, setDeliveryType] = useState(''); // 'office' или 'address'
    const [isProcessing, setIsProcessing] = useState(false);
    const [profileDataExists, setProfileDataExists] = useState(false);

    useEffect(() => {
        const checkProfileData = async () => {
            if (localStorage.getItem('token')) {
                try {
                    const response = await apiClient.get('/auth/profile');
                    const { firstName, lastName, email, phone, address, preferredDeliveryMethod, preferredDeliveryType } = response.data;
                    if (firstName || lastName || email || phone || address) {
                        setProfileDataExists(true);
                        setDeliveryMethod(preferredDeliveryMethod || '');
                        setDeliveryType(preferredDeliveryType || '');
                    }
                } catch (err) {
                    console.error("Could not check profile data", err);
                }
            }
        };
        checkProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleFillFromProfile = async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            const { firstName, lastName, email, phone, address, preferredDeliveryMethod, preferredDeliveryType } = response.data;
            setCustomerInfo({ firstName: firstName || '', lastName: lastName || '', email: email || '', phone: phone || '', address: address || '' });
            setDeliveryMethod(preferredDeliveryMethod || '');
            setDeliveryType(preferredDeliveryType || '');
        } catch (err) {
            toast.error(t('profile_load_error'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        let userId = null;
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                userId = decodedUser.id;
            } catch (err) {
                console.error("Invalid token on checkout", err);
            }
        }

        const orderData = {
            customerInfo,
            cartItems,
            userId,
            deliveryMethod,
            deliveryType,
        };

        try {
            await apiClient.post('/orders', orderData);
            toast.success(t('order_success'));
            clearCart();
            navigate('/profile/orders');
        } catch (err) {
            setError(err.response?.data?.message || t('order_error'));
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return <h2>{t('cart_is_empty_nothing_to_checkout')}</h2>;
    }

    return (
        <div className={styles.formContainer}>
            <h2>{t('checkout')}</h2>
            <form onSubmit={handleSubmit}>
                {profileDataExists && (
                    <button type="button" onClick={handleFillFromProfile} className={styles.profileButton}>
                        {t('fill_from_profile')}
                    </button>
                )}
                <h4>{t('contact_information')}</h4>
                <div className={styles.formGroup}>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>{t('first_name')}</label>
                            <input type="text" name="firstName" value={customerInfo.firstName} onChange={handleInputChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('last_name')}</label>
                            <input type="text" name="lastName" value={customerInfo.lastName} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('phone')}</label>
                        <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} required />
                    </div>
                </div>

                <hr />
                <h4>{t('delivery_method')}</h4>
                <div className={styles.radioGroup}>
                    <div className={styles.toggleSwitch}>
                        <div className={`${styles.toggleOption} ${deliveryMethod === 'econt' ? styles.active : ''}`} onClick={() => setDeliveryMethod('econt')}>
                            {t('courier_econt')}
                        </div>
                        <div className={`${styles.toggleOption} ${deliveryMethod === 'speedy' ? styles.active : ''}`} onClick={() => setDeliveryMethod('speedy')}>
                            {t('courier_speedy')}
                        </div>
                        {deliveryMethod && <div className={styles.toggleSlider} style={{ transform: deliveryMethod === 'speedy' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                    </div>

                    {deliveryMethod && (
                        <div className={styles.toggleSwitch}>
                            <div className={`${styles.toggleOption} ${deliveryType === 'office' ? styles.active : ''}`} onClick={() => setDeliveryType('office')}>
                                {t('to_office')}
                            </div>
                            <div className={`${styles.toggleOption} ${deliveryType === 'address' ? styles.active : ''}`} onClick={() => setDeliveryType('address')}>
                                {t('to_address')}
                            </div>
                            {deliveryType && <div className={styles.toggleSlider} style={{ transform: deliveryType === 'address' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                        </div>
                    )}
                </div>

                {deliveryType === 'office' && (
                    <div className={styles.formGroup}>
                        <label>{t('select_office')}</label>
                        {/* Здесь будет интеграция с API для выбора офиса */}
                        <select required>
                            <option value="">{t('office_integration_placeholder')}</option>
                        </select>
                    </div>
                )}

                {deliveryType === 'address' && (
                    <div className={styles.formGroup}>
                        <label>{t('delivery_address')}</label>
                        <textarea name="address" value={customerInfo.address} onChange={handleInputChange} required rows="3"></textarea>
                    </div>
                )}

                <hr />
                <h4>{t('total_to_pay')}: {cartTotal.toFixed(2)} {t('lv')}</h4>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button type="submit" className={styles.formButton} disabled={isProcessing}>
                    {isProcessing ? t('processing') : t('confirm_order')}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPage;