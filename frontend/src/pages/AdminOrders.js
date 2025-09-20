import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../styles/AdminPage.module.css';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const interceptor = apiClient.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        fetchOrders();

        return () => {
            apiClient.interceptors.request.eject(interceptor);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const response = await apiClient.get('/orders');
            setOrders(response.data.orders);
        } catch (err) {
            setError('Не удалось загрузить заказы.');
            console.error(err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            alert('Не удалось обновить статус заказа.');
        }
    };

    if (loadingOrders) return <p>Загрузка заказов...</p>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <h2>Управление заказами</h2>
            <table className={styles.table}>
                <thead>
                    <tr><th>ID Заказа</th><th>Пользователь</th><th>Сумма</th><th>Дата</th><th>Статус</th></tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                            <td>{order.User ? order.User.username : 'Гость'}</td><td>{order.totalAmount} лв.</td><td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                                    <option value="pending">В ожидании</option><option value="processing">В обработке</option><option value="shipped">Отправлен</option><option value="delivered">Доставлен</option><option value="cancelled">Отменен</option>
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