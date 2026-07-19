import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../hooks/useCart';
import RevealTitle from './RevealTitle';
import ProductImage from './ProductImage';

gsap.registerPlugin(ScrollTrigger);

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
  const stackRef = useRef(null);
  const cardsRef = useRef([]);
  const categories = useMemo(() => curateCategories(products), [products]);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const enabled = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches;
    if (!stack || !cards.length || !enabled) return undefined;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stack,
        start: 'top top+=96',
        end: 'bottom bottom',
        onUpdate: ({ progress }) => {
          const active = Math.min(cards.length - 1, Math.floor(progress * cards.length));
          cards.forEach((card, index) => {
            gsap.set(card, {
              scale: index < active ? 0.975 : 1,
              opacity: index < active ? 0.78 : 1,
            });
          });
        },
      });
    }, stack);
    return () => context.revert();
  }, [catalogStatus]);

  if (catalogStatus === 'error') return null;

  return (
    <section id="categorias" className="bg-[var(--ba-ivory)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 max-w-3xl lg:mb-20">
          <p className="ba-kicker">Explora por categoría</p>
          <RevealTitle className="ba-section-title mt-4">Encuentra algo para cada momento</RevealTitle>
          <p className="ba-section-copy mt-5">Una selección organizada para que descubras rápidamente lo que necesitas.</p>
        </div>

        <div ref={stackRef} className="ba-category-stack">
          {categories.map((category, index) => (
            <article
              key={category.id}
              ref={(element) => { cardsRef.current[index] = element; }}
              className="ba-category-card"
              data-cursor="EXPLORAR"
              style={{ '--category-index': index, zIndex: index + 1 }}
            >
              <div className="grid min-h-[480px] overflow-hidden rounded-[28px] border border-white/10 bg-[var(--ba-navy-deep)] text-white shadow-[0_24px_70px_rgba(9,24,43,0.14)] lg:grid-cols-[0.86fr_1.14fr]">
                <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
                  <span className="font-display text-lg text-[var(--ba-copper-soft)]">/{String(index + 1).padStart(2, '0')}</span>
                  <div className="py-12 lg:py-20">
                    <h3 className="font-display text-4xl font-medium leading-tight sm:text-5xl">{category.title}</h3>
                    <p className="mt-5 max-w-md text-sm leading-7 text-white/68 sm:text-base">{category.description}</p>
                  </div>
                  <Link to="/tienda" state={category.sourceCategory ? { category: category.sourceCategory } : undefined} className="ba-arrow-link w-fit text-white">Explorar categoría <span aria-hidden="true">→</span></Link>
                </div>
                <div className={`ba-category-art ba-category-art--${category.id} relative min-h-[300px] overflow-hidden bg-white/5 lg:min-h-full`}>
                  {category.image && <ProductImage absolute src={category.image} alt="" className="ba-category-image h-full w-full object-cover" fallbackClassName="hidden" />}
                  <span className="ba-category-orbit" aria-hidden="true" />
                  <span className="ba-category-monogram font-display" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ba-navy-deep)]/45 via-transparent to-transparent lg:bg-gradient-to-r" aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
          <div className="ba-category-release" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
