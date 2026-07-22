import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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

const CATEGORY_RESOLUTION_RULES = [
  { id: 'beauty', titleMatch: /belleza|cuidado|perfume|cosmetica/, productMatch: /belleza|cuidado|perfume|cosm[eé]tica/i },
  { id: 'home', titleMatch: /hogar|bienestar|casa|cocina/, productMatch: /hogar|bienestar|casa|cocina/i },
  { id: 'vehicle', titleMatch: /vehiculo|auto|carro|moto|automotriz/, productMatch: /veh[ií]culo|auto|carro|moto|automotriz/i },
  { id: 'new', titleMatch: /novedad|favorito|destacado/, productMatch: /novedad|favorito|destacado/i, usesFeatured: true },
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

function normalizeCategoryKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function validCategoryRoute(value) {
  const route = String(value || '').trim().replace(/\/$/, '');
  return route === '/tienda' ? '/tienda' : '';
}

function curateCategories(sheetCategories, products) {
  const productCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  return sheetCategories.map((sheetCategory) => {
    const titleKey = normalizeCategoryKey(sheetCategory.title);
    const rule = CATEGORY_RESOLUTION_RULES.find((item) => item.titleMatch.test(titleKey));
    const requestedCategory = normalizeCategoryKey(sheetCategory.slug || sheetCategory.title);
    const exactCategory = productCategories.find(
      (category) => normalizeCategoryKey(category) === requestedCategory,
    );
    const matchedCategory = exactCategory || productCategories.find(
      (category) => rule?.productMatch.test(category),
    ) || '';
    const matchedProducts = rule?.usesFeatured
      ? products.filter((product) => product.featured && product.stock > 0)
      : products.filter((product) => matchedCategory && product.category === matchedCategory);
    const cover = matchedProducts.find((product) => product.featured && product.img)
      || matchedProducts.find((product) => product.img);
    const route = validCategoryRoute(sheetCategory.route) || (matchedCategory || rule ? '/tienda' : '');

    return {
      id: sheetCategory.id,
      visualId: rule?.id || 'neutral',
      title: sheetCategory.title,
      description: sheetCategory.description,
      image: sheetCategory.image,
      fallbackImage: cover?.img || '',
      route,
      sourceCategory: matchedCategory,
      imagePosition: 'center',
    };
  });
}

export default function Categories() {
  const { categories: sheetCategories, categoriesStatus, products } = useCart();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const counterRef = useRef(null);
  const categories = useMemo(
    () => curateCategories(sheetCategories, products),
    [sheetCategories, products],
  );
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

  useEffect(() => {
    if (!import.meta.env.DEV || categoriesStatus !== 'ready') return;
    const unresolved = categories.filter((category) => !category.route).map((category) => category.title);
    if (unresolved.length > 0) {
      console.warn('[Categorías] CTA deshabilitado porque no existe una ruta/categoría real:', unresolved);
    }
  }, [categories, categoriesStatus]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const enabled = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)').matches;
    if (!section || !stage || !enabled || categoriesStatus !== 'ready' || categories.length === 0) return undefined;

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
            const total = String(categories.length).padStart(2, '0');
            counterRef.current.textContent = `${String(active + 1).padStart(2, '0')} / ${total}`;
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
  }, [categoriesStatus, categories, panelWindows]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || categoriesStatus !== 'ready' || categories.length === 0) return undefined;

    const media = gsap.matchMedia();
    media.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const introItems = stage.querySelectorAll('.ba-categories-intro > *');
      const panels = gsap.utils.toArray('[data-category-panel]', stage);
      let refreshFrame = 0;

      ScrollTrigger.create({
        trigger: stage.querySelector('[data-category-intro]'),
        start: 'top 86%',
        once: true,
        onEnter: () => gsap.fromTo(introItems, { y: 22, opacity: 0.55 }, {
          y: 0,
          opacity: 1,
          duration: 0.62,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }),
      });

      panels.forEach((panel, index) => {
        const number = panel.querySelector('.ba-category-number');
        const categoryMedia = panel.querySelector('[data-category-media]');
        const copy = panel.querySelector('.ba-category-copy > div');
        const cta = panel.querySelector('.ba-category-copy > .ba-arrow-link');
        const entrance = gsap.timeline({ paused: true });
        entrance
          .fromTo(number, { y: 18, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.42, ease: 'power2.out', clearProps: 'transform,opacity' })
          .fromTo(categoryMedia, { y: 28, scale: 0.96, opacity: 0.45 }, { y: 0, scale: 1, opacity: 1, duration: 0.72, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.06)
          .fromTo(copy, { y: 24, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.28)
          .fromTo(cta, { y: 16, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.42);
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 86%',
          once: true,
          onEnter: () => entrance.play(0),
        });
        if (index < panels.length - 1) {
          gsap.to(panel, {
            scale: 0.985,
            opacity: 0.72,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'bottom 68%',
              end: 'bottom 24%',
              scrub: 0.55,
            },
          });
        }
      });

      const scheduleRefresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      section.addEventListener('load', scheduleRefresh, true);
      document.fonts?.ready.then(scheduleRefresh);
      return () => {
        cancelAnimationFrame(refreshFrame);
        section.removeEventListener('load', scheduleRefresh, true);
      };
    });

    return () => media.revert();
  }, [categoriesStatus, categories]);

  if (categoriesStatus === 'loading') {
    return (
      <section id="categorias" className="flex min-h-[70svh] items-center justify-center bg-[var(--ba-navy-deep)]" aria-busy="true">
        <span className="visually-hidden">Cargando categorías</span>
        <span className="h-px w-24 animate-pulse bg-[var(--ba-copper-soft)]/45" aria-hidden="true" />
      </section>
    );
  }

  if (categoriesStatus === 'error' || categories.length === 0) return null;

  const totalLabel = String(categories.length).padStart(2, '0');

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
          <span ref={counterRef}>01 / {totalLabel}</span>
          <i><span /></i>
        </div>

        <div className="ba-category-panels">
          {categories.map((category, index) => {
            const routeState = category.sourceCategory ? { category: category.sourceCategory } : undefined;
            const mediaClassName = `ba-category-media ba-category-media--${category.visualId}`;
            const mediaContent = (
              <span
                className="ba-category-surface"
                data-category-surface
                style={{ '--category-image-position': category.imagePosition }}
              >
                {(category.image || category.fallbackImage) && (
                  <span className="ba-category-image-wrap" data-category-image>
                    <ProductImage
                      absolute
                      src={category.image}
                      fallbackSrc={category.fallbackImage}
                      alt={`Selección de ${category.title}`}
                      variant="category"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      className="ba-category-image h-full w-full"
                      fallbackClassName="font-display text-4xl text-white"
                    />
                  </span>
                )}
                <span className="ba-category-shade" aria-hidden="true" />
                <span
                  className="pointer-events-none absolute inset-0 bg-[var(--ba-navy-deep)]"
                  data-category-depth
                  aria-hidden="true"
                />
                {category.route && <span className="ba-category-band" aria-hidden="true">Ver categoría</span>}
              </span>
            );

            return (
              <article
                key={category.id}
                className="ba-category-panel"
                data-category-panel
                style={{ '--category-index': index }}
              >
                {category.route ? (
                  <Link
                    to={category.route}
                    state={routeState}
                    className={mediaClassName}
                    data-category-media
                    data-cursor="EXPLORAR"
                    aria-label={`Explorar ${category.title}`}
                    onPointerMove={handleMediaPointerMove}
                    onPointerLeave={resetMediaPointer}
                  >
                    {mediaContent}
                  </Link>
                ) : (
                  <div className={mediaClassName} data-category-media aria-label={category.title}>
                    {mediaContent}
                  </div>
                )}

                <div className="ba-category-copy">
                  <span className="ba-category-number font-display" data-category-copy>
                    /{String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="ba-category-title font-display" data-category-copy>{category.title}</h3>
                    <p className="ba-category-description" data-category-copy>{category.description}</p>
                  </div>
                  {category.route ? (
                    <Link
                      to={category.route}
                      state={routeState}
                      className="ba-arrow-link w-fit text-white"
                      data-category-copy
                    >
                      Explorar categoría <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="ba-arrow-link w-fit cursor-not-allowed text-white/45" data-category-copy aria-disabled="true">
                      Explorar categoría
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
