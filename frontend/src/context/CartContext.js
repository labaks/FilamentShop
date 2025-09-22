import React, { createContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const CartContext = createContext();

// Компонент для кастомного уведомления
const ToastWithLink = ({ product, t }) => {
    return (
        <div>
            <p style={{ margin: 0, padding: 0 }}>{t('product_added_to_cart', { name: product.name })}</p>
            <Link to="/cart" style={{ color: '#a7d7ff', fontWeight: 'bold', textDecoration: 'underline' }}>
                {t('go_to_cart')}
            </Link>
        </div>
    );
};

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleToastClick = () => navigate('/cart');

    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Could not parse cart data from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantityToAdd = 1) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === product.id);
            if (itemExists) {
                // Увеличиваем количество, если товар уже в корзине
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantityToAdd) } : item
                );
            }
            // Добавляем новый товар
            return [...prevItems, { ...product, quantity: Math.min(product.stock, quantityToAdd) }];
        });
        toast.success(<ToastWithLink product={product} t={t} />, {
            onClick: handleToastClick,
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const itemToRemove = prevItems.find(item => item.id === productId);
            if (itemToRemove) {
                toast.info(t('product_removed_from_cart', { name: itemToRemove.name }));
            }
            return prevItems.filter(item => item.id !== productId);
        });
    };

    const updateQuantity = (productId, quantity) => {
        const newQuantity = Math.max(1, quantity); // Количество не может быть меньше 1
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    );
};