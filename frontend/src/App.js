import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import ProductPage from './pages/ProductPage';
import ProductListPage from './pages/ProductListPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/"><img src={logo} className="App-logo" alt="logo" width="100" /></Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Мой Интернет-Магазин</h1></Link>
          <Link to="/admin" style={{ position: 'absolute', top: '20px', right: '20px', color: 'white' }}>Админ</Link>
        </header>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute><AdminPage /></ProtectedRoute>
              } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
