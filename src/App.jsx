import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { WhatsAppFloat } from './components/Footer';
import Landing from './pages/Landing';
import Store from './pages/Store';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/tienda" element={<Store />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <CartDrawer />
        <WhatsAppFloat />
      </CartProvider>
    </BrowserRouter>
  );
}
