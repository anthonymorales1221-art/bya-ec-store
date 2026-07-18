import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWordReveal } from '../hooks/useScrollAnimations';

gsap.registerPlugin(ScrollTrigger);

export default function TransitionCTA() {
  const titleRef = useWordReveal();
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Parallax del fondo
    gsap.to(bg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 sm:py-48 px-6 overflow-hidden bg-ink text-cream"
    >
      {/* Fondo imagen con parallax */}
      <div
        ref={bgRef}
        className="absolute inset-[-20%] opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=70')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      {/* Gradiente sobre imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/75 to-ink" aria-hidden="true" />

      {/* Elementos decorativos flotantes */}
      <div className="absolute top-12 left-8 w-32 h-32 rounded-full border border-cream/10" aria-hidden="true" />
      <div className="absolute bottom-16 right-12 w-48 h-48 rounded-full border border-cream/5" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-gold opacity-60" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-peach opacity-50" aria-hidden="true" />

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-extrabold text-peach mb-7">
          <span className="w-5 h-px bg-gold" />
          Tu próximo favorito te espera
          <span className="w-5 h-px bg-gold" />
        </span>

        <h2
          ref={titleRef}
          className="font-display font-medium text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] tracking-tight mb-8"
        >
          Deja de buscar afuera lo que ya seleccionamos para ti
        </h2>

        <p className="text-cream/65 text-lg leading-relaxed mb-12 max-w-md mx-auto font-light">
          Catálogo completo, precios claros y coordinación directa por WhatsApp — sin sorpresas en el camino.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-3 bg-cream text-ink px-9 py-4 rounded-full font-bold text-sm hover:shadow-2xl hover:scale-[1.03] transition-all"
          >
            Ir a la tienda
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="https://wa.me/593994008778"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-transparent text-cream px-8 py-4 rounded-full font-bold text-sm border border-cream/25 hover:border-cream/60 hover:bg-cream/10 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L4 20l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
