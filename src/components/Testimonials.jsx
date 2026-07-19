import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';
import RevealTitle from './RevealTitle';
import AnimatedEyebrow from './AnimatedEyebrow';

gsap.registerPlugin(ScrollTrigger);

function TestimonialCard({ item, index }) {
  return (
    <article className={`ba-testimonial-card ba-testimonial-card--${index + 1}`} data-testimonial-card data-cursor="LEER">
      <div className="ba-testimonial-quote">
        <span className="font-display text-5xl leading-none text-[var(--ba-copper-soft)]" aria-hidden="true">“</span>
        <blockquote className="mt-2 text-lg leading-8 text-white/88 sm:text-xl">{item.texto}</blockquote>
      </div>
      <div className="ba-testimonial-identity">
        <ProductImage src={item.foto_url} alt={item.nombre} className="h-12 w-12 rounded-full object-cover" fallbackClassName="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ba-copper)] font-bold text-white" fallbackTextClassName="text-xs" />
        <div><cite className="not-italic text-sm font-extrabold text-white">{item.nombre}</cite><span className="block text-xs text-white/48">Cliente B&A.EC Store</span></div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const { testimonials, testimonialsStatus } = useCart();
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const selected = useMemo(() => testimonials.slice(0, 4), [testimonials]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const enabled = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !scene || !selected.length || !enabled) return undefined;
    const cards = [...scene.querySelectorAll('[data-testimonial-card]')];
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });
      cards.forEach((card, index) => {
        const fromLeft = index % 2 === 0;
        timeline.fromTo(card,
          { x: fromLeft ? -60 : 60, y: 64, scale: 0.95, rotate: fromLeft ? -0.8 : 0.8, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, duration: 1, ease: 'expo.out' },
          index * 0.72);
        if (index < cards.length - 1) timeline.to(card, { scale: 0.975, opacity: 0.58, duration: 0.65 }, index * 0.72 + 0.8);
      });
      timeline.to(scene.querySelector('[data-testimonial-wave]'), { xPercent: 4, yPercent: -3, duration: cards.length }, 0);
    }, section);

    const move = (event) => {
      const card = event.target.closest('[data-testimonial-card]');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
      card.style.setProperty('--testimonial-tilt-x', `${y * -2}deg`);
      card.style.setProperty('--testimonial-tilt-y', `${x * 2}deg`);
    };
    const reset = () => scene.querySelectorAll('[data-testimonial-card]').forEach((card) => {
      card.style.setProperty('--testimonial-tilt-x', '0deg');
      card.style.setProperty('--testimonial-tilt-y', '0deg');
    });
    scene.addEventListener('pointermove', move, { passive: true });
    scene.addEventListener('pointerleave', reset);
    return () => { scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerleave', reset); context.revert(); };
  }, [selected.length]);

  if (testimonialsStatus !== 'ready' || selected.length === 0) return null;
  const sceneHeight = selected.length >= 4 ? 'ba-testimonials--long' : selected.length === 3 ? 'ba-testimonials--medium' : 'ba-testimonials--short';
  return (
    <section ref={sectionRef} id="opiniones" className={`ba-testimonials ba-dark ${sceneHeight}`} data-cursor-tone="light">
      <div ref={sceneRef} className="ba-testimonials-scene">
        <div className="ba-testimonial-wave" data-testimonial-wave aria-hidden="true" />
        <div className="ba-testimonials-heading">
          <AnimatedEyebrow className="text-[var(--ba-copper-soft)]">Experiencias reales</AnimatedEyebrow>
          <RevealTitle className="mt-5 font-display text-[clamp(3.2rem,6vw,6.5rem)] font-medium leading-[.95] tracking-[-.045em] text-white" lines={['Lo que dicen quienes', 'ya descubrieron B&A']} />
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/58">Compras acompañadas, productos seleccionados y entregas que generan confianza.</p>
        </div>
        <div className="ba-testimonials-cards">{selected.map((item, index) => <TestimonialCard key={`${item.nombre}-${index}`} item={item} index={index} />)}</div>
      </div>
    </section>
  );
}
