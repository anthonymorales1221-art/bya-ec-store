import { useEffect, useRef, useState } from 'react';

const STEPS = [
  { title: 'Utilidad real', text: 'Seleccionamos artículos que resuelven necesidades concretas y pueden integrarse fácilmente en tu día a día.' },
  { title: 'Diseño y presentación', text: 'Buscamos productos funcionales que también se sientan bien elegidos, cuidados y presentados.' },
  { title: 'Compra acompañada', text: 'Puedes explorar con libertad y recibir asistencia humana cuando necesites orientación antes de comprar.' },
];

export default function StorySection() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
    }), { rootMargin: '-35% 0px -45% 0px' });
    stepRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="historia" className="ba-story bg-[var(--ba-warm-white)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10" style={{ '--story-progress': (active + 1) / STEPS.length }}>
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="ba-story-lead self-start lg:sticky lg:top-28">
          <p className="ba-kicker">Nuestra selección</p>
          <h2 className="ba-section-title mt-4">No elegimos productos por cantidad. Los elegimos por lo que aportan.</h2>
          <p className="ba-section-copy mt-6">En B&A.EC Store reunimos productos prácticos, actuales y confiables para diferentes momentos de tu día.</p>
          <div className="ba-story-media relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] bg-[var(--ba-navy)]">
            <img src="/images/hero/ba-ec-hero-premium.png" alt="Composición visual de B&A.EC Store" width="1672" height="941" loading="lazy" className="h-full w-full object-cover transition-transform duration-700" style={{ transform: `scale(1.04) translateX(${active * -1.5}%)` }} />
            <div className="absolute inset-0 bg-[var(--ba-navy-deep)]/20" aria-hidden="true" />
            <span className="absolute bottom-6 left-6 font-display text-3xl text-white sm:text-4xl">{STEPS[active].title}</span>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm font-bold text-[var(--ba-muted)]"><span className="text-[var(--ba-copper)]">0{active + 1}</span><span className="h-px flex-1 bg-[var(--ba-border)]"><span className="block h-px bg-[var(--ba-copper)] transition-all duration-500" style={{ width: `${((active + 1) / STEPS.length) * 100}%` }} /></span><span>03</span></div>
        </div>

        <div className="ba-story-steps divide-y divide-[var(--ba-border)]">
          {STEPS.map((step, index) => (
            <article key={step.title} ref={(element) => { stepRefs.current[index] = element; }} data-index={index} className={`ba-story-step flex min-h-[52vh] flex-col justify-center py-16 lg:min-h-[68vh]${active === index ? ' is-active' : ''}`}>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--ba-copper)]">Paso 0{index + 1}</span>
              <h3 className="mt-5 font-display text-4xl font-medium text-[var(--ba-navy-deep)] sm:text-5xl">{step.title}</h3>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ba-muted)] sm:text-lg">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
