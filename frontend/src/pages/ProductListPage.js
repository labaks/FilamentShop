import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoriteContext } from '../context/FavoriteContext';
import styles from '../styles/ProductCard.module.css'; // Импортируем стили карточки
import apiClient from '../api/apiClient';

const ProductListPage = () => {
    const { favoriteIds, toggleFavorite } = useContext(FavoriteContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('createdAt-DESC');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Состояние для отслеживания первоначальной загрузки
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Используем AbortController для отмены предыдущих запросов
        const controller = new AbortController();

        // Функция для загрузки товаров с бэкенда
        const fetchProducts = async () => {
            try {
                // Показываем индикатор загрузки только при первой загрузке
                if (isInitialLoad) setLoading(true);

                const params = new URLSearchParams({
                    page: currentPage,
                    limit: 8,
                });
                if (selectedCategory) {
                    params.append('categoryId', selectedCategory);
                }
                const [sortBy, sortOrder] = sortOption.split('-');
                params.append('sortBy', sortBy);
                params.append('sortOrder', sortOrder);

                if (searchTerm) {
                    params.append('search', searchTerm);
                }
                // Запрос к нашему API
                const response = await apiClient.get(`/products?${params.toString()}`, {
                    signal: controller.signal // Передаем сигнал для отмены
                });
                setProducts(response.data.products);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                if (err.name !== 'CanceledError') { // Не показываем ошибку, если запрос был отменен
                    setError('Не удалось загрузить товары. Попробуйте позже.');
                    console.error(err);
                }
            } finally {
                if (isInitialLoad) setLoading(false);
                setIsInitialLoad(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Не удалось загрузить категории', err);
            }
        };

        // Debounce (задержка) для поиска
        const handler = setTimeout(() => {
            fetchProducts();
        }, 300); // Задержка в 300 мс

        fetchCategories();

        // Очистка при размонтировании или повторном вызове эффекта
        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [currentPage, searchTerm, sortOption, selectedCategory]);

    if (loading) {
        return <div>Загрузка товаров...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу при новом поиске
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу при новой сортировке
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="product-list">
            <h2>Каталог товаров</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{ flex: '1', maxWidth: '400px' }}>
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>
                <div>
                    <select value={selectedCategory} onChange={handleCategoryChange} style={{ padding: '0.5rem', fontSize: '1rem' }}>
                        <option value="">Все категории</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select value={sortOption} onChange={handleSortChange} style={{ padding: '0.5rem', fontSize: '1rem' }}>
                        <option value="createdAt-DESC">Сначала новые</option>
                        <option value="price-ASC">Цена: по возрастанию</option>
                        <option value="price-DESC">Цена: по убыванию</option>
                        <option value="name-ASC">Название: А-Я</option>
                        <option value="name-DESC">Название: Я-А</option>
                    </select>
                </div>
            </div>

            {products.length === 0 ? (
                <p>Товаров пока нет.</p>
            ) : (
                <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                    {products.map((product) => {
                        const isFavorite = favoriteIds.has(product.id);
                        return (
                            <div key={product.id} className={styles.card}>
                                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div className={styles.imageContainer}>
                                        <img src={product.imageUrl || 'https://via.placeholder.com/220'} alt={product.name} className={styles.image} />
                                    </div>
                                    <div className={styles.info}>
                                        <h3>{product.name}</h3>
                                        <p>Цена: {product.price} лв.</p>
                                        <p>В наличии: {product.stock} шт.</p>
                                    </div>
                                </Link>
                                <button onClick={() => toggleFavorite(product.id)} className={styles.favoriteButton} style={{ color: isFavorite ? 'red' : 'grey' }}>
                                    <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                                </button>
                            </div>
                        );
                    })}
                </div>
                {totalPages > 1 && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            Назад
                        </button>
                        <span>Страница {currentPage} из {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            Вперед
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    );
};

export default ProductListPage;
