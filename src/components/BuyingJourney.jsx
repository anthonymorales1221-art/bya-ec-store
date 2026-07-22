import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { title: 'Explora la tienda', text: 'Revisa categorías, productos, precios y disponibilidad.', label: 'Catálogo disponible' },
  { title: 'Agrega tus productos', text: 'Selecciona cantidades y organiza tu pedido en el carrito.', label: 'Tu selección' },
  { title: 'Confirma por WhatsApp', text: 'El Asistente virtual B&A recibe el detalle del carrito y te guía durante la confirmación.', label: 'Resumen preparado' },
  { title: 'Paga y recibe', text: 'Realiza una transferencia electrónica o paga en efectivo al retirar. Después coordinamos la entrega seleccionada.', label: 'Pedido coordinado' },
];

export default function BuyingJourney() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(Number(entry.target.dataset.step))), { rootMargin: '-30% 0px -45% 0px' });
    refs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="como-comprar" className="ba-buying bg-[var(--ba-warm-white)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10" style={{ '--buying-progress': (active + 1) / STEPS.length }}>
      <div className="mx-auto max-w-[1240px]"><div className="ba-buying-heading max-w-3xl"><p className="ba-kicker">Paso a paso</p><h2 className="ba-section-title mt-4">Comprar es simple</h2><p className="ba-section-copy mt-5">Explora, elige y confirma tu pedido directamente por WhatsApp.</p></div>
        <div className="mt-16 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div className="self-start lg:sticky lg:top-28">
            <div className="mx-auto max-w-[430px] rounded-[36px] border-[8px] border-[var(--ba-navy-deep)] bg-[var(--ba-ivory)] p-4 shadow-[0_28px_70px_rgba(9,24,43,0.14)]">
              <div className="rounded-[24px] bg-white p-6"><div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.13em] text-[var(--ba-muted)]"><span>B&A.EC Store</span><span>0{active + 1}/04</span></div><div className="my-8 flex aspect-square items-center justify-center rounded-[20px] bg-[var(--ba-navy)] text-white"><div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/25 font-display text-2xl">0{active + 1}</span><p className="mt-5 text-sm font-bold">{STEPS[active].label}</p></div></div><div className="h-2 overflow-hidden rounded-full bg-[var(--ba-border)]"><span className="block h-full rounded-full bg-[var(--ba-copper)] transition-all duration-500" style={{ width: `${((active + 1) / 4) * 100}%` }} /></div></div>
            </div>
          </div>
          <div className="ba-buying-steps divide-y divide-[var(--ba-border)]">{STEPS.map((step, index) => <article key={step.title} ref={(element) => { refs.current[index] = element; }} data-step={index} className={`ba-buying-step flex min-h-[42vh] flex-col justify-center py-12 lg:min-h-[55vh]${active === index ? ' is-active' : ''}`}><span className="text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--ba-copper)]">Paso 0{index + 1}</span><h3 className="mt-4 font-display text-4xl font-medium text-[var(--ba-navy-deep)]">{step.title}</h3><p className="mt-4 max-w-xl text-base leading-8 text-[var(--ba-muted)]">{step.text}</p>{index === 0 && <Link to="/tienda" className="ba-arrow-link mt-6 w-fit text-[var(--ba-navy)]">Abrir la tienda <span aria-hidden="true">→</span></Link>}</article>)}</div>
        </div>
      </div>
    </section>
  );
}
