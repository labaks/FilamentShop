import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import styles from '../styles/AdminPage.module.css';

const AdminPage = () => {
    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1>Панель администратора</h1>
            </div>
            <nav className={styles.nav}>
                <NavLink to="/admin/products" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                    Товары
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                    Заказы
                </NavLink>
            </nav>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminPage;