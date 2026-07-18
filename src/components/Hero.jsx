import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const TRUST_ITEMS = [
  'Envíos a todo Ecuador',
  'Atención personalizada',
  'Compra rápida por WhatsApp',
];

export default function Hero() {
  const { contactWhatsAppForHelp } = useCart();

  return (
    <section id="inicio" className="ba-hero relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 bg-[var(--ba-ivory)]" aria-hidden="true" />
      <img
        src="/images/hero/ba-ec-hero-premium.png"
        alt=""
        width="1920"
        height="1080"
        fetchPriority="high"
        decoding="async"
        className="ba-hero-image absolute inset-0 h-full w-full object-cover"
        onError={(event) => { event.currentTarget.hidden = true; }}
        aria-hidden="true"
      />
      <div className="ba-hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="ba-hero-glow absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[clamp(660px,82vh,880px)] w-full max-w-[1240px] items-center px-5 py-16 sm:px-8 lg:px-10">
        <div className="ba-hero-content max-w-[680px] pt-4 sm:pt-8">
          <p className="ba-hero-enter mb-5 text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-[var(--ba-copper)] sm:text-xs">
            Boutique multirrubro · Ecuador
          </p>
          <h1
            id="hero-title"
            className="ba-hero-enter ba-hero-delay-1 max-w-[650px] font-display text-[clamp(3rem,6.2vw,5.7rem)] font-medium leading-[0.98] tracking-[-0.045em] text-[var(--ba-navy-deep)]"
          >
            Productos que elevan tu día a día
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
    </section>
  );
}
