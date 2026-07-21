import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { BRAND } from '../data/config';
import { useCart } from '../hooks/useCart';
import ScrollProgress from './ScrollProgress';

function BrandMark({ premium = false }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ${
        premium ? 'ring-1 ring-[var(--ba-copper-soft)]/70' : 'ring-1 ring-line'
      }`}
    >
      <img
        src="/images/logo/ba-ec-logo.png"
        alt="Logo de B&A.EC Store"
        width="1024"
        height="1024"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

function StoreNavbar({ scrolled }) {
  const { cartCount, openCart } = useCart();
  return (
    <header className={`sticky top-0 z-[200] border-b transition-all duration-300 ${scrolled ? 'border-line bg-cream/95 shadow-sm backdrop-blur-xl' : 'border-transparent bg-cream/75 backdrop-blur-md'}`}>
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <BrandMark />
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-tight">{BRAND.name}</span>
            <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">{BRAND.tagline}</span>
          </span>
        </Link>
        <nav aria-label="Navegación de tienda" className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-full px-5 py-2.5 text-sm font-bold text-ink-soft transition-all hover:bg-cream-deep/70 hover:text-ink">Inicio</Link>
          <Link to="/tienda" aria-current="page" className="rounded-full bg-cream-deep px-5 py-2.5 text-sm font-bold text-ink">Tienda</Link>
        </nav>
        <motion.button type="button" onClick={openCart} whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.02 }} className="relative flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream shadow-sm transition-colors hover:bg-[#1c1c1e]">
          <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" aria-hidden="true">
            <path d="M3 6h2l2.2 11.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="21" r="1.4" fill="currentColor" /><circle cx="17" cy="21" r="1.4" fill="currentColor" />
          </svg>
          Carrito
          <AnimatePresence>{cartCount > 0 && <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-peach-deep px-1.5 text-xs font-extrabold text-ink">{cartCount}</motion.span>}</AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
}

const LANDING_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#categorias', label: 'Categorías' },
  { href: '#seleccion', label: 'Selección' },
  { href: '#como-comprar', label: 'Cómo comprar' },
  { href: '#opiniones', label: 'Opiniones' },
];

function LandingNavbar({ scrolled }) {
  const { contactWhatsAppForHelp } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState('');

  const navigateToSection = (event, href) => {
    event.preventDefault();
    setPendingTarget(href);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen || !pendingTarget) return undefined;
    let scrollFrame = 0;
    const closeFrame = requestAnimationFrame(() => {
      scrollFrame = requestAnimationFrame(() => {
        const target = document.querySelector(pendingTarget);
        if (!target) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.history.replaceState(null, '', pendingTarget);
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        setPendingTarget('');
      });
    });
    return () => {
      cancelAnimationFrame(closeFrame);
      cancelAnimationFrame(scrollFrame);
    };
  }, [menuOpen, pendingTarget]);

  return (
    <header className={`sticky top-0 z-[200] border-b transition-all duration-300 ${scrolled || menuOpen ? 'border-[var(--ba-border)] bg-[var(--ba-warm-white)]/95 shadow-[0_8px_30px_rgba(16,36,62,0.06)] backdrop-blur-xl' : 'border-transparent bg-[var(--ba-ivory)]/80 backdrop-blur-md'}`}>
      <ScrollProgress />
      <div className={`mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 transition-[min-height] duration-300 sm:px-8 lg:px-10 ${scrolled ? 'min-h-16' : 'min-h-[72px]'}`}>
        <a href="#inicio" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <BrandMark premium />
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-tight text-[var(--ba-navy-deep)] sm:text-xl">B&A.EC Store</span>
            <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--ba-muted)]">Boutique multirrubro</span>
          </span>
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center gap-5 xl:flex">
          {LANDING_LINKS.map((item) => <a key={item.href} href={item.href} className="py-3 text-[0.78rem] font-bold text-[var(--ba-muted)] transition-colors hover:text-[var(--ba-navy)]">{item.label}</a>)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/tienda" className="inline-flex min-h-11 items-center rounded-full border border-[var(--ba-border)] bg-[var(--ba-warm-white)] px-5 text-sm font-extrabold text-[var(--ba-navy)] transition hover:border-[var(--ba-copper-soft)]">Ir a la tienda</Link>
          <button type="button" onClick={contactWhatsAppForHelp} className="inline-flex min-h-11 items-center rounded-full bg-[var(--ba-navy)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--ba-navy-deep)]">Hablar con un asesor</button>
        </div>

        <button type="button" aria-expanded={menuOpen} aria-controls="landing-mobile-menu" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ba-border)] bg-[var(--ba-warm-white)] text-[var(--ba-navy)] md:hidden">
          {menuOpen ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
        </button>
      </div>

      {menuOpen && (
        <nav id="landing-mobile-menu" aria-label="Navegación móvil" className="border-t border-[var(--ba-border)] bg-[var(--ba-warm-white)] px-5 pb-5 pt-3 md:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col">
            {LANDING_LINKS.map((item) => <a key={item.href} href={item.href} onClick={(event) => navigateToSection(event, item.href)} className="flex min-h-12 items-center border-b border-[var(--ba-border)]/70 text-sm font-bold text-[var(--ba-graphite)]">{item.label}</a>)}
            <Link to="/tienda" onClick={() => setMenuOpen(false)} className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--ba-navy)] text-sm font-extrabold text-[var(--ba-navy)]">Ir a la tienda</Link>
            <button type="button" onClick={() => { setMenuOpen(false); contactWhatsAppForHelp(); }} className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ba-navy)] text-sm font-extrabold text-white">Hablar con un asesor</button>
          </div>
        </nav>
      )}
    </header>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return location.pathname.startsWith('/tienda') ? <StoreNavbar scrolled={scrolled} /> : <LandingNavbar scrolled={scrolled} />;
}
