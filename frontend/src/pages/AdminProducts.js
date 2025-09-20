import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/AdminPage.module.css';

const API_URL = 'http://localhost:5000/api/products';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        id: null, name: '', description: '', price: '', imageUrl: '', stock: '', categoryId: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const interceptor = apiClient.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        fetchProducts();
        fetchCategories();

        return () => {
            apiClient.interceptors.request.eject(interceptor);
        };
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setProducts(response.data.products || []);
        } catch (err) {
            setError('Не удалось загрузить товары.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Не удалось загрузить категории', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        };

        try {
            if (isEditing) {
                await apiClient.put(`/products/${formData.id}`, productData);
            } else {
                await apiClient.post('/products', productData);
            }
            resetForm();
            await fetchProducts();
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
            categoryId: product.categoryId || '',
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await apiClient.delete(`/products/${id}`);
                await fetchProducts();
            } catch (err) {
                setError('Ошибка при удалении товара.');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: null, name: '', description: '', price: '', imageUrl: '', stock: '', categoryId: '' });
    };

    if (loading) return <div>Загрузка товаров...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3>{isEditing ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Название товара" required />
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Цена" required step="0.01" />
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Количество на складе" required />
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Описание"></textarea>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                    <option value="">-- Выберите категорию --</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="URL изображения" />
                <button type="submit" className={styles.submitButton}>{isEditing ? 'Сохранить изменения' : 'Добавить товар'}</button>
                {isEditing && <button type="button" onClick={resetForm} className={styles.cancelButton}>Отмена</button>}
            </form>

            <h2>Список товаров</h2>
            <table className={styles.table}>
                <thead>
                    <tr><th>ID</th><th>Название</th><th>Цена</th><th>На складе</th><th>Действия</th></tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td><td>{product.name}</td><td>{product.price}</td><td>{product.stock}</td>
                            <td className={styles.actions}>
                                <button onClick={() => handleEdit(product)}>Редактировать</button>
                                <button onClick={() => handleDelete(product.id)} className={styles.deleteButton}>Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default AdminProducts;