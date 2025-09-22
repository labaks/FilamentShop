import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import styles from '../styles/AuthForm.module.css'; // Используем стили от форм для единообразия

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
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
                    const { name, email, phone, address } = response.data;
                    if (name || email || phone || address) {
                        setProfileDataExists(true);
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
            const { name, email, phone, address } = response.data;
            setCustomerInfo({ name: name || '', email: email || '', phone: phone || '', address: address || '' });
        } catch (err) {
            toast.error('Не удалось загрузить данные профиля.');
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
            toast.success('Ваш заказ успешно оформлен!');
            clearCart();
            navigate('/profile/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось оформить заказ. Попробуйте снова.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return <h2>Ваша корзина пуста. Нечего оформлять.</h2>;
    }

    return (
        <div className={styles.formContainer}>
            <h2>Оформление заказа</h2>
            <form onSubmit={handleSubmit}>
                {profileDataExists && (
                    <button type="button" onClick={handleFillFromProfile} className={styles.profileButton}>
                        Заполнить из профиля
                    </button>
                )}
                <h4>Контактная информация</h4>
                <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange} required />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Телефон</label>
                        <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} required />
                    </div>
                </div>

                <hr />
                <h4>Способ доставки</h4>
                <div className={styles.radioGroup}>
                    <div className={styles.toggleSwitch}>
                        <div className={`${styles.toggleOption} ${deliveryMethod === 'econt' ? styles.active : ''}`} onClick={() => setDeliveryMethod('econt')}>
                            Еконт
                        </div>
                        <div className={`${styles.toggleOption} ${deliveryMethod === 'speedy' ? styles.active : ''}`} onClick={() => setDeliveryMethod('speedy')}>
                            Speedy
                        </div>
                        {deliveryMethod && <div className={styles.toggleSlider} style={{ transform: deliveryMethod === 'speedy' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                    </div>

                    {deliveryMethod && (
                        <div className={styles.toggleSwitch}>
                            <div className={`${styles.toggleOption} ${deliveryType === 'office' ? styles.active : ''}`} onClick={() => setDeliveryType('office')}>
                                До офиса
                            </div>
                            <div className={`${styles.toggleOption} ${deliveryType === 'address' ? styles.active : ''}`} onClick={() => setDeliveryType('address')}>
                                До адреса
                            </div>
                            {deliveryType && <div className={styles.toggleSlider} style={{ transform: deliveryType === 'address' ? 'translateX(100%)' : 'translateX(0)' }}></div>}
                        </div>
                    )}
                </div>

                {deliveryType === 'office' && (
                    <div className={styles.formGroup}>
                        <label>Выберите офис</label>
                        {/* Здесь будет интеграция с API для выбора офиса */}
                        <select required>
                            <option value="">-- Интеграция выбора офиса будет позже --</option>
                        </select>
                    </div>
                )}

                {deliveryType === 'address' && (
                    <div className={styles.formGroup}>
                        <label>Адрес доставки</label>
                        <textarea name="address" value={customerInfo.address} onChange={handleInputChange} required rows="3"></textarea>
                    </div>
                )}

                <hr />
                <h4>Итого к оплате: {cartTotal.toFixed(2)} лв.</h4>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button type="submit" className={styles.formButton} disabled={isProcessing}>
                    {isProcessing ? 'Обработка...' : 'Подтвердить заказ'}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPage;