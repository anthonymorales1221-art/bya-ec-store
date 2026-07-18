import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../data/format';
import { GRID_BATCH_SIZE } from '../data/config';
import ProductImage from './ProductImage';

function ProductCard({ product, onOpen }) {
  const { cart, addToCart } = useCart();
  const inCart = !!cart[product.sku];
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 4;

  return (
    <div
      className="bg-white rounded-2xl border border-line overflow-hidden cursor-pointer group"
      onClick={() => onOpen(product.sku)}
    >
      <div className="relative aspect-square bg-cream-deep overflow-hidden">
        <span
          className={`absolute top-3 left-3 z-10 text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            outOfStock ? 'bg-ink text-cream' : lowStock ? 'bg-peach-deep text-ink' : 'bg-white/90 text-ink'
          }`}
        >
          {outOfStock ? 'Agotado' : lowStock ? `Quedan ${product.stock}` : 'Disponible'}
        </span>
        <ProductImage
          absolute
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          fallbackClassName="absolute inset-0 items-center justify-center font-display font-semibold text-2xl text-ink-soft bg-gradient-to-br from-peach to-dust"
          fallbackTextClassName=""
        />
      </div>
      <div className="p-4">
        <span className="text-[0.68rem] font-bold uppercase tracking-wide text-ink-soft">{product.category}</span>
        <h3 className="font-semibold text-sm leading-snug mt-1 mb-3 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">{formatPrice(product.price)}</span>
          <button
            type="button"
            disabled={outOfStock}
            aria-label={`Agregar ${product.name} al carrito`}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.sku);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
              outOfStock
                ? 'bg-line text-ink-soft cursor-not-allowed'
                : inCart
                ? 'bg-dust-deep text-white'
                : 'bg-ink text-cream hover:bg-[#1c1c1e]'
            }`}
          >
            {inCart ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ activeCategory, searchQuery, onOpenProduct }) {
  const { products, catalogStatus, reloadCatalog } = useCart();
  const [renderedCount, setRenderedCount] = useState(GRID_BATCH_SIZE);
  const sentinelRef = useRef(null);

  const filtered = useMemo(() => {
    let list = activeCategory === 'Todos' ? products : products.filter((p) => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.category} ${p.sku}`.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, searchQuery]);

  // Reinicia el lote visible cuando cambian filtros/búsqueda/categoría.
  useEffect(() => {
    setRenderedCount(GRID_BATCH_SIZE);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || renderedCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRenderedCount((c) => Math.min(c + GRID_BATCH_SIZE, filtered.length));
          }
        });
      },
      { rootMargin: '600px 0px 600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, renderedCount]);

  if (catalogStatus === 'loading') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-cream-deep animate-pulse" />
        ))}
      </div>
    );
  }

  if (catalogStatus === 'error') {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <p className="text-ink-soft text-sm mb-5">No pudimos cargar el catálogo. Intenta de nuevo.</p>
        <button
          type="button"
          onClick={reloadCatalog}
          className="bg-ink text-cream rounded-full px-6 py-2.5 font-bold text-sm hover:bg-[#1c1c1e]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto text-ink-soft text-sm">
        <span className="text-3xl block mb-3">🔍</span>
        No encontramos nada con "{searchQuery}".
        <br />
        Probá con otra palabra o revisá las categorías.
      </div>
    );
  }

  const visible = filtered.slice(0, renderedCount);

  return (
    <div>
      <p className="text-sm text-ink-soft mb-5">
        <strong className="text-ink">{filtered.length}</strong> producto{filtered.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((p) => (
          <ProductCard key={p.sku} product={p} onOpen={onOpenProduct} />
        ))}
      </div>
      {renderedCount < filtered.length && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
    </div>
  );
}
