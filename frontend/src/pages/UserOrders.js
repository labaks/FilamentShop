import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../styles/UserOrders.module.css';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [statusMap] = useState({
        // Добавим стили для каждого статуса
        pending: 'В ожидании',
        processing: 'В обработке',
        shipped: 'Отправлен',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Вы не авторизованы.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/orders/my', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrders(response.data);
            } catch (err) {
                setError('Не удалось загрузить историю заказов.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div>Загрузка ваших заказов...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className={styles.ordersContainer}>
            <h3>Мои заказы</h3>
            {orders.length === 0 ? (
                <p>У вас еще нет заказов.</p>
            ) : (
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>Номер заказа</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <React.Fragment key={order.id}>
                                <tr onClick={() => toggleOrderDetails(order.id)} className={styles.orderRow}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`${styles.status} ${styles[order.status]}`}>{statusMap[order.status] || order.status}</span></td>
                                    <td>{order.totalAmount} лв.</td>
                                    <td><i className={`fas fa-chevron-down ${expandedOrderId === order.id ? styles.expanded : ''}`}></i></td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className={styles.detailsRow}>
                                        <td colSpan="5">
                                            <div className={styles.orderDetails}>
                                                {order.OrderItems.map(item => (
                                                    <div key={item.id} className={styles.orderItem}>
                                                        <Link to={`/products/${item.productId}`}>
                                                            <img src={item.Product.imageUrls && item.Product.imageUrls.length > 0 ? `http://localhost:5000${item.Product.imageUrls[0]}` : 'https://via.placeholder.com/60'} alt={item.Product.name} />
                                                        </Link>
                                                        <div className={styles.itemInfo}>
                                                            <Link to={`/products/${item.productId}`}>{item.Product.name}</Link>
                                                            <span>{item.quantity} шт. x {item.price} лв.</span>
                                                        </div>
                                                        <strong>{(item.quantity * item.price).toFixed(2)} лв.</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserOrders;