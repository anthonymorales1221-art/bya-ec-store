import { Link, useLocation } from 'react-router-dom';
import { BRAND } from '../data/config';
import { useCart } from '../hooks/useCart';

export function WhatsAppFloat() {
  const { contactWhatsAppForHelp } = useCart();
  return <div className="group fixed bottom-5 right-5 z-[250] sm:bottom-6 sm:right-6"><span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[var(--ba-navy-deep)] px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">¿Necesitas ayuda?</span><button type="button" onClick={contactWhatsAppForHelp} aria-label="Hablar con atención humana por WhatsApp" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#167a3f] text-white shadow-lg transition-transform hover:-translate-y-0.5"><svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L4 20l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg></button></div>;
}

function StoreFooter() {
  return <footer className="border-t border-line bg-ink-soft/[0.04]"><div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 py-12 sm:flex-row"><div className="flex items-center gap-3"><img src="/images/logo/ba-ec-logo.png" alt="Logo de B&A.EC Store" width="1024" height="1024" className="h-10 w-10 rounded-xl object-contain" /><div><p className="font-display text-base font-semibold leading-none">{BRAND.name}</p><p className="mt-1 text-xs text-ink-soft">{BRAND.city}</p></div></div><p className="text-center text-xs text-ink-soft sm:text-right">© {new Date().getFullYear()} {BRAND.name}.</p></div></footer>;
}

function LandingFooter() {
  const { contactWhatsAppForHelp } = useCart();
  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return <footer className="bg-[var(--ba-navy-deep)] px-5 pb-10 pt-16 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-[1240px]"><div className="grid gap-12 border-b border-white/12 pb-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr]"><div><div className="flex items-center gap-3"><img src="/images/logo/ba-ec-logo.png" alt="Logo de B&A.EC Store" width="1024" height="1024" className="h-14 w-14 rounded-2xl object-contain" /><span className="font-display text-2xl">B&A.EC Store</span></div><p className="mt-6 max-w-md text-sm leading-7 text-white/60">Una selección de productos de belleza, hogar y accesorios para vehículo, con atención personalizada y envíos a todo Ecuador.</p></div><nav aria-label="Explorar"><h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--ba-copper-soft)]">Explorar</h2><div className="mt-5 flex flex-col gap-3 text-sm text-white/70"><Link to="/tienda" className="ba-footer-link">Tienda</Link><a href="#categorias" className="ba-footer-link">Categorías</a><a href="#seleccion" className="ba-footer-link">Selección</a><a href="#como-comprar" className="ba-footer-link">Cómo comprar</a></div></nav><nav aria-label="Información"><h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--ba-copper-soft)]">Información</h2><div className="mt-5 flex flex-col gap-3 text-sm text-white/70"><a href="#entregas" className="ba-footer-link">Entregas y pagos</a><a href="#posventa" className="ba-footer-link">Posventa</a><a href="#faq" className="ba-footer-link">Preguntas frecuentes</a><button type="button" onClick={contactWhatsAppForHelp} className="ba-footer-link w-fit text-left">WhatsApp humano</button></div></nav></div><div className="flex flex-col items-center justify-between gap-5 pt-8 text-xs text-white/45 sm:flex-row"><span>© {new Date().getFullYear()} B&A.EC Store. Ambato, Ecuador.</span><button type="button" onClick={top} className="inline-flex min-h-11 items-center gap-2 text-white/70 transition hover:text-white">Volver arriba <span aria-hidden="true">↑</span></button></div></div></footer>;
}

export default function Footer() {
  const location = useLocation();
  return location.pathname.startsWith('/tienda') ? <StoreFooter /> : <LandingFooter />;
}
