import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import styles from '../styles/AdminPage.module.css';
import { useTranslation } from 'react-i18next';

const AdminGenericCrud = ({ apiPath, title, placeholder }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemName, setEditingItemName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { t } = useTranslation();

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(apiPath);
            setItems(response.data);
        } catch (err) {
            setError(t('loading_data_error'));
        } finally {
            setLoading(false);
        }
    }, [apiPath, t]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        try {
            await apiClient.post(apiPath, { name: newItemName });
            setNewItemName('');
            await fetchItems();
        } catch (err) {
            toast.error(t('create_error', { message: err.response?.data?.message || err.message }));
        }
    };

    const handleEditClick = (item) => {
        setEditingItemId(item.id);
        setEditingItemName(item.name);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemName('');
    };

    const handleUpdate = async (id) => {
        try {
            await apiClient.put(`${apiPath}/${id}`, { name: editingItemName });
            handleCancelEdit();
            await fetchItems();
        } catch (err) {
            toast.error(t('update_error', { message: err.response?.data?.message || err.message }));
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setItemToDelete(null);
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await apiClient.delete(`${apiPath}/${itemToDelete.id}`);
            await fetchItems();
            toast.success(t('delete_success'));
        } catch (err) {
            toast.error(t('delete_error', { message: err.response?.data?.message || err.message }));
        } finally {
            closeDeleteModal();
        }
    };


    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <form onSubmit={handleCreate} className={styles.form}>
                <h3>{t('add_new_item')}</h3>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={placeholder} required />
                <button type="submit" className={styles.submitButton}>{t('create')}</button>
            </form>

            <h2 style={{ marginTop: '2rem' }}>{title}</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{t('name')}</th>
                        <th style={{ width: '200px' }}>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>
                                {editingItemId === item.id ? (
                                    <input type="text" value={editingItemName} onChange={(e) => setEditingItemName(e.target.value)} />
                                ) : (
                                    item.name
                                )}
                            </td>
                            <td className={styles.actions}>
                                {editingItemId === item.id ? (
                                    <><button onClick={() => handleUpdate(item.id)}>{t('save')}</button><button onClick={handleCancelEdit}>{t('cancel')}</button></>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditClick(item)} title={t('edit')}><i className="fas fa-pencil-alt"></i></button>
                                        <button onClick={() => openDeleteModal(item)} className={styles.deleteButton} title={t('delete')}><i className="fas fa-trash-alt"></i></button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={t('confirm_delete')}
            >
                <p>{t('confirm_delete_item', { name: itemToDelete?.name })}</p>
            </Modal>
        </div>
    );
};

export default AdminGenericCrud;