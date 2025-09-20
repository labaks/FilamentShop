import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminOrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        apiClient.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        const fetchOrder = async () => {
            try {
                const response = await apiClient.get(`/orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                setError('Не удалось загрузить детали заказа.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div>Загрузка деталей заказа...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!order) return <div>Заказ не найден.</div>;

    const { customerInfo } = order;

    return (
        <div>
            <Link to="/admin">← Назад к списку заказов</Link>
            <h2>Детали заказа №{order.id}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4>Информация о заказе</h4>
                    <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Статус:</strong> {order.status}</p>
                    <p><strong>Общая сумма:</strong> {order.totalAmount} лв.</p>
                    <p><strong>Пользователь:</strong> {order.User ? order.User.username : 'Гость'}</p>
                </div>
                <div>
                    <h4>Информация о покупателе</h4>
                    <p><strong>Имя:</strong> {customerInfo.name}</p>
                    <p><strong>Email:</strong> {customerInfo.email}</p>
                    <p><strong>Телефон:</strong> {customerInfo.phone}</p>
                    <p><strong>Адрес:</strong> {customerInfo.address}</p>
                </div>
            </div>

            <h4 style={{ marginTop: '2rem' }}>Состав заказа</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID Товара</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Название</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Цена за шт.</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {order.OrderItems.map(item => (
                        <tr key={item.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.Product.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.Product.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.price} лв.</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(item.price * item.quantity).toFixed(2)} лв.</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrderDetailPage;