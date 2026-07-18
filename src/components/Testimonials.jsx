import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import { useWordReveal } from '../hooks/useScrollAnimations';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

const AVATAR_SIZE = 56;

// La primera tarjeta del set se presenta "destacada" (más grande, cita más
// larga visualmente) — eco del layout editorial de Framer donde la primera
// testimonial ocupa más espacio que el resto de la grilla.
function TestimonialCard({ t, index, featured = false }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 56, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'expo.out',
        delay: index * 0.09,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col h-full overflow-hidden rounded-[26px] border border-line bg-white
        transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(43,43,46,0.22)]
        ${featured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
    >
      {/* Halo cálido superior — sutil, no decorativo de relleno */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-peach/40 via-gold-soft/20 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className={`relative flex flex-col h-full p-7 sm:p-8 gap-6 ${featured ? 'sm:p-10' : ''}`}>
        {/* Comillas grandes, tipográficas — firma visual de la sección */}
        <span
          aria-hidden="true"
          className={`font-display leading-none text-gold/35 select-none ${featured ? 'text-[5rem]' : 'text-[3.5rem]'}`}
          style={{ marginBottom: '-1.4rem' }}
        >
          “
        </span>

        <p
          className={`relative text-ink leading-relaxed flex-1 font-display ${
            featured ? 'text-[1.35rem] sm:text-[1.55rem] font-medium' : 'text-[1.1rem] font-medium'
          }`}
        >
          {t.texto}
        </p>

        <div className="flex items-center gap-3.5 pt-5 border-t border-line">
          <div
            className="rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-md"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            <ProductImage
              src={t.foto_url}
              alt={t.nombre}
              className="w-full h-full object-cover"
              fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-br from-peach to-dust"
              fallbackTextClassName="font-display font-semibold text-ink-soft text-base"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-bold text-sm text-ink truncate">{t.nombre}</span>
            <span className="flex gap-0.5 mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} viewBox="0 0 12 12" className="w-3 h-3 text-gold" fill="currentColor">
                  <path d="M6 0l1.5 4H12L8.5 6.5l1.3 4L6 8.5l-3.8 2 1.3-4L0 4h4.5z" />
                </svg>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { testimonials, testimonialsStatus } = useCart();
  const titleRef = useWordReveal();

  if (testimonialsStatus === 'ready' && testimonials.length === 0) return null;
  if (testimonialsStatus === 'error') return null;

  return (
    <section id="opiniones" className="py-28 sm:py-36 px-6 bg-gradient-to-b from-cream-deep/30 to-cream">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] font-extrabold text-peach-deep mb-5">
              <span className="w-5 h-px bg-gold" />
              Lo que dicen nuestras clientas
            </span>
            <h2
              ref={titleRef}
              className="font-display font-medium text-[clamp(1.9rem,3.6vw,2.7rem)] leading-[1.15] tracking-tight"
            >
              Historias reales, piezas reales
            </h2>
          </div>
          {/* Promedio decorativo */}
          <div className="flex items-center gap-3 flex-shrink-0 bg-ink text-cream rounded-2xl px-6 py-4">
            <span className="font-display font-semibold text-3xl">5.0</span>
            <div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} viewBox="0 0 12 12" className="w-3.5 h-3.5 text-gold" fill="currentColor">
                    <path d="M6 0l1.5 4H12L8.5 6.5l1.3 4L6 8.5l-3.8 2 1.3-4L0 4h4.5z" />
                  </svg>
                ))}
              </div>
              <span className="text-[0.65rem] text-cream/60 font-semibold uppercase tracking-wide">Valoración</span>
            </div>
          </div>
        </div>

        {testimonialsStatus === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 rounded-[22px] skeleton" />
            ))}
          </div>
        )}

        {testimonialsStatus === 'ready' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} featured={i === 0 && testimonials.length > 2} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
