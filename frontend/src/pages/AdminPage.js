import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/AdminPage.module.css';

const API_URL = 'http://localhost:5000/api/products';

// Создаем экземпляр axios с настройками
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояние для формы
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Interceptor для добавления токена в каждый запрос
    useEffect(() => {
        const token = localStorage.getItem('token'); // Токен точно есть, т.к. ProtectedRoute сработал
        
        const interceptor = apiClient.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        fetchProducts();

        // Очистка interceptor при размонтировании компонента
        return () => {
            apiClient.interceptors.request.eject(interceptor);
        };
    }, []);

    // Загрузка товаров
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL); // Для получения списка токен не нужен
            setProducts(response.data);
        } catch (err) {
            setError('Не удалось загрузить товары.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock, 10) };

        try {
            if (isEditing) {
                // Обновление
                await apiClient.put(`/products/${formData.id}`, productData);
            } else {
                // Создание
                await apiClient.post('/products', productData);
            }
            resetForm();
            await fetchProducts(); // Обновляем список
        } catch (err) {
            setError('Ошибка при сохранении товара.');
            console.error(err);
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            imageUrl: product.imageUrl || '',
            stock: product.stock,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await apiClient.delete(`/products/${id}`);
                await fetchProducts(); // Обновляем список
            } catch (err) {
                setError('Ошибка при удалении товара.');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({
            id: null,
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            stock: '',
        });
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1>Панель администратора</h1>
            </div>

            {/* Форма для добавления/редактирования */}
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3>{isEditing ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Название товара" required />
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Цена" required step="0.01" />
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Количество на складе" required />
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Описание"></textarea>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="URL изображения" />
                <button type="submit" className={styles.submitButton}>{isEditing ? 'Сохранить изменения' : 'Добавить товар'}</button>
                {isEditing && <button type="button" onClick={resetForm} className={styles.cancelButton}>Отмена</button>}
            </form>

            {/* Список товаров */}
            <h2>Список товаров</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>На складе</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>{product.stock}</td>
                            <td className={styles.actions}>
                                <button onClick={() => handleEdit(product)}>Редактировать</button>
                                <button onClick={() => handleDelete(product.id)} className={styles.deleteButton}>Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;