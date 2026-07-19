import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useElementScrollProgress, usePointerMotion } from '../hooks/useLandingMotion';

const TRUST_ITEMS = [
  'Envíos a todo Ecuador',
  'Atención personalizada',
  'Compra rápida por WhatsApp',
];

export default function Hero() {
  const { contactWhatsAppForHelp } = useCart();
  const heroRef = useRef(null);
  usePointerMotion(heroRef);
  useElementScrollProgress(heroRef, '--hero-progress');

  return (
    <section ref={heroRef} id="inicio" className="ba-hero relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 bg-[var(--ba-ivory)]" aria-hidden="true" />
      <div className="ba-hero-media absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="/images/hero/ba-ec-hero-premium.png" alt="" width="1672" height="941" fetchPriority="high" decoding="async" className="ba-hero-image h-full w-full object-cover" />
      </div>
      <div className="ba-hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="ba-hero-glow absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[clamp(700px,96svh,1040px)] w-full max-w-[1240px] items-center px-5 py-20 sm:px-8 lg:px-10">
        <div className="ba-hero-content w-full max-w-[900px] pt-4 sm:pt-8">
          <p className="ba-hero-enter mb-5 text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-[var(--ba-copper)] sm:text-xs">
            Boutique multirrubro · Ecuador
          </p>
          <h1 id="hero-title" className="ba-hero-title max-w-[920px] font-display font-medium leading-[0.91] tracking-[-0.055em] text-[var(--ba-navy-deep)]">
            <span className="ba-hero-line"><span>Productos que</span></span>
            <span className="ba-hero-line ba-hero-line--accent"><span>elevan tu día a día</span></span>
          </h1>
          <p className="ba-hero-enter ba-hero-delay-2 mt-6 max-w-[590px] text-base leading-7 text-[var(--ba-muted)] sm:text-lg sm:leading-8">
            Belleza, hogar y accesorios para vehículo seleccionados para ti, con atención personalizada y envíos a todo Ecuador.
          </p>

          <div className="ba-hero-enter ba-hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/tienda"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--ba-navy)] px-7 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(16,36,62,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--ba-navy-deep)] hover:shadow-[0_15px_34px_rgba(16,36,62,0.24)]"
            >
              Explorar la tienda
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={contactWhatsAppForHelp}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--ba-navy)]/20 bg-[var(--ba-warm-white)]/80 px-7 py-3 text-sm font-extrabold text-[var(--ba-navy)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ba-navy)]/35 hover:bg-[var(--ba-warm-white)]"
            >
              Hablar con un asesor
            </button>
          </div>

          <ul className="ba-hero-enter ba-hero-delay-4 mt-9 grid max-w-[620px] gap-3 text-sm text-[var(--ba-graphite)] sm:grid-cols-3 sm:gap-4">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 leading-5">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ba-copper)]" fill="none" aria-hidden="true">
                  <path d="m4 10 3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <a href="#categorias" className="ba-hero-explore absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-[var(--ba-navy)]" data-cursor="BAJAR">
        <span>Explorar</span><span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
