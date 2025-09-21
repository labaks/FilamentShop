import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css'; // Подключаем новые стили

const ProfilePage = () => {
    return (
        <div className={styles.profileContainer}>
            <aside className={styles.sidebar}>
                <h2>Личный кабинет</h2>
                <nav className={styles.nav}>
                    <NavLink to="/profile/me" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Мой профиль
                    </NavLink>
                    <NavLink to="/profile/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Мои заказы
                    </NavLink>
                    <NavLink to="/profile/favorites" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Избранное
                    </NavLink>
                    <NavLink to="/profile/security" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Безопасность
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