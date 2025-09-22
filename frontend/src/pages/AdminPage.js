import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '../styles/AdminPage.module.css';

const AdminPage = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <h1>{t('admin_panel')}</h1>
                <nav className={styles.nav}>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('products')}
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('orders')}
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('categories')}
                    </NavLink>
                    <NavLink to="/admin/manufacturers" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('manufacturers')}
                    </NavLink>
                    <NavLink to="/admin/materials" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        {t('materials')}
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