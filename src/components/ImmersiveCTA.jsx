import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { usePointerMotion } from '../hooks/useLandingMotion';

export default function ImmersiveCTA() {
  const ref = useRef(null);
  const { contactWhatsAppForHelp } = useCart();
  usePointerMotion(ref, { maxX: 12, maxY: 10 });
  return (
    <section ref={ref} className="ba-final-cta relative isolate overflow-hidden bg-[var(--ba-navy-deep)] px-5 py-28 text-white sm:px-8 sm:py-36 lg:px-10">
      <img src="/images/hero/ba-ec-hero-premium.png" alt="" width="1672" height="941" loading="lazy" className="ba-final-image absolute inset-0 -z-20 h-full w-full object-cover opacity-25" aria-hidden="true" /><div className="absolute inset-0 -z-10 bg-[var(--ba-navy-deep)]/80" aria-hidden="true" /><div className="ba-final-halo absolute -z-10 h-[420px] w-[420px] rounded-full bg-[var(--ba-copper)]/20 blur-3xl" aria-hidden="true" />
      <div className="mx-auto max-w-[1000px] text-center"><p className="ba-kicker text-[var(--ba-copper-soft)]">Tu próxima elección</p><h2 className="mt-5 font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">Descubre tu próxima compra en B&A.EC Store</h2><p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">Explora nuestra selección o conversa directamente con un asesor para encontrar lo que necesitas.</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/tienda" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-extrabold text-[var(--ba-navy)] transition hover:-translate-y-0.5">Explorar la tienda</Link><button type="button" onClick={contactWhatsAppForHelp} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Hablar con un asesor</button></div></div>
    </section>
  );
}
