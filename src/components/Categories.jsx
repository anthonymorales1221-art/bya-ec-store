import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';

function getCategories(products) {
  const grouped = new Map();
  products.forEach((product) => {
    if (!product.category) return;
    const group = grouped.get(product.category) || [];
    group.push(product);
    grouped.set(product.category, group);
  });
  return [...grouped.entries()].map(([category, items]) => {
    const cover = items.find((item) => item.featured && item.img) || items.find((item) => item.img) || items[0];
    return {
      category,
      image: cover?.img,
      description: items.find((item) => item.categoryDesc)?.categoryDesc || `Una selección práctica de ${category.toLowerCase()}.`,
    };
  }).slice(0, 4);
}

export default function Categories() {
  const { products, catalogStatus } = useCart();
  const categories = useMemo(() => getCategories(products), [products]);
  if (catalogStatus === 'error' || (catalogStatus === 'ready' && categories.length === 0)) return null;

  return (
    <section id="categorias" className="bg-[var(--ba-ivory)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 max-w-3xl lg:mb-20">
          <p className="ba-kicker">Explora por categoría</p>
          <h2 className="ba-section-title mt-4">Encuentra algo para cada momento</h2>
          <p className="ba-section-copy mt-5">Una selección organizada para que descubras rápidamente lo que necesitas.</p>
        </div>

        <div className="space-y-6 lg:space-y-10">
          {(catalogStatus === 'loading' ? Array.from({ length: 3 }) : categories).map((category, index) => category ? (
            <article key={category.category} className="ba-category-card lg:sticky" style={{ top: `${88 + index * 16}px`, zIndex: index + 1 }}>
              <div className="grid min-h-[480px] overflow-hidden rounded-[28px] border border-white/10 bg-[var(--ba-navy-deep)] text-white shadow-[0_24px_70px_rgba(9,24,43,0.14)] lg:grid-cols-[0.86fr_1.14fr]">
                <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
                  <span className="font-display text-lg text-[var(--ba-copper-soft)]">/{String(index + 1).padStart(2, '0')}</span>
                  <div className="py-12 lg:py-20">
                    <h3 className="font-display text-4xl font-medium leading-tight sm:text-5xl">{category.category}</h3>
                    <p className="mt-5 max-w-md text-sm leading-7 text-white/68 sm:text-base">{category.description}</p>
                  </div>
                  <Link to="/tienda" state={{ category: category.category }} className="ba-arrow-link w-fit text-white">Explorar categoría <span aria-hidden="true">→</span></Link>
                </div>
                <div className="relative min-h-[300px] overflow-hidden bg-white/5 lg:min-h-full">
                  <ProductImage absolute src={category.image} alt={category.category} className="ba-category-image h-full w-full object-cover" fallbackClassName="absolute inset-0 items-center justify-center bg-gradient-to-br from-[var(--ba-navy)] to-[var(--ba-copper)] font-display text-5xl text-white" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ba-navy-deep)]/45 via-transparent to-transparent lg:bg-gradient-to-r" aria-hidden="true" />
                </div>
              </div>
            </article>
          ) : <div key={index} className="h-[480px] animate-pulse rounded-[28px] bg-[var(--ba-border)]" />)}
        </div>
      </div>
    </section>
  );
}
