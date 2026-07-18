import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Aplica un desplazamiento Y suave ligado al scroll sobre el elemento referenciado.
 * Pensado para imágenes/capas de fondo en secciones de storytelling de la Landing.
 *
 * @param {number} strength - magnitud del desplazamiento en px (positivo = se mueve más lento que el scroll)
 */
export function useParallax(strength = 80) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const tween = gsap.fromTo(
      el,
      { y: -strength / 2 },
      {
        y: strength / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [strength]);

  return ref;
}
