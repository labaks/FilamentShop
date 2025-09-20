import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // Если токена нет, перенаправляем на страницу входа
    return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
