import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoriteContext } from '../context/FavoriteContext';
import cardStyles from '../styles/ProductCard.module.css'; // Стили для карточки товара
import pageStyles from '../styles/ProductListPage.module.css'; // Стили для страницы каталога
import apiClient from '../api/apiClient';

const ProductListPage = () => {
    const { favoriteIds, toggleFavorite } = useContext(FavoriteContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для пагинации и фильтров
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('createdAt-DESC');
    const [filterOptions, setFilterOptions] = useState({ categories: [], manufacturers: [], materials: [] });
    const [selectedFilters, setSelectedFilters] = useState({ categoryIds: [], manufacturerIds: [], materialIds: [] });

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

                // Добавляем массивы ID в параметры, если они не пусты
                if (selectedFilters.categoryIds.length > 0) params.append('categoryIds', selectedFilters.categoryIds.join(','));
                if (selectedFilters.manufacturerIds.length > 0) params.append('manufacturerIds', selectedFilters.manufacturerIds.join(','));
                if (selectedFilters.materialIds.length > 0) params.append('materialIds', selectedFilters.materialIds.join(','));

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

        const fetchFilterOptions = async () => {
            try {
                const [categoriesRes, manufacturersRes, materialsRes] = await Promise.all([
                    apiClient.get('/categories'),
                    apiClient.get('/manufacturers'),
                    apiClient.get('/materials')
                ]);
                setFilterOptions({
                    categories: categoriesRes.data,
                    manufacturers: manufacturersRes.data,
                    materials: materialsRes.data
                });
            } catch (err) {
                console.error('Не удалось загрузить опции для фильтров', err);
            }
        };

        // Debounce (задержка) для поиска
        const handler = setTimeout(() => {
            fetchProducts();
        }, 300); // Задержка в 300 мс

        fetchFilterOptions();

        // Очистка при размонтировании или повторном вызове эффекта
        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [currentPage, searchTerm, sortOption, selectedFilters]);

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

    const handleFilterChange = (filterType, value) => {
        const id = parseInt(value, 10);
        setSelectedFilters(prev => {
            const currentIds = prev[filterType];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(currentId => currentId !== id)
                : [...currentIds, id];
            return { ...prev, [filterType]: newIds };
        });
        setCurrentPage(1);
    };

    return (
        <div className={pageStyles.pageContainer}>
            <aside className={pageStyles.filters}>
                <h4>Фильтры</h4>
                <div className={pageStyles.filterGroup}>
                    <h4>Категории</h4>
                    <div className={pageStyles.checkboxContainer}>
                        {filterOptions.categories.map(cat => (
                            <label key={cat.id} className={pageStyles.checkboxLabel}>
                                <input type="checkbox" value={cat.id} checked={selectedFilters.categoryIds.includes(cat.id)} onChange={(e) => handleFilterChange('categoryIds', e.target.value)} />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={pageStyles.filterGroup}>
                    <h4>Производители</h4>
                    <div className={pageStyles.checkboxContainer}>
                        {filterOptions.manufacturers.map(man => (
                            <label key={man.id} className={pageStyles.checkboxLabel}>
                                <input type="checkbox" value={man.id} checked={selectedFilters.manufacturerIds.includes(man.id)} onChange={(e) => handleFilterChange('manufacturerIds', e.target.value)} />
                                {man.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={pageStyles.filterGroup}>
                    <h4>Материалы</h4>
                    <div className={pageStyles.checkboxContainer}>
                        {filterOptions.materials.map(mat => (
                            <label key={mat.id} className={pageStyles.checkboxLabel}>
                                <input type="checkbox" value={mat.id} checked={selectedFilters.materialIds.includes(mat.id)} onChange={(e) => handleFilterChange('materialIds', e.target.value)} />
                                {mat.name}
                            </label>
                        ))}
                    </div>
                </div>
            </aside>

            <div className={pageStyles.content}>
                <div className={pageStyles.topBar}>
                    <h2>Каталог товаров</h2>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ padding: '0.5rem', fontSize: '1rem' }}
                        />
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
                    <p>Товары, соответствующие вашему запросу, не найдены.</p>
                ) : (
                    <>
                        <div className={pageStyles.productGrid}>
                            {products.map((product) => {
                                const isFavorite = favoriteIds.has(product.id);
                                return (
                                    <div key={product.id} className={cardStyles.card}>
                                        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div className={cardStyles.imageContainer}>
                                                <img src={product.imageUrls && product.imageUrls.length > 0 ? `http://localhost:5000${product.imageUrls[0]}` : 'https://via.placeholder.com/220'} alt={product.name} className={cardStyles.image} />
                                            </div>
                                            <div className={cardStyles.info}>
                                                <h3>{product.name}</h3>
                                                <p>Цена: {product.price} лв.</p>
                                                <p>В наличии: {product.stock} шт.</p>
                                            </div>
                                        </Link>
                                        <button onClick={() => toggleFavorite(product.id)} className={cardStyles.favoriteButton} style={{ color: isFavorite ? 'red' : 'grey' }}>
                                            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {totalPages > 1 && (
                            <div className={pageStyles.pagination}>
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
        </div>
    );
};

export default ProductListPage;
