import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Modal from '../components/Modal';
import styles from '../styles/AdminPage.module.css';
import { useTranslation } from 'react-i18next';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const { t } = useTranslation();

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products?limit=100'); // Загружаем больше товаров
            setProducts(response.data.products || []);
        } catch (err) {
            setError(t('product_load_error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
            setError(t('product_delete_error'));
            console.error(err);
        }
    };

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{t('product_list')}</h2>
                <Link to="/admin/products/new" className={styles.submitButton} style={{ textDecoration: 'none' }}>
                    {t('add_product')}
                </Link>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr><th>ID</th><th>{t('name')}</th><th>{t('price')}</th><th>{t('stock')}</th><th>{t('actions')}</th></tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td><td>{product.name}</td><td>{product.price}</td><td>{product.stock}</td>
                            <td className={styles.actions}>
                                <Link to={`/admin/products/${product.id}`} title={t('edit')}>
                                    <i className="fas fa-pencil-alt"></i>
                                </Link>
                                <button onClick={() => openDeleteModal(product)} className={styles.deleteButton} title={t('delete')}><i className="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={t('confirm_delete_product')}
            >
                <p>{t('confirm_delete_product_item', { name: productToDelete?.name })}</p>
            </Modal>
        </>
    );
};

export default AdminProducts;