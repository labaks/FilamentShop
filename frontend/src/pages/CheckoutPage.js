import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { CartContext } from '../context/CartContext';
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
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
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
        };

        try {
            await axios.post('http://localhost:5000/api/orders', orderData);
            clearCart();
            alert('Ваш заказ успешно оформлен!');
            navigate('/my-orders');
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
                <h4>Контактная информация</h4>
                <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Телефон</label>
                    <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Адрес доставки</label>
                    <textarea name="address" value={customerInfo.address} onChange={handleInputChange} required rows="3"></textarea>
                </div>
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