import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../styles/UserOrders.module.css';
import { useTranslation } from 'react-i18next';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError(t('unauthorized_orders_error'));
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
                setError(t('profile_load_error')); // Reusing a similar key
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [t]);

    if (loading) {
        return <div>{t('loading_orders')}</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const statusMap = {
        pending: t('status_pending'),
        processing: t('status_processing'),
        shipped: t('status_shipped'),
        delivered: t('status_delivered'),
        cancelled: t('status_cancelled')
    };

    return (
        <div className={styles.ordersContainer}>
            <h3>{t('my_orders')}</h3>
            {orders.length === 0 ? (
                <p>{t('no_orders_yet')}</p>
            ) : (
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>{t('order_number')}</th>
                            <th>{t('date')}</th>
                            <th>{t('status')}</th>
                            <th>{t('amount')}</th>
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
                                    <td>{order.totalAmount} {t('lv')}</td>
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
                                                            <span>{item.quantity} {t('pcs')} x {item.price} {t('lv')}</span>
                                                        </div>
                                                        <strong>{(item.quantity * item.price).toFixed(2)} {t('lv')}</strong>
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