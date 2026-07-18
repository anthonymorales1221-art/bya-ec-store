import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import FluidHero from './FluidHero';

const EASE = [0.16, 1, 0.3, 1];

function useMagnetic() {
  return (el) => {
    if (!el || el.dataset.magneticBound === 'true') return;
    el.dataset.magneticBound = 'true';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const strength = 0.4;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      gsap.to(el, { x, y, duration: 0.35, ease: 'power3.out' });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1,0.5)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  };
}

export default function Hero() {
  const magneticPrimary = useMagnetic();
  const magneticSecondary = useMagnetic();
  const scrollHintRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (scrollHintRef.current) {
      gsap.to(scrollHintRef.current, {
        y: 10,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Badge floating animation
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        y: -8,
        rotation: 3,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Fluid WebGL — ocupa TODA la sección */}
      <FluidHero
        colors={['#F3C8B8', '#AECBDA', '#E8A98F', '#8FB4C6', '#DCC495']}
        interactive={true}
        intensity={1.8}
      />

      {/* Velo más transparente para que el fluido se vea más */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-transparent to-cream/60 pointer-events-none" />

      {/* Badge flotante esquina superior derecha */}
      <div
        ref={badgeRef}
        className="absolute top-32 right-8 md:right-16 z-10 hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-full bg-ink/90 backdrop-blur-sm text-cream text-center shadow-2xl"
        aria-hidden="true"
      >
        <span className="text-[0.55rem] uppercase tracking-[0.15em] font-bold text-peach">Ambato</span>
        <span className="font-display font-semibold text-lg leading-tight mt-0.5">100%</span>
        <span className="text-[0.55rem] uppercase tracking-[0.1em] text-cream/70 font-semibold">curado</span>
      </div>

      {/* Contenido principal centrado */}
      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full text-center flex flex-col items-center pt-16">

        <motion.span
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-extrabold text-peach-deep mb-8 bg-white/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-peach/30"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-peach-deep animate-pulse" />
          Importados, curados con intención — Ambato
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          className="font-display font-medium leading-[1.02] tracking-tight text-[clamp(2.8rem,7.5vw,6.2rem)] max-w-5xl"
        >
          Piezas que{' '}
          <em className="italic font-medium bg-gradient-to-r from-peach-deep via-gold to-dust-deep bg-clip-text text-transparent">
            transforman
          </em>
          <br />
          tu estilo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
          className="text-ink-soft text-lg sm:text-xl leading-relaxed max-w-lg mt-7 font-light"
        >
          Belleza, tecnología y accesorios importados — seleccionados a mano para mujeres que buscan algo diferente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.58 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
        >
          <Link
            ref={magneticPrimary}
            to="/tienda"
            className="inline-flex items-center gap-3 bg-ink text-cream px-9 py-4.5 rounded-full font-bold text-sm hover:shadow-2xl transition-all hover:bg-[#1c1c1e] hover:scale-[1.02]"
            style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
          >
            Explorar colección
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            ref={magneticSecondary}
            href="#categorias"
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-ink px-7 py-4.5 rounded-full font-bold text-sm border border-ink/15 hover:bg-white/90 transition-all"
            style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
          >
            Ver tendencias
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
          className="flex items-center gap-8 sm:gap-14 mt-16 text-center"
        >
          {[
            { num: '100+', label: 'Productos' },
            { num: '5★', label: 'Valoración' },
            { num: 'WA', label: 'Atención directa' },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-display font-semibold text-2xl sm:text-3xl tracking-tight">{num}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft font-semibold mt-1">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-soft z-10"
        aria-hidden="true"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.18em] font-bold">Desplázate</span>
        <div className="w-px h-8 bg-gradient-to-b from-ink-soft to-transparent" />
      </div>
    </section>
  );
}
