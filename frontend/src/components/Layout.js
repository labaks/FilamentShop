import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import ProductPage from '../pages/ProductPage';
import ProductListPage from '../pages/ProductListPage';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminRoute from './AdminRoute';
import UserRoute from './UserRoute';
import CartPage from '../pages/CartPage'; 
import CheckoutPage from '../pages/CheckoutPage';
import AdminOrderDetailPage from '../pages/AdminOrderDetailPage';
import AdminProducts from '../pages/AdminProducts';
import AdminOrders from '../pages/AdminOrders';
import ProfilePage from '../pages/ProfilePage';
import UserProfile from '../pages/UserProfile';
import UserOrders from '../pages/UserOrders';
import UserFavorites from '../pages/UserFavorites';
import Header from './Header';

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
      <Header user={user} onLogout={handleLogout} />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage onLogin={() => setUser(jwtDecode(localStorage.getItem('token')))} />} />
          <Route
            path="/admin"
            element={<AdminRoute><AdminPage /></AdminRoute>}
          >
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          <Route
            path="/profile"
            element={<UserRoute><ProfilePage /></UserRoute>}
          >
            <Route index element={<UserProfile />} />
            <Route path="me" element={<UserProfile />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="favorites" element={<UserFavorites />} />
          </Route>
          <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;