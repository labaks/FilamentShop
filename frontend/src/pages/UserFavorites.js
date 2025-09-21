import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FavoriteContext } from '../context/FavoriteContext';
import styles from '../styles/ProductCard.module.css'; // Импортируем стили

const UserFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toggleFavorite } = useContext(FavoriteContext);

    useEffect(() => {
        const fetchFavoriteProducts = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/api/favorites', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavorites(response.data);
            } catch (err) {
                setError('Не удалось загрузить избранные товары.');
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteProducts();
    }, []);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h3>Избранные товары</h3>
            {favorites.length === 0 ? (
                <p>У вас нет избранных товаров.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {favorites.map(product => {
                        return (
                            <div key={product.id} className={styles.card}>
                                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div className={styles.imageContainer}>
                                        <img src={product.imageUrls && product.imageUrls.length > 0 ? `http://localhost:5000${product.imageUrls[0]}` : 'https://via.placeholder.com/220'} alt={product.name} className={styles.image} />
                                    </div>
                                    <div className={styles.info}>
                                        <h3>{product.name}</h3>
                                        <p>Цена: {product.price} лв.</p>
                                    </div>
                                </Link>
                                <button onClick={() => toggleFavorite(product.id)} className={styles.favoriteButton} style={{ color: 'red' }}><i className="fas fa-heart"></i></button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserFavorites;