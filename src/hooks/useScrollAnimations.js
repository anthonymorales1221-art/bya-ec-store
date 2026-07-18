import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

function isReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let refreshObserverInitialized = false;
function ensureGlobalRefreshObserver() {
  if (refreshObserverInitialized || typeof window === 'undefined') return;
  refreshObserverInitialized = true;

  const scheduleRefresh = () => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleRefresh);
  }

  // Cualquier imagen que termine de cargar después del montaje inicial
  // (hero de StorySection, covers de Categories, avatares de Testimonials)
  // puede cambiar la altura de su contenedor — refrescamos en cada 'load'.
  document.addEventListener(
    'load',
    (e) => {
      if (e.target && e.target.tagName === 'IMG') scheduleRefresh();
    },
    true
  );

  // Red de seguridad general: si cualquier nodo del documento cambia de alto
  // (skeleton -> contenido real, fuentes, imágenes), se recalculan los triggers.
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => scheduleRefresh());
    ro.observe(document.body);
  }

  window.addEventListener('resize', scheduleRefresh);
}

// Punto de entrada público para componentes que orquestan GSAP/ScrollTrigger
// directamente (ej. Categories.jsx) sin pasar por los hooks de arriba.
export function ensureScrollRefreshObserver() {
  ensureGlobalRefreshObserver();
}

// Envuelve cada palabra del texto de un elemento en spans anidados para el
// efecto de "reveal por palabra" (overflow:hidden exterior + translateY interior).
// Solo afecta nodos de texto directos — etiquetas internas (<em>, <strong>) se preservan.
export function wrapWordsForReveal(el) {
  if (!el || el.dataset.wrapped === 'true') return;
  const walker = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        const words = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach((word) => {
          if (!word.trim()) {
            frag.appendChild(document.createTextNode(word));
            return;
          }
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = word;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walker(child);
      }
    });
  };
  walker(el);
  el.dataset.wrapped = 'true';
}

/**
 * Hook de orquestación: registra un título para reveal por palabra al entrar en viewport.
 * Uso: const titleRef = useWordReveal();  <h2 ref={titleRef}>...</h2>
 */
export function useWordReveal() {
  return (el) => {
    if (!el || el.dataset.revealBound === 'true') return;
    el.dataset.revealBound = 'true';

    if (isReducedMotion()) return;
    ensureGlobalRefreshObserver();

    wrapWordsForReveal(el);
    const words = el.querySelectorAll('.word-inner');
    if (!words.length) return;

    gsap.set(words, { yPercent: 110 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      // Si el elemento YA está dentro del umbral al momento de crear el
      // trigger (sección visible desde el primer pintado, sin necesidad de
      // scroll), ScrollTrigger.create no dispara onEnter por sí solo —
      // refresh() lo evalúa contra el estado actual y lo activa de inmediato.
      onEnter: () => {
        gsap.to(words, {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.035,
        });
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
}

/**
 * Fade + translateY genérico al entrar en viewport. Devuelve un ref callback.
 */
export function useFadeUp({ y = 60, duration = 1, delay = 0, stagger = 0 } = {}) {
  return (el) => {
    if (!el || el.dataset.fadeBound === 'true') return;
    el.dataset.fadeBound = 'true';

    if (isReducedMotion()) return;
    ensureGlobalRefreshObserver();

    const targets = stagger ? el.children : el;
    gsap.set(targets, { opacity: 0, y });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'expo.out',
          stagger,
        });
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
}

/**
 * Escala de imagen al hacer scroll: 1.3 -> 1 a medida que la sección entra en viewport.
 */
export function useScaleReveal() {
  return (el) => {
    if (!el || el.dataset.scaleBound === 'true') return;
    el.dataset.scaleBound = 'true';

    if (isReducedMotion()) return;
    ensureGlobalRefreshObserver();

    gsap.fromTo(
      el,
      { scale: 1.3 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 30%',
          scrub: true,
        },
      }
    );
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
}

// Limpieza global de ScrollTrigger al desmontar una página completa (Landing/Store).
export function useScrollAnimationsCleanup() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}
