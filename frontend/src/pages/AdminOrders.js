import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../styles/AdminPage.module.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const interceptor = apiClient.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        const fetchOrders = async () => {
            try {
                setLoadingOrders(true);
                const response = await apiClient.get('/orders');
                setOrders(response.data.orders);
            } catch (err) {
                setError(t('order_load_error'));
                console.error(err);
            } finally {
                setLoadingOrders(false);
            }
        };
        
        fetchOrders();

        return () => apiClient.interceptors.request.eject(interceptor);
    }, [t]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            toast.error(t('order_status_update_error'));
        }
    };

    const statusMap = {
        pending: t('status_pending'),
        processing: t('status_processing'),
        shipped: t('status_shipped'),
        delivered: t('status_delivered'),
        cancelled: t('status_cancelled')
    };

    if (loadingOrders) return <p>{t('loading_orders')}</p>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <h2>{t('order_management')}</h2>
            <table className={styles.table}>
                <thead>
                    <tr><th>{t('order_id')}</th><th>{t('user')}</th><th>{t('amount')}</th><th>{t('date')}</th><th>{t('status')}</th></tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                            <td>{order.User ? order.User.username : t('guest')}</td><td>{order.totalAmount} {t('lv')}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                                    {Object.keys(statusMap).map(statusKey => (
                                        <option key={statusKey} value={statusKey}>{statusMap[statusKey]}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default AdminOrders;