import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScaleReveal, useWordReveal } from '../hooks/useScrollAnimations';

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    number: '01',
    text: 'Empezamos porque nos cansamos de pedir cosas afuera y nunca saber si iban a llegar bien, completas, o a tiempo. <strong>Queríamos crear lo que a nosotras nos hubiera gustado encontrar</strong>: piezas seleccionadas con criterio, no compradas al azar.',
  },
  {
    number: '02',
    text: 'Cada producto que entra al catálogo pasa por nuestras manos primero. <strong>Si no lo usaríamos nosotras, no lo vendemos</strong>. Esa curaduría es el verdadero trabajo detrás de B&A.Ec Store.',
  },
  {
    number: '03',
    text: 'Por eso coordinamos cada pedido directamente por WhatsApp: <strong>preferimos la atención cercana sobre la velocidad fría de un carrito automático</strong>, aunque construyamos herramientas digitales para hacerlo más simple.',
  },
];

function StoryPanel({ text, number, index }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.fromTo(
      el,
      { opacity: 0, x: 40, rotateY: 8 },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 0.9,
        ease: 'expo.out',
        delay: index * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  }, [index]);

  return (
    <div
      ref={panelRef}
      className="group relative bg-white border border-line rounded-[24px] p-8 sm:p-9 overflow-hidden hover:shadow-xl transition-shadow duration-500"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Número grande decorativo */}
      <span className="absolute top-5 right-7 font-display font-semibold text-[4.5rem] leading-none text-cream-deep select-none pointer-events-none">
        {number}
      </span>
      {/* Barra de acento izquierda */}
      <div className="absolute left-0 top-8 bottom-8 w-[3px] rounded-r-full bg-gradient-to-b from-peach to-dust opacity-60 group-hover:opacity-100 transition-opacity" />
      <p
        className="relative text-ink-soft text-base sm:text-[1.05rem] leading-relaxed [&>strong]:text-ink [&>strong]:font-bold pl-2"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

export default function StorySection() {
  const titleRef = useWordReveal();
  const imgRef = useScaleReveal();

  return (
    <section id="como-comprar" className="py-28 sm:py-36 px-6 bg-gradient-to-b from-cream to-cream-deep/40" style={{ perspective: '1600px' }}>
      <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">

        {/* Columna izquierda — sticky */}
        <div className="lg:sticky lg:top-28">
          <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] font-extrabold text-peach-deep mb-6">
            <span className="w-5 h-px bg-gold" />
            Nuestra historia
          </span>
          <h2
            ref={titleRef}
            className="font-display font-medium text-[clamp(2rem,3.8vw,2.9rem)] leading-[1.12] tracking-tight mb-10"
          >
            Por qué existe B&amp;A.Ec Store
          </h2>

          {/* Imagen con overlay elegante */}
          <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] hidden lg:block shadow-2xl">
            <img
              ref={imgRef}
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80"
              alt="Detalle de productos importados curados a mano"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7 right-7">
              <p className="text-cream font-display font-medium text-xl leading-snug">
                Curado a mano,<br />
                <em className="text-peach italic">entregado con cariño</em>
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha — paneles */}
        <div className="flex flex-col gap-5">
          {PANELS.map((p, i) => (
            <StoryPanel key={i} text={p.text} number={p.number} index={i} />
          ))}

          {/* Stat highlight card */}
          <div className="mt-3 grid grid-cols-3 gap-4">
            {[
              { value: '2+', label: 'Años curandando' },
              { value: '500+', label: 'Pedidos felices' },
              { value: '100%', label: 'Atención directa' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-ink text-cream rounded-[18px] p-5 text-center"
              >
                <span className="block font-display font-semibold text-2xl sm:text-3xl">{value}</span>
                <span className="block text-[0.65rem] uppercase tracking-[0.12em] text-cream/60 font-bold mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
