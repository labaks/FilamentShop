import React from 'react';
import { Navigate } from 'react-router-dom';

const UserRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Если токена нет, перенаправляем на страницу входа
        return <Navigate to="/login" />;
    }

    // Если токен есть, пользователь авторизован и может получить доступ
    return children;
};

export default UserRoute;