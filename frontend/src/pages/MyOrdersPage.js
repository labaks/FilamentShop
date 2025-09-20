import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [statusMap] = useState({
        pending: 'В ожидании',
        processing: 'В обработке',
        shipped: 'Отправлен',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div>
            <h2>Мои заказы</h2>
            {orders.length === 0 ? (
                <p>У вас еще нет заказов.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                        <h4>Заказ №{order.id} от {new Date(order.createdAt).toLocaleDateString()}</h4>
                        <p><strong>Статус:</strong> {statusMap[order.status] || order.status}</p>
                        <p><strong>Общая сумма:</strong> {order.totalAmount} лв.</p>
                        <h5>Товары в заказе:</h5>
                        <ul>
                            {order.OrderItems.map(item => (
                                <li key={item.id}>
                                    {item.Product.name} - {item.quantity} шт. x {item.price} лв.
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyOrdersPage;