import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminOrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

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
                setError(t('order_load_error'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, t]);

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!order) return <div>{t('order_load_error')}</div>;

    const { customerInfo } = order;
    
    return (
        <div>
            <Link to="/admin/orders">{t('back_to_order_list')}</Link>
            <h2>{t('order_details')} #{order.id}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4>{t('order_information')}</h4>
                    <p><strong>{t('date')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>{t('status')}:</strong> {order.status}</p>
                    <p><strong>{t('total_amount')}:</strong> {order.totalAmount} {t('lv')}</p>
                    <p><strong>{t('user')}:</strong> {order.User ? order.User.username : t('guest')}</p>
                </div>
                <div>
                    <h4>{t('customer_information')}</h4>
                    <p><strong>{t('name')}:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                    <p><strong>Email:</strong> {customerInfo.email}</p>
                    <p><strong>{t('phone')}:</strong> {customerInfo.phone}</p>
                    <p><strong>{t('address')}:</strong> {customerInfo.address}</p>
                    {order.deliveryInfo && (
                        <div style={{marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem'}}>
                            <p><strong>{t('delivery_method')}:</strong> {order.deliveryInfo.method}</p>
                            <p><strong>{t('delivery')}:</strong> {order.deliveryInfo.type === 'office' ? t('to_office') : t('to_address')}</p>
                        </div>
                    )}
                </div>
            </div>

            <h4 style={{ marginTop: '2rem' }}>{t('order_composition')}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('product_id')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('name')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('price_per_item')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('quantity')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('amount')}</th>
                    </tr>
                </thead>
                <tbody>
                    {order.OrderItems.map(item => (
                        <tr key={item.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.Product.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.Product.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.price} {t('lv')}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(item.price * item.quantity).toFixed(2)} {t('lv')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrderDetailPage;