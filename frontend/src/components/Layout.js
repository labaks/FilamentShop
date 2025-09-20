import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from '../logo.svg';

import ProductPage from '../pages/ProductPage';
import ProductListPage from '../pages/ProductListPage';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

const Layout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Недействительный токен:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <Link to="/"><img src={logo} className="App-logo" alt="logo" width="100" /></Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Мой Интернет-Магазин</h1></Link>
        <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', display: 'flex', gap: '15px', alignItems: 'center' }}>
          {user ? (<span>Привет, {user.username} <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Выйти</button></span>) : (<Link to="/login" style={{ color: 'white' }}>Войти</Link>)}
          {user && user.role === 'admin' && (<Link to="/admin" style={{ color: 'white' }}>Админ</Link>)}
        </div>
      </header>
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLogin={() => setUser(jwtDecode(localStorage.getItem('token')))} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute><AdminPage /></ProtectedRoute>
            } />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;