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
                {(user && user.role !== 'admin') && (
                    <Link to="/cart" className={styles.navLink}>
                        <i className="fas fa-shopping-cart"></i>
                        <span className={styles.cartCount}>({cartCount})</span>
                    </Link>
                )}
                {user ? (
                    <span className={styles.userActions}>
                        {user.role === 'admin' ? (
                            <Link to="/admin" className={styles.navLink}>
                                <i className="fas fa-user-shield"></i> {user.username}
                            </Link>
                        ) : (
                            <Link to="/profile" className={styles.navLink}>
                                <i className="fas fa-user"></i> {user.username}
                            </Link>
                        )}
                        <button onClick={onLogout} className={styles.logoutButton} title="Выйти"><i className="fas fa-sign-out-alt"></i></button>
                    </span>
                ) : (
                    <Link to="/login" className={styles.navLink}>Войти</Link>
                )}
            </div>
        </header>
    );
};

export default Header;