import React from 'react';
import { jwtDecode } from 'jwt-decode';

const UserProfile = () => {
    const token = localStorage.getItem('token');
    let user = null;
    if (token) {
        user = jwtDecode(token);
    }

    return (
        <div>
            <h3>Профиль пользователя</h3>
            <p><strong>Имя пользователя:</strong> {user?.username}</p>
            <p><strong>Роль:</strong> {user?.role}</p>
        </div>
    );
};

export default UserProfile;