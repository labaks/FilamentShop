import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <Layout />
      </CartProvider>
    </Router>
  );
}

export default App;
