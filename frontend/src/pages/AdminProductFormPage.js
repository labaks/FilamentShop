import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import styles from '../styles/AdminPage.module.css';
import { useTranslation } from 'react-i18next';

const AdminProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrls: [],
        stock: '',
        categoryIds: [],
        manufacturerIds: [],
        materialIds: [],
    });
    const [categories, setCategories] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };

        const fetchManufacturers = async () => {
            try {
                const response = await apiClient.get('/manufacturers');
                setManufacturers(response.data);
            } catch (err) {
                console.error('Failed to load manufacturers', err);
            }
        };

        const fetchMaterials = async () => {
            try {
                const response = await apiClient.get('/materials');
                setMaterials(response.data);
            } catch (err) {
                console.error('Failed to load materials', err);
            }
        };

        const fetchProduct = async () => {
            if (isEditing) {
                setLoading(true);
                try {
                    const response = await apiClient.get(`/products/${id}`);
                    const product = response.data;
                    setFormData({
                        name: product.name,
                        description: product.description || '',
                        price: product.price,
                        imageUrls: product.imageUrls || [],
                        stock: product.stock,
                        categoryIds: product.Categories.map(cat => cat.id) || [],
                        manufacturerIds: product.Manufacturers.map(m => m.id) || [],
                        materialIds: product.Materials.map(m => m.id) || [],
                    });
                } catch (err) {
                    setError(t('product_load_error'));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCategories();
        fetchManufacturers();
        fetchMaterials();
        fetchProduct();
    }, [id, isEditing, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        const uploadFormData = new FormData();
        for (let i = 0; i < files.length; i++) {
            uploadFormData.append('images', files[i]);
        }

        try {
            const response = await apiClient.post('/upload', uploadFormData);
            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...response.data.imageUrls] }));
        } catch (err) {
            setError(t('image_upload_error'));
        }
    };

    const handleRemoveImage = (urlToRemove) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
        }));
    };

    const handleCheckboxChange = (field, id) => {
        setFormData(prev => {
            const currentIds = prev[field];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(currentId => currentId !== id)
                : [...currentIds, id];
            return { ...prev, [field]: newIds };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            // categoryIds уже является массивом чисел
        };

        try {
            if (isEditing) {
                await apiClient.put(`/products/${id}`, productData);
            } else {
                await apiClient.post('/products', productData);
            }
            navigate('/admin/products');
        } catch (err) {
            setError(t('product_save_error'));
            console.error(err);
        }
    };

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <Link to="/admin/products">{t('back_to_product_list')}</Link>
            <form onSubmit={handleSubmit} className={styles.form} style={{ marginTop: '1rem' }}>
                <h3>{isEditing ? t('edit_product') : t('add_new_product')}</h3>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('product_name')} required />
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder={t('price')} required step="0.01" />
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder={t('stock_quantity')} required />
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder={t('description')}></textarea>
                <div className={styles.checkboxGroup}>
                    <label>{t('categories')}</label>
                    <div className={styles.checkboxContainer}>
                        {categories.map(cat => (
                            <label key={cat.id} className={styles.checkboxLabel}>
                                <input type="checkbox" checked={formData.categoryIds.includes(cat.id)} onChange={() => handleCheckboxChange('categoryIds', cat.id)} />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={styles.checkboxGroup}>
                    <label>{t('manufacturers')}</label>
                    <div className={styles.checkboxContainer}>
                        {manufacturers.map(man => (
                            <label key={man.id} className={styles.checkboxLabel}>
                                <input type="checkbox" checked={formData.manufacturerIds.includes(man.id)} onChange={() => handleCheckboxChange('manufacturerIds', man.id)} />
                                {man.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={styles.checkboxGroup}>
                    <label>{t('materials')}</label>
                    <div className={styles.checkboxContainer}>
                        {materials.map(mat => (
                            <label key={mat.id} className={styles.checkboxLabel}>
                                <input type="checkbox" checked={formData.materialIds.includes(mat.id)} onChange={() => handleCheckboxChange('materialIds', mat.id)} />
                                {mat.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>{t('product_images')}</label>
                    <input type="file" onChange={handleImageUpload} multiple />
                    <div className={styles.imagePreviewContainer}>
                        {formData.imageUrls.map((url, index) => (
                            <div key={index} className={styles.imagePreviewWrapper}>
                                <img 
                                    src={`http://localhost:5000${url}`} 
                                    alt={`Preview ${index + 1}`} 
                                    className={styles.imagePreview}
                                />
                                <button type="button" onClick={() => handleRemoveImage(url)} className={styles.removeImageButton}>
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <button type="submit" className={styles.submitButton}>{isEditing ? t('save_changes') : t('add_product')}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductFormPage;