import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function usePointerMotion(ref, { maxX = 16, maxY = 12 } = {}) {
  useEffect(() => {
    const element = ref.current;
    const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
    if (!element || !enabled) return undefined;
    let frame = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      frame = 0;
      element.style.setProperty('--pointer-x', `${x * maxX}px`);
      element.style.setProperty('--pointer-y', `${y * maxY}px`);
      element.style.setProperty('--pointer-soft-x', `${x * maxX * 0.55}px`);
      element.style.setProperty('--pointer-soft-y', `${y * maxY * 0.55}px`);
    };
    const move = (event) => {
      const rect = element.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const reset = () => {
      x = 0; y = 0;
      if (!frame) frame = requestAnimationFrame(render);
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
    };
  }, [ref, maxX, maxY]);
}

export function useElementScrollProgress(ref, variable = '--section-progress') {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(1, rect.height);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      element.style.setProperty(variable, String(progress));
      if (variable === '--hero-progress') {
        element.style.setProperty('--hero-opacity', String(1 - progress * 0.72));
        element.style.setProperty('--hero-content-scale', String(1 - progress * 0.025));
        element.style.setProperty('--hero-image-scale', String(1.02 + progress * 0.025));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, variable]);
}
