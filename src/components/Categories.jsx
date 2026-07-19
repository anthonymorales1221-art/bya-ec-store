import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

// CONFIGURACIÓN DE VELOCIDAD DE LA SECCIÓN DE CATEGORÍAS
// Solo escritorio: aumenta desktopScrollPerCategory para ir más lento y redúcelo para ir más rápido.
// scrubSmoothing agrega suavidad/retraso; no modifica la distancia total del recorrido.
const CATEGORY_SCROLL_SETTINGS = {
  desktopScrollPerCategory: 10, // Distancia en svh asignada a cada categoría.
  introScrollDistance: 81, // Distancia en svh reservada para la introducción.
  scrubSmoothing: 1.1,
  minimumScrollDistance: 320, // Distancia mínima total en svh.
};

const PRESENTATION_CATEGORIES = [
  {
    id: 'beauty',
    title: 'Belleza y cuidado',
    description: 'Productos seleccionados para verte, cuidarte y sentirte bien cada día.',
    matches: /belleza|cuidado|perfume|cosm[eé]tica/i,
  },
  {
    id: 'home',
    title: 'Hogar y bienestar',
    description: 'Detalles funcionales que aportan orden, comodidad y bienestar a tus espacios.',
    matches: /hogar|bienestar|casa|cocina/i,
  },
  {
    id: 'vehicle',
    title: 'Accesorios para vehículo',
    description: 'Soluciones prácticas para acompañarte y hacer más cómodos tus recorridos.',
    matches: /veh[ií]culo|auto|carro|moto|automotriz/i,
  },
  {
    id: 'new',
    title: 'Novedades y favoritos',
    description: 'Descubre los productos destacados y las incorporaciones más recientes de la tienda.',
    matches: /novedad|favorito|destacado/i,
  },
];

const PANEL_WINDOWS = [
  { start: 1, end: 3.5 },
  { start: 2.9, end: 5.7 },
  { start: 5.1, end: 7.9 },
  { start: 7.3, end: 10 },
];

function curateCategories(products) {
  return PRESENTATION_CATEGORIES.map((presentation) => {
    const matches = products.filter((product) => presentation.matches.test(product.category || ''));
    const candidates = presentation.id === 'new'
      ? products.filter((product) => product.featured && product.stock > 0)
      : matches;
    const cover = candidates.find((product) => product.featured && product.img)
      || candidates.find((product) => product.img);

    return {
      ...presentation,
      image: cover?.img || '',
      sourceCategory: matches[0]?.category || '',
    };
  });
}

export default function Categories() {
  const { products, catalogStatus } = useCart();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const counterRef = useRef(null);
  const categories = useMemo(() => curateCategories(products), [products]);
  const desktopScrollDistance = Math.max(
    CATEGORY_SCROLL_SETTINGS.minimumScrollDistance,
    CATEGORY_SCROLL_SETTINGS.introScrollDistance
      + categories.length * CATEGORY_SCROLL_SETTINGS.desktopScrollPerCategory,
  );
  const categorySectionHeight = desktopScrollDistance + 100;

  const handleMediaPointerMove = (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    event.currentTarget.style.setProperty('--media-x', `${x}px`);
    event.currentTarget.style.setProperty('--media-y', `${y}px`);
  };

  const resetMediaPointer = (event) => {
    event.currentTarget.style.setProperty('--media-x', '0px');
    event.currentTarget.style.setProperty('--media-y', '0px');
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const enabled = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !stage || !enabled) return undefined;

    const context = gsap.context(() => {
      const intro = stage.querySelector('[data-category-intro]');
      const introLines = gsap.utils.toArray('[data-category-intro-line]', intro);
      const introCopy = intro.querySelector('[data-category-intro-copy]');
      const label = stage.querySelector('[data-category-label]');
      const panels = gsap.utils.toArray('[data-category-panel]', stage);

      gsap.set(introLines, { yPercent: 112 });
      gsap.set(introCopy, { autoAlpha: 0, y: 24 });
      gsap.set(label, { autoAlpha: 0, y: 16 });
      gsap.set(panels, { autoAlpha: 0 });

      panels.forEach((panel, index) => {
        const media = panel.querySelector('[data-category-media]');
        const image = panel.querySelector('[data-category-image]');
        const copy = panel.querySelectorAll('[data-category-copy]');
        gsap.set(panel, { zIndex: index + 2 });
        gsap.set(media, { clipPath: 'inset(100% 0 0 0)', yPercent: 38, scale: 1.045 });
        gsap.set(image, { scale: 1.035, yPercent: 2 });
        gsap.set(copy, { autoAlpha: 0, y: 34 });
      });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: CATEGORY_SCROLL_SETTINGS.scrubSmoothing,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            stage.style.setProperty('--category-progress', progress);
            if (!counterRef.current) return;
            const playhead = progress * 10;
            const active = PANEL_WINDOWS.reduce(
              (current, window, index) => (playhead >= window.start ? index : current),
              0,
            );
            counterRef.current.textContent = `${String(active + 1).padStart(2, '0')} / 04`;
          },
        },
      });

      timeline
        .to(introLines, { yPercent: 0, duration: 0.58, stagger: 0.07 }, 0)
        .to(introCopy, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.34)
        .to(intro, { autoAlpha: 0, yPercent: -16, duration: 0.42 }, 0.92)
        .to(label, { autoAlpha: 1, y: 0, duration: 0.35 }, 1.02);

      panels.forEach((panel, index) => {
        const { start, end } = PANEL_WINDOWS[index];
        const duration = end - start;
        const media = panel.querySelector('[data-category-media]');
        const image = panel.querySelector('[data-category-image]');
        const copy = panel.querySelectorAll('[data-category-copy]');

        timeline
          .set(panel, { autoAlpha: 1 }, start)
          .to(media, {
            clipPath: 'inset(0% 0 0 0)',
            yPercent: 0,
            scale: 1,
            duration: duration * 0.3,
          }, start)
          .to(image, { scale: 1, yPercent: 0, duration: duration * 0.38 }, start)
          .to(copy, {
            autoAlpha: 1,
            y: 0,
            duration: duration * 0.22,
            stagger: duration * 0.035,
          }, start + duration * 0.13);

        if (index < panels.length - 1) {
          timeline
            .to(copy, {
              autoAlpha: 0,
              y: -24,
              duration: duration * 0.2,
              stagger: duration * 0.02,
            }, end - duration * 0.25)
            .to(media, {
              autoAlpha: 0.34,
              yPercent: -8,
              scale: 0.955,
              duration: duration * 0.28,
            }, end - duration * 0.28)
            .set(panel, { autoAlpha: 0 }, end);
        }
      });

      timeline.to({}, { duration: 0.01 }, 10);

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, section);

    return () => context.revert();
  }, [catalogStatus, categories]);

  if (catalogStatus === 'error') return null;

  return (
    <section
      id="categorias"
      ref={sectionRef}
      className="ba-categories-editorial"
      style={{ '--category-section-height': `${categorySectionHeight}svh` }}
    >
      <div ref={stageRef} className="ba-categories-stage">
        <header className="ba-categories-intro" data-category-intro>
          <p className="ba-kicker text-[var(--ba-copper-soft)]">Explora por categoría</p>
          <h2 className="ba-categories-intro-title font-display">
            <span><span data-category-intro-line>Encuentra algo</span></span>
            <span><span data-category-intro-line>para cada momento</span></span>
          </h2>
          <p className="ba-categories-intro-copy" data-category-intro-copy>
            Una selección organizada para que descubras rápidamente lo que necesitas.
          </p>
        </header>

        <div className="ba-categories-label" data-category-label aria-hidden="true">
          <span>Categorías</span>
          <span ref={counterRef}>01 / 04</span>
          <i><span /></i>
        </div>

        <div className="ba-category-panels">
          {categories.map((category, index) => {
            const routeState = category.sourceCategory ? { category: category.sourceCategory } : undefined;

            return (
              <article
                key={category.id}
                className="ba-category-panel"
                data-category-panel
                style={{ '--category-index': index }}
              >
                <Link
                  to="/tienda"
                  state={routeState}
                  className={`ba-category-media ba-category-media--${category.id}`}
                  data-category-media
                  data-cursor="EXPLORAR"
                  aria-label={`Explorar ${category.title}`}
                  onPointerMove={handleMediaPointerMove}
                  onPointerLeave={resetMediaPointer}
                >
                  {category.image && (
                    <span className="ba-category-image-wrap" data-category-image>
                      <ProductImage
                        absolute
                        src={category.image}
                        alt={`Selección de ${category.title}`}
                        className="ba-category-image h-full w-full object-cover"
                        fallbackClassName="hidden"
                      />
                    </span>
                  )}
                  <span className="ba-category-orbit" aria-hidden="true" />
                  <span className="ba-category-monogram font-display" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="ba-category-shade" aria-hidden="true" />
                  <span className="ba-category-band" aria-hidden="true">Ver categoría</span>
                </Link>

                <div className="ba-category-copy">
                  <span className="ba-category-number font-display" data-category-copy>
                    /{String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="ba-category-title font-display" data-category-copy>{category.title}</h3>
                    <p className="ba-category-description" data-category-copy>{category.description}</p>
                  </div>
                  <Link
                    to="/tienda"
                    state={routeState}
                    className="ba-arrow-link w-fit text-white"
                    data-category-copy
                  >
                    Explorar categoría <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
