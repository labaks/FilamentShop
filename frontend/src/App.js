import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <FavoriteProvider>
          <Layout />
        </FavoriteProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
