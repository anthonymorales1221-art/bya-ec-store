import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import { useWordReveal } from '../hooks/useScrollAnimations';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

function buildFeaturedCategories(products) {
  const byCategory = new Map();
  products.forEach((p) => {
    if (!p.category) return;
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
  });

  const categories = [];
  byCategory.forEach((items, category) => {
    const featuredItems = items.filter((p) => p.featured);
    if (featuredItems.length === 0) return;
    const cover = featuredItems[0];
    const desc = items.find((p) => p.categoryDesc && p.categoryDesc.trim())?.categoryDesc;
    categories.push({
      category,
      cover,
      desc: desc || `Selección curada de ${category.toLowerCase()}.`,
      count: items.length,
    });
  });
  return categories;
}

/* ============================================================
   Carrusel "abanico/espiral" en perspectiva — inspirado en la galería
   rotatoria de clientes del template de Framer. En vez de WebGL (caro,
   frágil en móviles), usamos tarjetas en perspectiva CSS cuya rotación
   está ligada 1:1 al scroll de la sección (GSAP scrub).

   POR QUÉ NO ES UN ANILLO CERRADO DE 360°: el paso entre tarjetas es
   FIJO en 45° (CARD_ANGLE_STEP), sin importar cuántas tarjetas haya
   — así, aunque pasen los 90° de "perfil total", la referencia de
   Framer nunca llega ahí con sus 5 tarjetas (5 × 45° = 180° de
   recorrido). El radio tampoco depende del total, solo del ángulo fijo.

   POR QUÉ SE VE "EN ESPIRAL" Y NO COMO UN DISCO PLANO (la parte que
   nos costó): el offset vertical de cada tarjeta NO es un valor
   arbitrario por índice — es la proyección NATURAL de inclinar el
   EJE DE ROTACIÓN del anillo, no solo el contenedor visual. Es decir,
   el rotateX(tilt) tiene que ir DENTRO de la cadena de transform de
   cada tarjeta, ANTES del rotateY(angle):

       transform: rotateX(tilt) rotateY(angle) translateZ(radius)

   En vez de aplicar rotateX solo al contenedor padre (que solo gira
   el "marco" de la imagen, pero cada tarjeta sigue centrada a su
   misma altura relativa). Verificado con álgebra de matrices: con
   tilt=18° y radius=320, angle=0 cae en y≈-99 (arriba), angle=90 cae
   en y≈0 (centro), angle=180 cae en y≈+99 (abajo) — una transición
   continua y suave, igual que en la referencia (Manila arriba-
   izquierda, la del medio centrada, la última más abajo-derecha).

   El rotateX vive SOLO en cada tarjeta (no en el contenedor padre del
   anillo) — si se pusiera también en el padre, se duplicaría la
   inclinación y el efecto se exagera/rompe. El padre (ringRef) solo
   recibe el rotateY animado por el scroll.

   POR QUÉ NECESITA "STICKY" (y no solo un scrollTrigger normal):
   Si el carrusel se desplaza libremente con el scroll normal de la
   página, el tiempo que pasa VISIBLE en pantalla y el "carril" de
   scroll que usamos para calcular la rotación son dos cosas
   independientes — casi nunca coinciden. La solución: un WRAPPER con
   altura extendida (el "carril" físico de scroll) + el carrusel en
   position:sticky DENTRO de ese wrapper, con el ScrollTrigger usando
   los bordes exactos del wrapper como start/end.

   IMPORTANTE — overflow-clip, no overflow-hidden: position:sticky deja
   de funcionar correctamente si CUALQUIER ancestro tiene overflow:
   hidden/auto/scroll. Por eso el <section> en Categories() usa
   overflow-clip en vez de overflow-hidden.

   POR QUÉ NO pin:true DE GSAP — un ancestro con "transform" o
   "perspective" puede romper el position:fixed que usa el pin, y
   pin:true agrega un "pin-spacer" que da problemas en móviles.
============================================================ */
const RING_TILT_DEG = 18; // <- inclinación del EJE de rotación (grados en eje X). Este es el número que controla qué tan pronunciada es la espiral: 0 = anillo plano sin espiral; más alto = más diferencia de altura entre la primera y la última tarjeta.
const CARD_ANGLE_STEP = 90; // <- grados entre cada tarjeta. FIJO (no depende del total) para que ninguna tarjeta llegue a verse "de canto".

// Cuántos píxeles de carril (scroll adicional) le tocan a cada tarjeta
// para pasar de una a la siguiente. El carrusel está sticky durante ese
// tramo — sube el número si lo sientes muy rápido, bájalo si lo sientes
// demasiado largo / lento.
const SCROLL_PER_CARD_PX = 290;

function Carousel3D({ categories }) {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const ringRef = useRef(null);

  const total = categories.length;
  // Radio: con el paso fijo de 45° (en vez de 360/total), el radio ya no
  // necesita crecer con el total de categorías -- el "ancho" del abanico
  // depende del ángulo fijo, no de cuántas tarjetas haya.
  const radius = 'clamp(160px, 24vw, 360px)';

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const ring = ringRef.current;
    if (!wrapper || !ring || total <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced) {
      gsap.fromTo(
        ring,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: wrapper, start: 'top 85%', toggleActions: 'play none none none', once: true },
        }
      );
    } else {
      gsap.set(ring, { opacity: 1 });
    }

    if (reduced) return;

    // Rotación total del recorrido: de la primera a la última tarjeta,
    // recorriendo el abanico completo (no 360° -- ver comentario arriba).
    const totalRotation = CARD_ANGLE_STEP * (total - 1);
    const st = gsap.to(ring, {
      rotateY: `-=${totalRotation}`,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6, // <- LÍNEA DE VELOCIDAD: 0 = sigue el scroll 1:1 al instante; números más altos (1.5, 2) suavizan/retrasan el giro.
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      st.scrollTrigger?.kill();
      st.kill();
    };
  }, [total]);

  if (total === 0) return null;

  if (total === 1) {
    const cat = categories[0];
    return (
      <div className="max-w-md mx-auto px-6">
        <CategoryTile cat={cat} />
      </div>
    );
  }

  // Carril físico: 100vh (para que el carrusel pueda quedar clavado a
  // pantalla completa) + el carril de rotación por tarjeta.
  const wrapperHeight = `calc(100vh + ${SCROLL_PER_CARD_PX * total}px)`;

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ height: wrapperHeight }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-clip"
        style={{ perspective: '1100px', perspectiveOrigin: '50% 35%' }}
      >
        <div
          ref={ringRef}
          className="relative"
          style={{
            width: '100%',
            height: 'clamp(320px, 38vw, 460px)',
            transformStyle: 'preserve-3d',
            opacity: 0,
          }}
        >
          {categories.map((cat, i) => {
            const angle = CARD_ANGLE_STEP * i;
            return (
              <div
                key={cat.category}
                className="absolute top-1/2 left-1/2 rounded-[24px] overflow-hidden group cursor-pointer shadow-2xl"
                style={{
                  width: 'min(40vw, 420px)',
                  height: 'min(30vw, 320px)',
                  marginLeft: 'calc(min(40vw, 420px) / -2)',
                  marginTop: 'calc(min(30vw, 320px) / -2)',
                  // rotateX VA PRIMERO (antes de rotateY): así es como se logra
                  // que el offset vertical en pantalla dependa del ángulo de
                  // forma matemáticamente consistente (espiral real, no offsets
                  // arbitrarios por tarjeta). Ver bloque de comentarios arriba.
                  transform: `rotateX(${RING_TILT_DEG}deg) rotateY(${angle}deg) translateZ(${radius})`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <CategoryTile cat={cat} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryTile({ cat }) {
  return (
    <Link to="/tienda" state={{ category: cat.category }} className="block w-full h-full rounded-[24px] overflow-hidden">
      <div className="relative w-full h-full">
        <ProductImage
          src={cat.cover.img}
          alt={cat.category}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallbackClassName="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-peach to-dust"
          fallbackTextClassName="font-display font-semibold text-ink-soft text-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        {/* Marca/categoría superpuesta — eco del logo superpuesto del template */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <span className="text-[0.65rem] uppercase tracking-[0.16em] font-bold text-cream/70 mb-1">
            {cat.count} {cat.count === 1 ? 'pieza' : 'piezas'}
          </span>
          <h3 className="font-display font-semibold text-xl text-white leading-tight">{cat.category}</h3>
        </div>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { products, catalogStatus } = useCart();
  const titleRef = useWordReveal();
  const categories = buildFeaturedCategories(products);

  return (
    <section id="categorias" className="py-28 sm:py-36 bg-gradient-to-b from-transparent via-cream-deep/20 to-transparent overflow-clip">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] font-extrabold text-peach-deep mb-5">
              <span className="w-5 h-px bg-gold" />
              Explora por categoría
            </span>
            <h2
              ref={titleRef}
              className="font-display font-medium text-[clamp(1.9rem,3.6vw,2.7rem)] leading-[1.15] tracking-tight"
            >
              Encuentra tu próxima pieza favorita
            </h2>
          </div>
          <Link
            to="/tienda"
            className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink transition-colors group"
          >
            Ver todo el catálogo
            <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {catalogStatus === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-[24px] skeleton" />
            ))}
          </div>
        )}

        {catalogStatus === 'ready' && categories.length === 0 && (
          <div className="text-center text-ink-soft text-sm py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-deep flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-ink-soft" fill="none">
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 7V5a2 2 0 0 0-4 0v2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            Todavía no hay categorías destacadas. En cuanto se marque un producto como destacado, aparecerá aquí.
          </div>
        )}

        {catalogStatus === 'error' && (
          <div className="text-center text-ink-soft text-sm py-16">
            No pudimos cargar las categorías en este momento.
          </div>
        )}
      </div>

      {/* Fuera del contenedor max-w-[1180px] a propósito: el anillo 3D
          necesita el ancho COMPLETO del viewport para que las tarjetas
          puedan ser grandes y superponerse entre sí (ver comentarios en
          Carousel3D). Si quedara limitado a 1180px, las tarjetas tendrían
          que ser más chicas y el efecto se ve "encajonado" como antes. */}
      {catalogStatus === 'ready' && categories.length > 0 && <Carousel3D categories={categories} />}
    </section>
  );
}
