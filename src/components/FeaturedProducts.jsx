import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/format';
import { useCart } from '../hooks/useCart';
import ProductImage from './ProductImage';
import ProductModal from './ProductModal';

export default function FeaturedProducts() {
  const { products, catalogStatus, contactWhatsAppForHelp } = useCart();
  const [openSku, setOpenSku] = useState(null);
  const featured = useMemo(() => {
    const preferred = products.filter((product) => product.featured && product.stock > 0);
    return (preferred.length >= 4 ? preferred : products.filter((product) => product.stock > 0)).slice(0, 8);
  }, [products]);
  if (catalogStatus === 'error' || (catalogStatus === 'ready' && featured.length === 0)) return null;

  const consult = (product) => {
    contactWhatsAppForHelp(`Hola, necesito ayuda con ${product.name} (SKU ${product.sku}) de B&A.EC Store. Estoy viendo ${window.location.href}`);
  };

  return (
    <section id="seleccion" className="overflow-hidden bg-[var(--ba-navy-deep)] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="ba-kicker text-[var(--ba-copper-soft)]">Curaduría B&A</p><h2 className="mt-4 font-display text-5xl font-medium leading-tight sm:text-6xl">Selección destacada</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">Productos elegidos por su utilidad, diseño y aceptación.</p></div>
          <Link to="/tienda" className="ba-arrow-link w-fit text-white">Ver catálogo completo <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className="ba-featured-scroll mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-1240px)/2+2.5rem))] pb-5 sm:gap-7">
        {(catalogStatus === 'loading' ? Array.from({ length: 4 }) : featured).map((product, index) => product ? (
          <article key={product.sku} className="group w-[82vw] max-w-[390px] shrink-0 snap-center overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09]">
            <button type="button" onClick={() => setOpenSku(product.sku)} className="block w-full text-left">
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5"><ProductImage absolute src={product.img} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" fallbackClassName="absolute inset-0 items-center justify-center bg-gradient-to-br from-[var(--ba-navy)] to-[var(--ba-copper)] font-display text-4xl text-white" /><span className="absolute left-5 top-5 rounded-full bg-[var(--ba-warm-white)] px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ba-navy)]">0{index + 1}</span></div>
              <div className="p-6"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ba-copper-soft)]">{product.category}</span><h3 className="mt-2 min-h-12 text-lg font-bold leading-6">{product.name}</h3><div className="mt-5 flex items-center justify-between"><span className="font-display text-2xl">{formatPrice(product.price)}</span><span className="text-sm font-bold">Ver producto →</span></div></div>
            </button>
            <button type="button" onClick={() => consult(product)} className="mx-6 mb-6 text-xs font-bold text-white/65 underline decoration-[var(--ba-copper)] underline-offset-4 transition hover:text-white">Consultar con un asesor</button>
          </article>
        ) : <div key={index} className="aspect-[4/5] w-[82vw] max-w-[390px] shrink-0 animate-pulse rounded-[26px] bg-white/10" />)}
      </div>
      {openSku && <ProductModal sku={openSku} onClose={() => setOpenSku(null)} />}
    </section>
  );
}
