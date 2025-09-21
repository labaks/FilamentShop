import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
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
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCartItems(prevItems => {
            const itemToUpdate = prevItems.find(item => item.id === productId);
            if (!itemToUpdate) return prevItems;

            // Количество не может быть меньше 1 и больше, чем на складе
            const newQuantity = Math.max(1, Math.min(quantity, itemToUpdate.stock));

            return prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        });
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