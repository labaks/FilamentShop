import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';
import styles from '../styles/Header.module.css';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next'; // Импортируем useTranslation

const Header = ({ user, onLogout }) => {
    const { cartCount } = useContext(CartContext);
    const { t, i18n } = useTranslation(); // Получаем инстанс i18n и функцию t

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <Link to="/" className={styles.shopTitle}>
                    <img src={logo} className={styles.logo} alt="logo" />
                    <h1>PLP Shop</h1>
                </Link>
            </div>
            <div className={styles.navContainer}>
                {/* Переключатель языка */}
                <div className={styles.langSwitcher}>
                    <button onClick={() => changeLanguage('bg')} className={i18n.language === 'bg' ? styles.activeLang : ''}>
                        BG
                    </button>
                    <button onClick={() => changeLanguage('en')} className={i18n.language.startsWith('en') ? styles.activeLang : ''}>
                        EN
                    </button>
                </div>
                {(user && user.role !== 'admin') && (
                    <Link to="/cart" className={styles.navLink} title={t('cart')}>
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
                            <Link to="/profile" className={styles.navLink} title={t('profile')}>
                                <i className="fas fa-user"></i> {user.username}
                            </Link>
                        )}
                        <button onClick={onLogout} className={styles.logoutButton} title={t('logout')}><i className="fas fa-sign-out-alt"></i></button>
                    </span>
                ) : (
                    <Link to="/login" className={styles.navLink}>{t('login')}</Link>
                )}
            </div>
        </header>
    );
};

export default Header;