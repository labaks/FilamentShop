import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { FavoriteContext } from '../context/FavoriteContext';
import styles from '../styles/ProductPage.module.css';

const ProductPage = () => {
    const { id } = useParams(); // Получаем id товара из URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { favoriteIds, toggleFavorite } = useContext(FavoriteContext);

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

    const isFavorite = favoriteIds.has(product.id);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.gridContainer}>
                <div className={styles.imageContainer}>
                    <img src={product.imageUrl || 'https://via.placeholder.com/500'} alt={product.name} className={styles.image} />
                </div>
                <div className={styles.detailsContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <button onClick={() => toggleFavorite(product.id)} className={styles.favoriteButton} style={{ color: isFavorite ? 'red' : 'grey' }}>
                            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                        </button>
                    </div>
                    <p className={styles.price}>{product.price} лв.</p>
                    <p className={styles.stock}>
                        <strong>В наличии: </strong>
                        <span className={product.stock > 0 ? styles.stockAvailable : styles.stockUnavailable}>
                            {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                        </span>
                    </p>
                    <p className={styles.description}>{product.description}</p>
                    <button onClick={() => addToCart(product)} disabled={product.stock === 0} className={styles.addToCartButton}>
                        Добавить в корзину
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
