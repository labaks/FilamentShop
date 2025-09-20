import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);

    if (cartItems.length === 0) {
        return (
            <div>
                <h2>Ваша корзина пуста</h2>
                <Link to="/">Вернуться в каталог</Link>
            </div>
        );
    }

    return (
        <div>
            <h2>Корзина</h2>
            {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '1rem' }} />
                        <div>
                            <h4>{item.name}</h4>
                            <p>Цена: {item.price} лв.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                            min="1"
                            style={{ width: '50px', textAlign: 'center' }}
                        />
                        <p>Сумма: {(item.price * item.quantity).toFixed(2)} лв.</p>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Удалить
                        </button>
                    </div>
                </div>
            ))}
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <h3>Общая сумма: {cartTotal.toFixed(2)} лв.</h3>
                <button onClick={clearCart} style={{ marginRight: '1rem' }}>
                    Очистить корзину
                </button>
                <button style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Оформить заказ
                </button>
            </div>
        </div>
    );
};

export default CartPage;