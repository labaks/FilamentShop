import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css'; // Подключаем новые стили
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.profileContainer}>
            <aside className={styles.sidebar}>
                <h2>{t('user_account')}</h2>
                <nav className={styles.nav}>
                    <NavLink to="/profile/me" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('my_profile')}
                    </NavLink>
                    <NavLink to="/profile/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('my_orders')}
                    </NavLink>
                    <NavLink to="/profile/favorites" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('my_favorites')}
                    </NavLink>
                    <NavLink to="/profile/security" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('security')}
                    </NavLink>
                </nav>
            </aside>
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
};

export default ProfilePage;