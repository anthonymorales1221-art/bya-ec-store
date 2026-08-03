import { useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { WhatsAppFloat } from './components/Footer';
import Landing from './pages/Landing';
import Store from './pages/Store';

function RouteScrollManager() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(null);

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const pathnameChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!pathnameChanged || hash) return undefined;

    let settleTimer;
    const resetDocumentScroll = () => {
      ScrollTrigger.clearScrollMemory('manual');
      document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    ScrollTrigger.addEventListener('refresh', resetDocumentScroll);
    const frame = requestAnimationFrame(() => {
      resetDocumentScroll();
      settleTimer = window.setTimeout(() => {
        resetDocumentScroll();
        ScrollTrigger.removeEventListener('refresh', resetDocumentScroll);
      }, 500);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      ScrollTrigger.removeEventListener('refresh', resetDocumentScroll);
    };
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteScrollManager />
      <ContentProvider>
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
      </ContentProvider>
    </BrowserRouter>
  );
}
