import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';

export default function Store() {
  const { products } = useCart();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState(location.state?.category || 'Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSku, setOpenSku] = useState(null);

  const categories = useMemo(
    () => ['Todos', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  useEffect(() => {
    document.title = 'Tienda — B&A.Ec Store';
  }, []);

  // Si se llega desde la landing con una categoría preseleccionada (carrusel),
  // se respeta una sola vez al montar.
  useEffect(() => {
    if (location.state?.category) setActiveCategory(location.state.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-3xl mb-2">Catálogo completo</h1>
        <p className="text-ink-soft text-sm">Belleza, tecnología y accesorios importados, listos para coordinar por WhatsApp.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-7">
        <div className="relative flex-1 max-w-sm">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-white border border-line rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-dust-deep"
          />
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative w-full sm:w-72">
          <label htmlFor="store-category" className="sr-only">Categorías</label>
          <select id="store-category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="w-full appearance-none rounded-full border border-line bg-white px-5 py-2.5 pr-11 text-sm font-semibold text-ink outline-none transition-colors focus:border-dust-deep">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <ProductGrid activeCategory={activeCategory} searchQuery={searchQuery} onOpenProduct={setOpenSku} />

      {openSku && <ProductModal sku={openSku} onClose={() => setOpenSku(null)} />}
    </div>
  );
}
