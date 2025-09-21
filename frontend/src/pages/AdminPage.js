import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import styles from '../styles/AdminPage.module.css';

const AdminPage = () => {
    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <h1>Админ-панель</h1>
                <nav className={styles.nav}>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Товары
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Заказы
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Категории
                    </NavLink>
                    <NavLink to="/admin/manufacturers" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Производители
                    </NavLink>
                    <NavLink to="/admin/materials" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        Материалы
                    </NavLink>
                </nav>
            </aside>
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPage;