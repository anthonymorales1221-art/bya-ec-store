import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { BRAND } from '../data/config';

function BrandMark() {
  return (
    <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-peach to-dust shadow-sm">
      <svg viewBox="0 0 48 48" className="w-6 h-6">
        <path d="M14 18c2-4 8-4 9 1" stroke="#2B2B2E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M34 22c-2 5-9 5-9-1" stroke="#2B2B2E" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const { cartCount, openCart } = useCart();
  const location = useLocation();
  const isStore = location.pathname.startsWith('/tienda');
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[200] transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-cream/95 border-b border-line shadow-sm'
          : 'backdrop-blur-md bg-cream/75 border-b border-transparent'
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandMark />
          <span className="leading-none">
            <span className="block font-display font-semibold text-xl tracking-tight">{BRAND.name}</span>
            <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft font-semibold">
              {BRAND.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Inicio', active: !isStore },
            { to: '/tienda', label: 'Tienda', active: isStore },
          ].map(({ to, label, active }) => (
            <Link
              key={to}
              to={to}
              className={`relative text-sm font-bold px-5 py-2.5 rounded-full transition-all ${
                active
                  ? 'text-ink bg-cream-deep'
                  : 'text-ink-soft hover:text-ink hover:bg-cream-deep/70'
              }`}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-cream-deep -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <motion.button
          type="button"
          onClick={openCart}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.02 }}
          className="relative flex items-center gap-2.5 bg-ink text-cream rounded-full px-5 py-2.5 font-bold text-sm hover:bg-[#1c1c1e] transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none">
            <path
              d="M3 6h2l2.2 11.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 8H6"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="9" cy="21" r="1.4" fill="currentColor" />
            <circle cx="17" cy="21" r="1.4" fill="currentColor" />
          </svg>
          Carrito
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-peach-deep text-ink rounded-full min-w-[20px] h-5 text-xs font-extrabold flex items-center justify-center px-1.5"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
}
