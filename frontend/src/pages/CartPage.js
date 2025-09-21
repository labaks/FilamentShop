import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import styles from '../styles/CartPage.module.css';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);

    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <h2>Ваша корзина пуста</h2>
                <Link to="/">Вернуться в каталог</Link>
            </div>
        );
    }

    return (
        <div className={styles.cartContainer}>
            <h2>Корзина</h2>
            {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                    <Link to={`/products/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.itemInfo}>
                            <img src={item.imageUrls && item.imageUrls.length > 0 ? `http://localhost:5000${item.imageUrls[0]}` : 'https://via.placeholder.com/80'} alt={item.name} />
                            <div>
                                <h4>{item.name}</h4>
                                <p>Цена: {item.price} лв.</p>
                            </div>
                        </div>
                    </Link>
                    <div className={styles.itemControls}>
                        <div className={styles.quantitySelector}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                                min="1"
                                max={item.stock}
                            />
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                        </div>
                        <p className={styles.itemTotal}>{(item.price * item.quantity).toFixed(2)} лв.</p>
                        <button onClick={() => removeFromCart(item.id)} className={styles.removeButton} title="Удалить">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            ))}
            <div className={styles.cartSummary}>
                <h3>Общая сумма: {cartTotal.toFixed(2)} лв.</h3>
                <button onClick={clearCart} className={styles.clearButton}>
                    Очистить корзину
                </button>
                <Link to="/checkout" className={styles.checkoutButton}>
                    Оформить заказ
                </Link>
            </div>
        </div>
    );
};

export default CartPage;