import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Функция для загрузки товаров с бэкенда
        const fetchProducts = async () => {
            try {
                // Запрос к нашему API
                const response = await axios.get('http://localhost:5000/api/products');
                setProducts(response.data); // Сохраняем полученные данные в state
            } catch (err) {
                setError('Не удалось загрузить товары. Попробуйте позже.');
                console.error(err);
            } finally {
                setLoading(false); // Устанавливаем loading в false в любом случае
            }
        };

        fetchProducts();
    }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании компонента

    if (loading) {
        return <div>Загрузка товаров...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="product-list">
            <h2>Каталог товаров</h2>
            {products.length === 0 ? (
                <p>Товаров пока нет.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {products.map((product) => (
                        <Link to={`/products/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', width: '200px', cursor: 'pointer' }}>
                                <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                <h3>{product.name}</h3>
                                <p>Цена: {product.price} лв.</p>
                                <p>В наличии: {product.stock} шт.</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductListPage;
