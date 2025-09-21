import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import styles from '../styles/AdminPage.module.css';

const AdminGenericCrud = ({ apiPath, title, placeholder }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemName, setEditingItemName] = useState('');

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(apiPath);
            setItems(response.data);
        } catch (err) {
            setError(`Не удалось загрузить ${title}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [apiPath]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        try {
            await apiClient.post(apiPath, { name: newItemName });
            setNewItemName('');
            await fetchItems();
        } catch (err) {
            alert(`Ошибка при создании: ${err.response?.data?.message || err.message}`);
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
            alert(`Ошибка при обновлении: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        // Здесь мы можем использовать наше кастомное модальное окно,
        // но для простоты пока оставим window.confirm,
        // так как для интеграции модального окна потребуется больше изменений в этом универсальном компоненте.
        if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
             try {
                 await apiClient.delete(`${apiPath}/${id}`);
                 await fetchItems();
             } catch (err) {
                 alert(`Ошибка при удалении: ${err.response?.data?.message || err.message}`);
             }
         }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <form onSubmit={handleCreate} className={styles.form}>
                <h3>Добавить новый элемент</h3>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={placeholder} required />
                <button type="submit" className={styles.submitButton}>Создать</button>
            </form>

            <h2 style={{ marginTop: '2rem' }}>{title}</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th style={{ width: '200px' }}>Действия</th>
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
                                    <><button onClick={() => handleUpdate(item.id)}>Сохранить</button><button onClick={handleCancelEdit}>Отмена</button></>
                                ) : (
                                    <><button onClick={() => handleEditClick(item)} title="Редактировать"><i className="fas fa-pencil-alt"></i></button><button onClick={() => handleDelete(item.id)} className={styles.deleteButton} title="Удалить"><i className="fas fa-trash-alt"></i></button></>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminGenericCrud;