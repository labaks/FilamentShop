import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductPage = () => {
    const { id } = useParams(); // Получаем id товара из URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('Товар не найден.');
                } else {
                    setError('Ошибка при загрузке товара.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]); // Эффект будет перезапускаться, если id изменится

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!product) {
        return null; // Или можно показать сообщение, что товар не найден
    }

    return (
        <div className="product-page">
            <h1>{product.name}</h1>
            <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} style={{ maxWidth: '400px', borderRadius: '8px' }} />
            <p><strong>Цена:</strong> {product.price} лв.</p>
            <p><strong>В наличии:</strong> {product.stock} шт.</p>
            <p>{product.description}</p>
            {/* TODO: Добавить кнопку "Добавить в корзину" */}
        </div>
    );
};

export default ProductPage;

