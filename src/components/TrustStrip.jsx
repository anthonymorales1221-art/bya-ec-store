import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useLandingMotion';

const ITEMS = [
  'Envíos a todo Ecuador', 'Delivery motorizado en Ambato', 'Cita Express',
  'Tramaco', 'Servientrega', 'Atención personalizada', 'Transferencia electrónica',
  'Efectivo al retirar', 'Compra rápida por WhatsApp',
];

function TickerItems({ hidden = false }) {
  return <ul aria-hidden={hidden || undefined} className="ba-trust-items flex shrink-0 items-center gap-7 pr-7">{ITEMS.map((item) => <li key={item} className="flex items-center gap-7 whitespace-nowrap text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ba-navy)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--ba-copper)]" aria-hidden="true" />{item}</li>)}</ul>;
}

export default function TrustStrip() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} aria-label="Beneficios de compra" className="ba-trust-strip overflow-hidden border-y border-[var(--ba-border)] bg-[var(--ba-warm-white)] py-5">
      <h2 className="visually-hidden">Beneficios de compra</h2>
      {reduced ? <TickerItems /> : <div tabIndex="0" className={`ba-trust-track ba-ticker flex w-max gap-7 focus:outline-none ${visible ? '' : 'ba-ticker-paused'}`}><TickerItems /><TickerItems hidden /></div>}
    </section>
  );
}
