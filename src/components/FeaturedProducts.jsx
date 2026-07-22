import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatPrice } from '../data/format';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';
import ProductModal from './ProductModal';
import RevealTitle from './RevealTitle';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts() {
  const { products, catalogStatus, contactWhatsAppForHelp } = useCart();
  const [openSku, setOpenSku] = useState(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const featured = useMemo(() => {
    const preferred = products.filter((product) => product.featured && product.stock > 0);
    return (preferred.length >= 4 ? preferred : products.filter((product) => product.stock > 0)).slice(0, 8);
  }, [products]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    const enabled = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !rail || !enabled) return undefined;
    const cards = [...rail.querySelectorAll('[data-product-card]')];
    const context = gsap.context(() => {
      gsap.fromTo(cards, { y: 72, opacity: 0 }, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          end: 'top 28%',
          scrub: 0.7,
          onUpdate: ({ progress }) => {
            section.style.setProperty('--featured-progress', progress);
            const active = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
            cards.forEach((card, index) => gsap.set(card, { scale: index === active ? 1 : 0.97 }));
          },
        },
      });
    }, section);

    const move = (event) => {
      const card = event.target.closest('[data-product-card]');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${y * -3}deg`);
      card.style.setProperty('--tilt-y', `${x * 3}deg`);
      card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`);
    };
    const reset = () => rail.querySelectorAll('[data-product-card]').forEach((card) => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
    rail.addEventListener('pointermove', move, { passive: true });
    rail.addEventListener('pointerleave', reset);
    return () => {
      rail.removeEventListener('pointermove', move);
      rail.removeEventListener('pointerleave', reset);
      context.revert();
    };
  }, [featured.length, catalogStatus]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || featured.length === 0 || !window.matchMedia('(max-width: 899px)').matches) return undefined;
    const cards = [...rail.querySelectorAll('[data-product-card]')];
    rail.scrollTo({ left: 0, behavior: 'auto' });
    setActiveProduct(0);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveProduct(cards.indexOf(visible.target));
    }, { root: rail, threshold: [0.55, 0.72, 0.9] });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [featured.length, catalogStatus]);
  if (catalogStatus === 'error' || (catalogStatus === 'ready' && featured.length === 0)) return null;

  const consult = (product) => {
    contactWhatsAppForHelp(`Hola, necesito ayuda con ${product.name} (SKU ${product.sku}) de B&A.EC Store. Estoy viendo ${window.location.href}`);
  };

  return (
    <section ref={sectionRef} id="seleccion" className="ba-dark overflow-hidden bg-[var(--ba-navy-deep)] py-24 text-white sm:py-32" data-cursor-tone="light">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="ba-kicker text-[var(--ba-copper-soft)]">Curaduría B&A</p><RevealTitle className="mt-4 font-display text-5xl font-medium leading-tight sm:text-6xl">Selección destacada</RevealTitle><p className="mt-5 max-w-xl text-base leading-7 text-white/65">Productos elegidos por su utilidad, diseño y aceptación.</p></div>
          <Link to="/tienda" className="ba-arrow-link w-fit text-white">Ver catálogo completo <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className="mx-auto mt-12 h-px max-w-[1240px] bg-white/10"><span className="ba-featured-progress block h-px bg-[var(--ba-copper-soft)]" /></div>
      <div ref={railRef} className="ba-featured-scroll mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-1240px)/2+2.5rem))] pb-5 sm:gap-7" data-cursor="ARRASTRAR">
        {(catalogStatus === 'loading' ? Array.from({ length: 4 }) : featured).map((product, index) => product ? (
          <article key={product.sku} data-product-card data-cursor="VER" className={`ba-product-card group w-[82vw] max-w-[390px] shrink-0 snap-center overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06] transition duration-300 hover:bg-white/[0.09]${activeProduct === index ? ' is-active' : ''}`}>
            <button type="button" onClick={() => setOpenSku(product.sku)} className="block w-full text-left">
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5"><ProductImage absolute src={product.img} alt={product.name} variant="featured" className="h-full w-full" fallbackClassName="font-display text-4xl text-white" /><span className="absolute left-5 top-5 rounded-full bg-[var(--ba-warm-white)] px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ba-navy)]">0{index + 1}</span></div>
              <div className="p-6"><div className="flex items-center justify-between gap-3"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ba-copper-soft)]">{product.category}</span><span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/55">Disponible</span></div><h3 className="mt-2 min-h-12 text-lg font-bold leading-6">{product.name}</h3><div className="mt-5 flex items-center justify-between"><span className="font-display text-2xl">{formatPrice(product.price)}</span><span className="text-sm font-bold">Ver producto →</span></div></div>
            </button>
            <button type="button" onClick={() => consult(product)} className="mx-6 mb-6 text-xs font-bold text-white/65 underline decoration-[var(--ba-copper)] underline-offset-4 transition hover:text-white">Consultar con un asesor</button>
          </article>
        ) : <div key={index} className="aspect-[4/5] w-[82vw] max-w-[390px] shrink-0 animate-pulse rounded-[26px] bg-white/10" />)}
      </div>
      {featured.length > 0 && <div className="ba-featured-mobile-progress mx-auto mt-5 max-w-[1240px] px-5 sm:px-8" aria-live="polite"><span>{String(activeProduct + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}</span><i aria-hidden="true"><span style={{ transform: `scaleX(${(activeProduct + 1) / featured.length})` }} /></i></div>}
      {openSku && <ProductModal sku={openSku} onClose={() => setOpenSku(null)} />}
    </section>
  );
}
