import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import { useWordReveal } from '../hooks/useScrollAnimations';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tarjeta de evidencia — eco directo del layout "Evidencias/Blog" del
 * template de Framer: imagen grande a la izquierda, panel oscuro a la
 * derecha con una foto pequeña circular superpuesta al título, fecha
 * y descripción corta. Es puramente visual (sin link ni navegación):
 * la persona solo la mira, no hace click en ella.
 */
function EvidenciaCard({ e, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.fromTo(el, { opacity: 0.55, y: 28, scale: 0.975 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out', delay: index * 0.06, clearProps: 'transform,opacity',
        }),
      });
    }, el);
    return () => context.revert();
  }, [index]);

  return (
    <article
      ref={cardRef}
      className="ba-evidence-card group relative rounded-[26px] overflow-hidden bg-ink border border-ink/40 isolate"
    >
      <div className="grid sm:grid-cols-2">
        {/* Imagen grande */}
        <div className="relative aspect-[4/3] sm:aspect-auto overflow-hidden">
          <ProductImage
            src={e.fotoGrande}
            alt={e.nombre}
            variant="evidence"
            className="absolute inset-0 w-full h-full"
            fallbackClassName="font-display font-semibold text-ink-soft text-2xl"
            fallbackTextClassName="font-display font-semibold text-ink-soft text-2xl"
          />
        </div>

        {/* Panel oscuro con foto pequeña, nombre, fecha y descripción */}
        <div className="relative flex flex-col p-7 sm:p-8">
          <div className="relative flex flex-col items-center text-center pt-2 pb-6">
            <div
              className="rounded-2xl overflow-hidden ring-4 ring-ink shadow-xl mb-[-1.4rem] relative z-10"
              style={{ width: 88, height: 88 }}
            >
              <ProductImage
                src={e.fotoPequena || e.fotoGrande}
                alt={e.nombre}
                variant="thumbnail"
                className="w-full h-full"
                fallbackClassName="font-display font-semibold text-ink-soft text-base"
                fallbackTextClassName="font-display font-semibold text-ink-soft text-base"
              />
            </div>
            <div className="w-full h-px bg-cream/12 mt-[2.6rem]" />
            <h3 className="font-display font-semibold text-xl text-cream mt-4 leading-tight">
              {e.nombre}
            </h3>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            {e.fechaDescripcion && (
              <span className="text-[0.7rem] uppercase tracking-[0.14em] font-bold text-peach/80">
                {e.fechaDescripcion}
              </span>
            )}
            {e.texto && (
              <p className="text-sm text-cream/65 leading-relaxed">{e.texto}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Evidencias() {
  const { evidencias, evidenciasStatus } = useCart();
  const titleRef = useWordReveal();

  if (evidenciasStatus === 'error') return null;

  return (
    <section id="evidencias" className="ba-evidence-section py-28 sm:py-36 px-6 bg-gradient-to-b from-cream to-cream-deep/30">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] font-extrabold text-peach-deep mb-5">
              <span className="w-5 h-px bg-gold" />
              Evidencias
            </span>
            <h2
              ref={titleRef}
              className="font-display font-medium text-[clamp(1.9rem,3.6vw,2.7rem)] leading-[1.15] tracking-tight"
            >
              Lo que entregamos, en imágenes
            </h2>
          </div>
        </div>

        {evidenciasStatus === 'loading' && (
          <div className="ba-evidence-rail grid sm:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] rounded-[26px] skeleton" />
            ))}
          </div>
        )}

        {evidenciasStatus === 'ready' && evidencias.length === 0 && (
          <div className="text-center text-ink-soft text-sm py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-deep flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-ink-soft" fill="none">
                <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            Todavía no hay evidencias publicadas. Revisa que la hoja
            "Evidencias" exista, tenga filas con <code className="font-mono bg-cream-deep px-1.5 py-0.5 rounded">activo = TRUE</code> y al menos
            "foto_url_grande" y "nombre" llenos.
          </div>
        )}

        {evidenciasStatus === 'ready' && evidencias.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6">
            {evidencias.map((e, i) => (
              <EvidenciaCard key={i} e={e} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
