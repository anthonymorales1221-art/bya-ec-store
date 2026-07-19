import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';
import AnimatedEyebrow from './AnimatedEyebrow';

gsap.registerPlugin(ScrollTrigger);

const SLOT_SEQUENCE = {
  1: ['d'],
  2: ['a', 'b'],
  3: ['a', 'b', 'd'],
  4: ['a', 'b', 'c', 'd'],
};

function TestimonialCard({ item, slot }) {
  return (
    <article className={`ba-testimonial-card ba-testimonial-card--${slot}`} data-testimonial-card data-slot={slot} data-cursor="LEER">
      <div className="ba-testimonial-quote">
        <span className="font-display text-5xl leading-none text-[var(--ba-copper-soft)]" aria-hidden="true">“</span>
        <blockquote className="mt-2 text-lg leading-8 text-white/88 sm:text-xl">{item.texto}</blockquote>
      </div>
      <div className="ba-testimonial-identity">
        <ProductImage src={item.foto_url} alt={item.nombre} className="h-12 w-12 rounded-full object-cover" fallbackClassName="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ba-copper)] font-bold text-white" fallbackTextClassName="text-xs" />
        <cite className="not-italic text-sm font-extrabold text-white">{item.nombre}</cite>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const { testimonials, testimonialsStatus } = useCart();
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const selected = useMemo(() => testimonials.slice(0, 4), [testimonials]);
  const slots = SLOT_SEQUENCE[selected.length] || SLOT_SEQUENCE[4];

  useEffect(() => {
    if (testimonialsStatus !== 'ready' || selected.length === 0 || window.location.hash !== '#opiniones') return undefined;
    const frame = requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [selected.length, testimonialsStatus]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const enabled = window.matchMedia('(min-width: 1280px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !scene || selected.length < 2 || !enabled) return undefined;

    const card = (slot) => scene.querySelector(`[data-slot="${slot}"]`);
    const cards = [...scene.querySelectorAll('[data-testimonial-card]')];
    const heading = scene.querySelector('[data-testimonial-heading]');
    const subtitle = scene.querySelector('[data-testimonial-subtitle]');
    const pattern = scene.querySelector('[data-testimonial-wave]');
    const eyebrow = scene.querySelector('[data-testimonial-eyebrow]');
    const titleLines = scene.querySelectorAll('[data-testimonial-title-line]');

    const context = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0 });
      const timeline = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.85 },
      });

      timeline
        .fromTo(pattern, { opacity: 0, y: 24 }, { opacity: 0.12, y: 0, duration: 1.2 }, 0)
        .fromTo(eyebrow, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15)
        .fromTo(titleLines, { yPercent: 105, opacity: 0, rotate: 1 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: 0.12, duration: 1 }, 0.3)
        .fromTo(subtitle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.65);

      if (card('a')) timeline.fromTo(card('a'), { x: -54, y: 54, scale: 0.94, rotate: -0.8, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: 1.15 }, 2.35);
      if (card('b')) timeline.fromTo(card('b'), { x: 54, y: 44, scale: 0.95, rotate: 0.8, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1 }, 3.2);

      timeline.to(heading, { scale: 0.87, y: -18, transformOrigin: 'left top', duration: 1.1 }, 4.15)
        .to(subtitle, { opacity: 0.4, duration: 0.8 }, 4.15);
      if (card('a')) timeline.to(card('a'), { scale: 0.97, opacity: 0.62, duration: 0.9 }, 4.35);
      if (card('c')) timeline.fromTo(card('c'), { x: -42, y: 64, scale: 0.95, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 1.1 }, 5.25);
      if (card('d')) timeline.fromTo(card('d'), { x: 42, y: 64, scale: 0.95, rotate: 0.6, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: 1.15 }, selected.length === 1 ? 2.4 : 6.2);
      if (card('b') && card('d')) timeline.to(card('b'), { scale: 0.975, opacity: 0.52, duration: 0.9 }, 6.35);
      if (card('a')) timeline.to(card('a'), { opacity: 0.18, y: -24, duration: 0.8 }, 7.25);
      if (card('b') && card('d')) timeline.to(card('b'), { opacity: 0.18, y: -18, duration: 0.8 }, 7.35);
      timeline.to(heading, { opacity: 0, y: -42, duration: 1 }, 7.55);
      if (card('c')) timeline.to(card('c'), { scale: 0.975, opacity: 0.42, duration: 0.8 }, 7.65);
      if (card('d')) timeline.to(card('d'), { scale: 1.025, opacity: 1, duration: 0.8 }, 7.7)
        .to(card('d'), { y: -28, autoAlpha: 0, scale: 0.98, duration: 1 }, 9.05);
      else if (card('b')) timeline.to(card('b'), { scale: 1.025, opacity: 1, duration: 0.8 }, 7.7)
        .to(card('b'), { y: -28, autoAlpha: 0, scale: 0.98, duration: 1 }, 9.05);
      timeline.to(pattern, { x: 24, y: -18, opacity: 0.06, duration: 2 }, 8.2);
    }, section);

    const move = (event) => {
      const targetCard = event.target.closest('[data-testimonial-card]');
      if (!targetCard) return;
      const rect = targetCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetCard.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
      targetCard.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
      targetCard.style.setProperty('--testimonial-tilt-x', `${y * -1.6}deg`);
      targetCard.style.setProperty('--testimonial-tilt-y', `${x * 1.6}deg`);
    };
    const reset = () => cards.forEach((item) => {
      item.style.setProperty('--testimonial-tilt-x', '0deg');
      item.style.setProperty('--testimonial-tilt-y', '0deg');
    });
    scene.addEventListener('pointermove', move, { passive: true });
    scene.addEventListener('pointerleave', reset);
    return () => { scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerleave', reset); context.revert(); };
  }, [selected.length]);

  if (testimonialsStatus !== 'ready' || selected.length === 0) return null;
  const sceneHeight = selected.length === 4 ? 'ba-testimonials--four' : `ba-testimonials--${selected.length}`;
  return (
    <section ref={sectionRef} id="opiniones" className={`ba-testimonials ba-dark ${sceneHeight}`} data-cursor-tone="light">
      <div ref={sceneRef} className="ba-testimonials-scene">
        <div className="ba-testimonials-frame">
          <div className="ba-testimonial-wave" data-testimonial-wave aria-hidden="true" />
          <div className="ba-testimonials-heading" data-testimonial-heading>
            <div data-testimonial-eyebrow><AnimatedEyebrow className="text-[var(--ba-copper-soft)]">Experiencias reales</AnimatedEyebrow></div>
            <h2 className="ba-testimonials-title mt-5 font-display font-medium text-white">
              <span><span data-testimonial-title-line>Lo que dicen quienes</span></span>
              <span><span data-testimonial-title-line>ya descubrieron B&A</span></span>
            </h2>
            <p data-testimonial-subtitle className="mt-6 max-w-xl text-base leading-8 text-white/58">Compras acompañadas, productos seleccionados y entregas que generan confianza.</p>
          </div>
          <div className="ba-testimonials-cards">{selected.map((item, index) => <TestimonialCard key={`${item.nombre}-${index}`} item={item} slot={slots[index]} />)}</div>
        </div>
      </div>
    </section>
  );
}
