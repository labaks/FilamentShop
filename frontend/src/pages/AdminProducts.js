import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Modal from '../components/Modal';
import styles from '../styles/AdminPage.module.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products?limit=100'); // Загружаем больше товаров
            setProducts(response.data.products || []);
        } catch (err) {
            setError('Не удалось загрузить товары.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProductToDelete(null);
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            await apiClient.delete(`/products/${productToDelete.id}`);
            closeDeleteModal();
            await fetchProducts();
        } catch (err) {
            setError('Ошибка при удалении товара.');
            console.error(err);
        }
    };

    if (loading) return <div>Загрузка товаров...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Список товаров</h2>
                <Link to="/admin/products/new" className={styles.submitButton} style={{ textDecoration: 'none' }}>
                    Добавить товар
                </Link>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr><th>ID</th><th>Название</th><th>Цена</th><th>На складе</th><th>Действия</th></tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td><td>{product.name}</td><td>{product.price}</td><td>{product.stock}</td>
                            <td className={styles.actions}>
                                <Link to={`/admin/products/${product.id}`} title="Редактировать">
                                    <i className="fas fa-pencil-alt"></i>
                                </Link>
                                <button onClick={() => openDeleteModal(product)} className={styles.deleteButton} title="Удалить"><i className="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Подтвердите удаление товара"
            >
                <p>Вы уверены, что хотите удалить товар <strong>"{productToDelete?.name}"</strong>?</p>
            </Modal>
        </>
    );
};

export default AdminProducts;