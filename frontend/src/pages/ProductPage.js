import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { CartContext } from '../context/CartContext';
import { FavoriteContext } from '../context/FavoriteContext';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import Modal from '../components/Modal';
import styles from '../styles/ProductPage.module.css';

const ProductPage = () => {
    const { id } = useParams(); // Получаем id товара из URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
    // Состояние для формы создания отзыва
    const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
    // Состояние для формы редактирования отзыва
    const [editingReview, setEditingReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [error, setError] = useState(null);
    const [reviewError, setReviewError] = useState('');
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useContext(CartContext);
    const { favoriteIds, toggleFavorite } = useContext(FavoriteContext);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setCurrentUser(jwtDecode(token));
        }
    }, []);

    useEffect(() => {
        const fetchProductAndReviews = async (page = 1) => {
            try {
                setLoading(true);
                // Используем Promise.all для параллельной загрузки
                const [productRes, reviewsRes] = await Promise.all([
                    apiClient.get(`/products/${id}`),
                    apiClient.get(`/reviews/${id}?page=${page}&limit=5`)
                ]);
                setProduct(productRes.data);
                if (productRes.data.imageUrls && productRes.data.imageUrls.length > 0) {
                    setMainImage(productRes.data.imageUrls[0]);
                }
                setReviews(reviewsRes.data.reviews);
                setReviewsCurrentPage(reviewsRes.data.currentPage);
                setReviewsTotalPages(reviewsRes.data.totalPages);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('Товар не найден.');
                } else {
                    setError('Ошибка при загрузке данных.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndReviews(reviewsCurrentPage);
    }, [id, reviewsCurrentPage]);

    const handleReviewsPageChange = (newPage) => {
        setReviewsCurrentPage(newPage);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setReviewError('Только авторизованные пользователи могут оставлять отзывы.');
            return;
        }
        if (reviewData.rating === 0) {
            setReviewError('Пожалуйста, выберите оценку.');
            return;
        }

        try {
            await apiClient.post(`/reviews/${id}`, reviewData);
            // Перезагружаем отзывы после успешной отправки
            const reviewsRes = await apiClient.get(`/reviews/${id}?page=1&limit=5`);
            setReviews(reviewsRes.data.reviews);
            setReviewsCurrentPage(reviewsRes.data.currentPage);
            setReviewsTotalPages(reviewsRes.data.totalPages);
            setReviewData({ rating: 0, comment: '' }); // Сбрасываем форму
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Не удалось отправить отзыв.');
        }
    };

    const handleEditClick = (review) => {
        setEditingReview({ ...review });
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
    };

    const handleUpdateReview = async () => {
        try {
            await apiClient.put(`/reviews/${editingReview.id}`, {
                rating: editingReview.rating,
                comment: editingReview.comment,
            });
            setEditingReview(null);
            // Просто перезагружаем текущую страницу отзывов
            const reviewsRes = await apiClient.get(`/reviews/${id}?page=${reviewsCurrentPage}&limit=5`);
            setReviews(reviewsRes.data.reviews);
        } catch (err) {
            toast.error('Не удалось обновить отзыв.');
        }
    };

    const openDeleteModal = (review) => {
        setReviewToDelete(review);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setReviewToDelete(null);
        setIsModalOpen(false);
    };

    const confirmDeleteReview = async () => {
        try {
            await apiClient.delete(`/reviews/${reviewToDelete.id}`);
            closeDeleteModal();
            // Перезагружаем отзывы
            const reviewsRes = await apiClient.get(`/reviews/${id}?page=${reviewsCurrentPage}&limit=5`);
            setReviews(reviewsRes.data.reviews);
        } catch (err) {
            toast.error('Не удалось удалить отзыв.');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<i key={i} className={`fas fa-star`} style={{ color: i <= rating ? '#ffc107' : '#e4e5e9' }}></i>);
        }
        return stars;
    };

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
    const itemInCart = cartItems.find(item => item.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.backLinkContainer}>
                <Link to="/" className={styles.backLink}>← Назад в каталог</Link>
            </div>
            <div className={styles.gridContainer}>
                <div className={styles.imageContainer}>
                    <button onClick={() => toggleFavorite(product.id)} className={styles.favoriteButton} style={{ color: isFavorite ? 'red' : 'grey' }}>
                        <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                    </button>
                    <img src={mainImage ? `http://localhost:5000${mainImage}` : 'https://via.placeholder.com/500'} alt={product.name} className={styles.mainImage} />
                    {product.imageUrls && product.imageUrls.length > 1 && (
                        <div className={styles.thumbnailContainer}>
                            {product.imageUrls.map((url, index) => (
                                <img key={index} src={`http://localhost:5000${url}`} alt={`Thumbnail ${index + 1}`}
                                    className={`${styles.thumbnail} ${url === mainImage ? styles.activeThumbnail : ''}`}
                                    onClick={() => setMainImage(url)} />
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.detailsContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>{product.name}</h1>
                    </div>

                    {product.reviewCount > 0 && (
                        <div className={styles.ratingSummary}>
                            {renderStars(product.averageRating)}
                            <span style={{ marginLeft: '10px' }}>{product.averageRating} ({product.reviewCount} отзывов)</span>
                        </div>
                    )}

                    {product.Categories && product.Categories.length > 0 && (
                        <div className={styles.categories}>
                            <strong>Категории:</strong>
                            {product.Categories.map(cat => <span key={cat.id} className={styles.categoryTag}>{cat.name}</span>)}
                        </div>
                    )}
                    {product.Manufacturers && product.Manufacturers.length > 0 && (
                        <div className={styles.categories}>
                            <strong>Производители:</strong>
                            {product.Manufacturers.map(man => <span key={man.id} className={styles.categoryTag}>{man.name}</span>)}
                        </div>
                    )}
                    {product.Materials && product.Materials.length > 0 && (
                        <div className={styles.categories}>
                            <strong>Материалы:</strong>
                            {product.Materials.map(mat => <span key={mat.id} className={styles.categoryTag}>{mat.name}</span>)}
                        </div>
                    )}

                    <p className={styles.price}>{product.price} лв.</p>
                    <p className={styles.stock}>
                        <strong>В наличии: </strong>
                        <span className={product.stock > 0 ? styles.stockAvailable : styles.stockUnavailable}>
                            {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                        </span>
                    </p>
                    <p className={styles.description}>{product.description}</p>
                    {(!currentUser || currentUser.role !== 'admin') && (
                        <div className={styles.actionsContainer}>
                            {quantityInCart > 0 && (
                                // Показываем счетчик, только если товар уже в корзине
                                    <div className={styles.quantitySelector}>
                                        <button onClick={() => quantityInCart === 1 ? removeFromCart(product.id) : updateQuantity(product.id, quantityInCart - 1)}>-</button>
                                        <input type="number" value={quantityInCart} readOnly />
                                        <button onClick={() => updateQuantity(product.id, quantityInCart + 1)} disabled={quantityInCart >= product.stock}>+</button>
                                    </div>
                            )}
                            <button onClick={() => addToCart(product, 1)} disabled={product.stock === 0 || quantityInCart >= product.stock} className={styles.addToCartButton}>
                                Добавить в корзину <i className="fas fa-plus" style={{ marginLeft: '10px' }}></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.reviewsSection}>
                <h3>Отзывы ({reviews.length})</h3>
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className={styles.review} >
                            {editingReview && editingReview.id === review.id ? (
                                // Форма редактирования
                                <div className={styles.reviewForm}>
                                    <div className={styles.starRatingInput}>
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;
                                            return (<label key={ratingValue}><input type="radio" name="edit-rating" checked={ratingValue === editingReview.rating} onChange={() => setEditingReview({ ...editingReview, rating: ratingValue })} style={{ display: 'none' }} /><i className="fas fa-star" style={{ color: ratingValue <= editingReview.rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer', fontSize: '1.5rem' }}></i></label>);
                                        })}
                                    </div>
                                    <textarea rows="3" value={editingReview.comment} onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}></textarea>
                                    <button onClick={handleUpdateReview} className={styles.addToCartButton}>Сохранить</button>
                                    <button onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>Отмена</button>
                                </div>
                            ) : (
                                // Отображение отзыва
                                <>
                                    <div className={styles.reviewHeader}>
                                        <strong>{review.User.username}</strong>
                                        <span className={styles.reviewRating}>{renderStars(review.rating)}</span>
                                    </div>
                                    <p>{review.comment}</p>
                                    <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                                    {currentUser && (currentUser.id === review.userId || currentUser.role === 'admin') && (
                                        <div className={styles.reviewActions}>
                                            <button onClick={() => handleEditClick(review)} title="Редактировать">
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button onClick={() => openDeleteModal(review)} title="Удалить" style={{ color: '#dc3545' }}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Отзывов пока нет. Будьте первым!</p>
                )}

                {reviewsTotalPages > 1 && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => handleReviewsPageChange(reviewsCurrentPage - 1)} disabled={reviewsCurrentPage === 1}>
                            Назад
                        </button>
                        <span>Страница {reviewsCurrentPage} из {reviewsTotalPages}</span>
                        <button onClick={() => handleReviewsPageChange(reviewsCurrentPage + 1)} disabled={reviewsCurrentPage === reviewsTotalPages}>
                            Вперед
                        </button>
                    </div>
                )}

                <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <h4>Оставить отзыв</h4>
                    <div className={styles.starRatingInput}>
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={ratingValue}>
                                    <input type="radio" name="rating" value={ratingValue} onClick={() => setReviewData({ ...reviewData, rating: ratingValue })} style={{ display: 'none' }} />
                                    <i className="fas fa-star" style={{ color: ratingValue <= reviewData.rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer', fontSize: '1.5rem' }}></i>
                                </label>
                            );
                        })}
                    </div>
                    <textarea
                        rows="4"
                        placeholder="Ваш комментарий..."
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    ></textarea>
                    {reviewError && <p style={{ color: 'red' }}>{reviewError}</p>}
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.addToCartButton} style={{ backgroundColor: '#007bff' }}>
                            <i className="fas fa-paper-plane" style={{ marginRight: '10px' }}></i> Отправить отзыв
                        </button>
                    </div>
                </form>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteReview}
                title="Подтвердите удаление отзыва"
            >
                <p>Вы уверены, что хотите удалить этот отзыв?</p>
                {reviewToDelete?.comment && <p><em>"{reviewToDelete.comment}"</em></p>}
            </Modal>
        </div>
    );
};

export default ProductPage;
