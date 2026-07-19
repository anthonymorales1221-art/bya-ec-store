import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

// CONFIGURACIÓN DE VELOCIDAD DE LA SECCIÓN DE CATEGORÍAS
// Solo escritorio: aumenta desktopScrollPerCategory para ir más lento y redúcelo para ir más rápido.
const CATEGORY_SCROLL_SETTINGS = {
  desktopScrollPerCategory: 10, // Distancia en svh asignada a cada categoría.
  introScrollDistance: 81, // Distancia en svh reservada para la introducción.
  minimumScrollDistance: 320, // Distancia mínima total en svh.
};

// CONFIGURACIÓN DE VELOCIDAD DE TRANSICIÓN ENTRE CATEGORÍAS
// Para ralentizar imágenes aumenta imageRevealShare; para más lectura aumenta activeHoldShare.
// panelOverlapShare prolonga la coexistencia; scrubSmoothing solo agrega amortiguación.
const CATEGORY_MOTION_TIMING = {
  timelineStart: 1,
  timelineEnd: 10,
  imageRevealShare: 0.44,
  outgoingImageShare: 0.36,
  textEnterDelay: 0.56,
  textEnterShare: 0.24,
  textStaggerShare: 0.035,
  activeHoldShare: 0.38,
  textExitShare: 0.13,
  panelOverlapShare: 0.34,
  scrubSmoothing: 1.1,
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

function createPanelWindows(panelCount) {
  if (!panelCount) return [];
  const { timelineStart, timelineEnd, panelOverlapShare } = CATEGORY_MOTION_TIMING;
  const availableDuration = timelineEnd - timelineStart;
  const panelDuration = availableDuration / (panelCount - (panelCount - 1) * panelOverlapShare);
  const panelStep = panelDuration * (1 - panelOverlapShare);

  return Array.from({ length: panelCount }, (_, index) => ({
    start: timelineStart + index * panelStep,
    end: Math.min(timelineEnd, timelineStart + index * panelStep + panelDuration),
  }));
}

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
  const panelWindows = useMemo(() => createPanelWindows(categories.length), [categories.length]);
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
        const surface = panel.querySelector('[data-category-surface]');
        const image = panel.querySelector('[data-category-image]');
        const copy = panel.querySelectorAll('[data-category-copy]');
        gsap.set(panel, { zIndex: index + 2 });
        gsap.set(media, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(surface, { yPercent: 100, scale: 1.05 });
        gsap.set(image, { scale: 1.035, yPercent: 2 });
        gsap.set(copy, { autoAlpha: 0, y: 34 });
        gsap.set(panel.querySelector('[data-category-depth]'), { autoAlpha: 0 });
      });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: CATEGORY_MOTION_TIMING.scrubSmoothing,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            stage.style.setProperty('--category-progress', progress);
            if (!counterRef.current) return;
            const playhead = progress * 10;
            const active = panelWindows.reduce(
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
        const { start, end } = panelWindows[index];
        const duration = end - start;
        const media = panel.querySelector('[data-category-media]');
        const surface = panel.querySelector('[data-category-surface]');
        const image = panel.querySelector('[data-category-image]');
        const copy = panel.querySelectorAll('[data-category-copy]');
        const depthOverlay = panel.querySelector('[data-category-depth]');
        const revealDuration = duration * CATEGORY_MOTION_TIMING.imageRevealShare;
        const textEnterStart = start + revealDuration * CATEGORY_MOTION_TIMING.textEnterDelay;

        timeline
          .set(panel, { autoAlpha: 1 }, start)
          .to(media, {
            clipPath: 'inset(0% 0 0 0)',
            duration: revealDuration,
            ease: 'none',
          }, start)
          .to(surface, {
            yPercent: 0,
            scale: 1,
            duration: revealDuration,
            ease: 'none',
          }, start)
          .to(image, {
            scale: 1,
            yPercent: 0,
            duration: revealDuration,
            ease: 'none',
          }, start)
          .to(copy, {
            autoAlpha: 1,
            y: 0,
            duration: duration * CATEGORY_MOTION_TIMING.textEnterShare,
            stagger: duration * CATEGORY_MOTION_TIMING.textStaggerShare,
            ease: 'power3.out',
          }, textEnterStart);

        if (index < panels.length - 1) {
          const nextWindow = panelWindows[index + 1];
          const nextDuration = nextWindow.end - nextWindow.start;
          const nextRevealDuration = nextDuration * CATEGORY_MOTION_TIMING.imageRevealShare;
          const nextTextStart = nextWindow.start
            + nextRevealDuration * CATEGORY_MOTION_TIMING.textEnterDelay;
          const textExitDuration = duration * CATEGORY_MOTION_TIMING.textExitShare;
          const holdEnd = start + revealDuration
            + duration * CATEGORY_MOTION_TIMING.activeHoldShare;
          const textExitStart = Math.min(nextTextStart - textExitDuration, holdEnd);
          const overlapDuration = Math.min(
            duration * CATEGORY_MOTION_TIMING.outgoingImageShare,
            nextDuration * CATEGORY_MOTION_TIMING.panelOverlapShare,
          );

          timeline
            .to(copy, {
              autoAlpha: 0,
              y: -24,
              duration: textExitDuration,
              stagger: {
                each: duration * CATEGORY_MOTION_TIMING.textStaggerShare,
                from: 'end',
              },
              ease: 'power2.in',
            }, textExitStart)
            .to(surface, {
              yPercent: -8,
              scale: 0.955,
              duration: overlapDuration,
              ease: 'none',
            }, nextWindow.start)
            .to(media, {
              autoAlpha: 0.34,
              duration: overlapDuration,
              ease: 'none',
            }, nextWindow.start)
            .to(depthOverlay, {
              autoAlpha: 0.68,
              duration: overlapDuration,
              ease: 'none',
            }, nextWindow.start)
            .set(panel, { autoAlpha: 0 }, nextWindow.start + overlapDuration);
        }
      });

      timeline.to({}, { duration: 0.01 }, CATEGORY_MOTION_TIMING.timelineEnd);

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, section);

    return () => context.revert();
  }, [catalogStatus, categories, panelWindows]);

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
                  <span className="ba-category-surface" data-category-surface>
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
                    <span
                      className="pointer-events-none absolute inset-0 bg-[var(--ba-navy-deep)]"
                      data-category-depth
                      aria-hidden="true"
                    />
                    <span className="ba-category-band" aria-hidden="true">Ver categoría</span>
                  </span>
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
