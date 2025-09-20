import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        const decodedUser = jwtDecode(token);
        return decodedUser.role === 'admin' ? children : <Navigate to="/" />;
    } catch (error) {
        // Если токен невалидный, отправляем на логин
        return <Navigate to="/login" />;
    }
};

export default ProtectedRoute;
