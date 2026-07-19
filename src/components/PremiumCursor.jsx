import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], [data-cursor]';
const FORM_CONTROL = 'input, textarea, select, [contenteditable="true"]';

export default function PremiumCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const query = window.matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!cursor || !query.matches) return undefined;

    const dot = cursor.querySelector('[data-cursor-dot]');
    const ring = cursor.querySelector('[data-cursor-ring]');
    const label = cursor.querySelector('[data-cursor-label]');
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frame = 0;
    let running = true;

    const render = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      if (running) frame = requestAnimationFrame(render);
    };
    const setContext = (target) => {
      const control = target.closest?.(FORM_CONTROL);
      const interactive = target.closest?.(INTERACTIVE);
      const dark = target.closest?.('[data-cursor-tone="light"], .ba-dark');
      cursor.classList.toggle('is-hidden', Boolean(control));
      cursor.classList.toggle('is-active', Boolean(interactive && !control));
      cursor.classList.toggle('is-light', Boolean(dark));
      label.textContent = interactive?.dataset.cursor || '';
      document.documentElement.classList.toggle('ba-cursor-over-control', Boolean(control));
    };
    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('is-visible');
      document.documentElement.classList.add('ba-custom-cursor-ready');
      setContext(event.target);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      cursor.classList.remove('is-visible');
      document.documentElement.classList.remove('ba-custom-cursor-ready');
    };
    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      document.documentElement.classList.remove('ba-custom-cursor-ready', 'ba-cursor-over-control');
    };
  }, []);

  return <div ref={cursorRef} className="ba-premium-cursor" aria-hidden="true"><span className="ba-cursor-dot" data-cursor-dot /><span className="ba-cursor-ring" data-cursor-ring><span data-cursor-label /></span></div>;
}
