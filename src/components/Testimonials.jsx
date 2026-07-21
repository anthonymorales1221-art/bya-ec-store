import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';
import AnimatedEyebrow from './AnimatedEyebrow';

gsap.registerPlugin(ScrollTrigger);

const JOURNEY_SEQUENCE = {
  1: ['single'],
  2: ['a', 'b'],
  3: ['a', 'b', 'd'],
  4: ['a', 'b', 'c', 'd'],
};

function TestimonialCard({ item, journey }) {
  return (
    <article className={`ba-testimonial-card ba-testimonial-card--${journey}`} data-testimonial-card data-journey={journey} data-cursor="LEER">
      <div className="ba-testimonial-quote">
        <span className="font-display text-5xl leading-none text-[var(--ba-copper-soft)]" aria-hidden="true">“</span>
        <blockquote className="mt-2 text-lg leading-8 text-white/88 sm:text-xl">{item.texto}</blockquote>
      </div>
      <div className="ba-testimonial-identity">
        <ProductImage src={item.foto_url} alt={item.nombre} variant="avatar" className="h-12 w-12 rounded-full" fallbackClassName="bg-[var(--ba-copper)] font-bold text-white" fallbackTextClassName="text-xs" />
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
  const journeys = JOURNEY_SEQUENCE[selected.length] || JOURNEY_SEQUENCE[4];

  useEffect(() => {
    if (testimonialsStatus !== 'ready' || selected.length === 0 || window.location.hash !== '#opiniones') return undefined;
    const frame = requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [selected.length, testimonialsStatus]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const enabled = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !scene || selected.length < 2 || !enabled) return undefined;

    const card = (journey) => scene.querySelector(`[data-journey="${journey}"]`);
    const cards = [...scene.querySelectorAll('[data-testimonial-card]')];
    const heading = scene.querySelector('[data-testimonial-heading]');
    const subtitle = scene.querySelector('[data-testimonial-subtitle]');
    const pattern = scene.querySelector('[data-testimonial-wave]');
    let refreshFrame = 0;

    const context = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(heading, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      const timeline = gsap.timeline({
        defaults: { ease: 'none', force3D: true },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.3,
          invalidateOnRefresh: true,
        },
      });

      const journey = (element, start, duration, side) => {
        if (!element) return;
        const enterEnd = start + duration * 0.42;
        const depthEnd = start + duration * 0.84;
        timeline.fromTo(element, {
          y: () => window.innerHeight * 0.62 + element.offsetHeight * 0.7,
          x: side * 16,
          scale: 0.93,
          autoAlpha: 0,
        }, {
          y: () => -element.offsetHeight * 0.5 + side * window.innerHeight * 0.055,
          x: 0,
          scale: 1,
          autoAlpha: 1,
          duration: duration * 0.42,
        }, start)
          .to(element, {
            y: () => -window.innerHeight * 0.38 - element.offsetHeight * 0.5,
            x: side * 8,
            scale: 0.965,
            opacity: 0.32,
            duration: duration * 0.42,
          }, enterEnd)
          .to(element, {
            y: () => -window.innerHeight * 0.62 - element.offsetHeight,
            x: side * 18,
            scale: 0.94,
            autoAlpha: 0,
            duration: duration * 0.16,
          }, depthEnd);
      };

      timeline.fromTo(pattern, { opacity: 0.04, x: 0, y: 22, scale: 1 }, { opacity: 0.1, x: 12, y: -18, scale: 1.015, duration: 6.8 }, 0)
        .to(pattern, { opacity: 0.05, x: 24, y: -58, scale: 1.03, duration: 3.2 }, 6.8);

      journey(card('a'), 0.4, 3.2, -1);
      journey(card('b'), 1.6, 3.6, 1);
      journey(card('c'), 3.8, 3.7, -1);
      journey(card('d'), 5.7, 4.1, 1);

      timeline.fromTo(heading, {
        y: () => window.innerHeight * 0.9,
        scale: 0.96,
        autoAlpha: 0,
      }, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 1.4,
      }, 2.4)
        .to(heading, { y: () => -window.innerHeight * 0.06, scale: 0.99, duration: 2.9 }, 3.8)
        .to(heading, { y: () => -window.innerHeight * 0.86, scale: 0.95, autoAlpha: 0, duration: 1.8 }, 6.7)
        .to(subtitle, { opacity: 0.72, duration: 1 }, 5.7);
    }, section);

    const scheduleRefresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    document.fonts?.ready.then(scheduleRefresh);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleRefresh);
    resizeObserver?.observe(scene);

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
    return () => { cancelAnimationFrame(refreshFrame); resizeObserver?.disconnect(); scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerleave', reset); context.revert(); };
  }, [selected.length]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    if (!section || !scene || selected.length === 0) return undefined;

    const media = gsap.matchMedia();
    media.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const headingItems = scene.querySelectorAll('[data-testimonial-heading] > *');
      const cards = gsap.utils.toArray('[data-testimonial-card]', scene);
      const context = gsap.context(() => {
        gsap.fromTo(headingItems, {
          y: 22,
        }, {
          y: 0,
          duration: 0.62,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: scene, start: 'top 84%', once: true },
        });
        cards.forEach((card) => {
          gsap.fromTo(card, {
            y: 26,
          }, {
            y: 0,
            duration: 0.66,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          });
        });
      }, section);
      return () => context.revert();
    });

    return () => media.revert();
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
          <div className="ba-testimonials-cards">{selected.map((item, index) => <TestimonialCard key={`${item.nombre}-${index}`} item={item} journey={journeys[index]} />)}</div>
        </div>
      </div>
    </section>
  );
}
