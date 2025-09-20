import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import ProductPage from './pages/ProductPage';
import ProductListPage from './pages/ProductListPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/"><img src={logo} className="App-logo" alt="logo" width="100" /></Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>Мой Интернет-Магазин</h1></Link>
        </header>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
