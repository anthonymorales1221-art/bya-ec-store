import { useReducedMotion } from '../hooks/useLandingMotion';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';

function TestimonialCard({ item }) {
  return (
    <article className="w-[82vw] max-w-[400px] shrink-0 rounded-[24px] border border-[var(--ba-border)] bg-[var(--ba-warm-white)] p-7 transition duration-200 hover:-translate-y-0.5 focus-within:border-[var(--ba-copper-soft)] sm:w-[390px]">
      <span className="font-display text-5xl leading-none text-[var(--ba-copper-soft)]" aria-hidden="true">“</span>
      <blockquote className="mt-2 text-base leading-7 text-[var(--ba-graphite)]">{item.texto}</blockquote>
      <div className="mt-7 flex items-center gap-3"><ProductImage src={item.foto_url} alt={item.nombre} className="h-11 w-11 rounded-full object-cover" fallbackClassName="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ba-navy)] font-bold text-white" /><div><cite className="not-italic text-sm font-extrabold text-[var(--ba-navy-deep)]">{item.nombre}</cite><span className="block text-xs text-[var(--ba-muted)]">Cliente B&A.EC Store</span></div></div>
    </article>
  );
}

function MarqueeRow({ items, reverse = false }) {
  return <div className={`ba-testimonial-row flex w-max gap-5 ${reverse ? 'ba-marquee-reverse' : ''}`}>{items.map((item, index) => <TestimonialCard key={`a-${item.nombre}-${index}`} item={item} />)}<div aria-hidden="true" className="flex gap-5">{items.map((item, index) => <TestimonialCard key={`b-${item.nombre}-${index}`} item={item} />)}</div></div>;
}

export default function Testimonials() {
  const { testimonials, testimonialsStatus } = useCart();
  const reduced = useReducedMotion();
  if (testimonialsStatus !== 'ready' || testimonials.length === 0) return null;
  const animated = testimonials.length >= 6 && !reduced;
  const half = Math.ceil(testimonials.length / 2);

  return (
    <section id="opiniones" className="overflow-hidden bg-[var(--ba-warm-white)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10"><p className="ba-kicker">Opiniones verificadas</p><h2 className="ba-section-title mt-4">Experiencias reales con B&A</h2></div>
      {animated ? <div className="mt-14 space-y-5 overflow-hidden py-2"><MarqueeRow items={testimonials.slice(0, half)} /><MarqueeRow items={testimonials.slice(half)} reverse /></div> : <div className="mx-auto mt-14 grid max-w-[1240px] gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-10">{testimonials.map((item, index) => <TestimonialCard key={`${item.nombre}-${index}`} item={item} />)}</div>}
    </section>
  );
}
