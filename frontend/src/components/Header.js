import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';
import styles from '../styles/Header.module.css';
import { CartContext } from '../context/CartContext';

const Header = ({ user, onLogout }) => {
    const { cartCount } = useContext(CartContext);

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <Link to="/">
                    <img src={logo} className={styles.logo} alt="logo" />
                </Link>
                <Link to="/" className={styles.shopTitle}>
                    <h1>PLP Shop</h1>
                </Link>
            </div>
            <div className={styles.navContainer}>
                <Link to="/cart" className={styles.navLink}>
                    Корзина ({cartCount})
                </Link>
                {user && (
                    <Link to="/my-orders" className={styles.navLink}>Мои заказы</Link>
                )}
                {user ? (<span>Привет, {user.username}! <button onClick={onLogout} className={styles.logoutButton}>Выйти</button></span>) : (<Link to="/login" className={styles.navLink}>Войти</Link>)}
                {user && user.role === 'admin' && (<Link to="/admin" className={styles.navLink}>Админ-панель</Link>)}
            </div>
        </header>
    );
};

export default Header;