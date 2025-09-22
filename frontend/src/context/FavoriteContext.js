import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useTranslation } from 'react-i18next';

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    const { t } = useTranslation();
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    const fetchFavorites = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setFavoriteIds(new Set()); // Очищаем, если пользователь разлогинился
            return;
        }
        try {
            const response = await apiClient.get('/favorites');
            const ids = new Set(response.data.map(fav => fav.id));
            setFavoriteIds(ids);
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('add_to_favorites_login_prompt'));
            return;
        }
        
        const isFavorite = favoriteIds.has(productId);

        try {
            if (isFavorite) {
                await apiClient.delete(`/favorites/${productId}`);
            } else {
                await apiClient.post(`/favorites/${productId}`, {});
            }
            await fetchFavorites(); // Обновляем список после изменения
        } catch (error) {
            console.error("Failed to toggle favorite", error);
        }
    };

    return (
        <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite, fetchFavorites }}>
            {children}
        </FavoriteContext.Provider>
    );
};