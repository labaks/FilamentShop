import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { CartContext } from '../context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import AdminProductFormPage from '../pages/AdminProductFormPage';
import AdminCategories from '../pages/AdminCategories';
import AdminGenericCrud from '../pages/AdminGenericCrud';
import AdminOrders from '../pages/AdminOrders';
import ProfilePage from '../pages/ProfilePage';
import UserProfile from '../pages/UserProfile';
import UserOrders from '../pages/UserOrders';
import UserFavorites from '../pages/UserFavorites';
import UserSecurity from '../pages/UserSecurity';
import Header from './Header';

const Layout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

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
    clearCart(); // Очищаем корзину при выходе
    navigate('/');
  };

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:id" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="manufacturers" element={<AdminGenericCrud apiPath="/manufacturers" title="Производители" placeholder="Название производителя" />} />
            <Route path="materials" element={<AdminGenericCrud apiPath="/materials" title="Материалы" placeholder="Название материала" />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          <Route
            path="/profile"
            element={<UserRoute><ProfilePage /></UserRoute>}
          >
            <Route index element={<Navigate to="me" replace />} />
            <Route path="me" element={<UserProfile />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="favorites" element={<UserFavorites />} />
            <Route path="security" element={<UserSecurity />} />
          </Route>
          <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;