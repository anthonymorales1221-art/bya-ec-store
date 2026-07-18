import { useEffect, useRef } from 'react';

/**
 * Fondo global ambiental — blobs grandes con movimiento orbital suave.
 * Más saturados y más visibles que la versión original.
 */
export default function AnimatedBackground() {
  const blobRefs = useRef([]);
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reduced.current) return;
    let rafId;
    const start = performance.now();

    const loop = (now) => {
      const t = (now - start) / 1000;
      blobRefs.current.forEach((el, i) => {
        if (!el) return;
        const speed = 0.035 + i * 0.009;
        const radius = 18 + i * 7;
        const x = Math.cos(t * speed + i * 2.1) * radius;
        const y = Math.sin(t * speed * 1.2 + i * 1.4) * radius;
        el.style.transform = `translate(${x}%, ${y}%)`;
      });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-cream" />
      {/* blob 0 — rosa cálido, más visible */}
      <div
        ref={(el) => (blobRefs.current[0] = el)}
        className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full blur-[80px] opacity-70"
        style={{ background: 'radial-gradient(circle, #F3C8B8 0%, transparent 65%)' }}
      />
      {/* blob 1 — azul polvo */}
      <div
        ref={(el) => (blobRefs.current[1] = el)}
        className="absolute top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-[80px] opacity-60"
        style={{ background: 'radial-gradient(circle, #AECBDA 0%, transparent 65%)' }}
      />
      {/* blob 2 — dorado suave */}
      <div
        ref={(el) => (blobRefs.current[2] = el)}
        className="absolute bottom-0 left-1/3 w-[60vw] h-[60vw] rounded-full blur-[90px] opacity-50"
        style={{ background: 'radial-gradient(circle, #DCC495 0%, transparent 65%)' }}
      />
      {/* blob 3 — peach profundo, más pequeño */}
      <div
        ref={(el) => (blobRefs.current[3] = el)}
        className="absolute top-1/2 right-1/4 w-[45vw] h-[45vw] rounded-full blur-[70px] opacity-40"
        style={{ background: 'radial-gradient(circle, #E8A98F 0%, transparent 65%)' }}
      />
      {/* Velo crema muy ligero */}
      <div className="absolute inset-0 bg-cream/20" />
    </div>
  );
}
