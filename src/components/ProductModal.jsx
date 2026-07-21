import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../data/format';
import ProductImage from './ProductImage';

const EASE = [0.16, 1, 0.3, 1];

export default function ProductModal({ sku, onClose }) {
  const { products, cart, addToCart } = useCart();
  const product = products.find((p) => p.sku === sku);

  if (!product) return null;

  const inCart = cart[sku];
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 4;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 z-[320] flex items-center justify-center p-4"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="bg-cream rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto grid sm:grid-cols-2"
          role="dialog"
          aria-label={product.name}
        >
          <div className="aspect-square sm:aspect-auto sm:h-full bg-cream-deep relative">
            <ProductImage
              absolute
              src={product.img}
              alt={product.name}
              variant="detail"
              className="w-full h-full"
              fallbackClassName="font-display font-semibold text-4xl text-ink-soft"
            />
          </div>

          <div className="p-7 sm:p-8 flex flex-col">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="self-end text-2xl text-ink-soft hover:text-ink leading-none mb-2"
            >
              ×
            </button>
            <span className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-2">{product.category}</span>
            <h2 className="font-display font-semibold text-2xl mb-2">{product.name}</h2>
            <p className="font-bold text-xl mb-3">{formatPrice(product.price)}</p>
            <p className="text-sm mb-4">
              {outOfStock ? (
                <span className="text-peach-deep font-semibold">Agotado</span>
              ) : lowStock ? (
                <span className="text-peach-deep font-semibold">Quedan {product.stock} unidades</span>
              ) : (
                <span className="text-ink-soft">Disponible</span>
              )}
            </p>
            <p className="text-ink-soft text-sm leading-relaxed mb-5">{product.desc}</p>

            {Object.keys(product.specs || {}).length > 0 && (
              <div className="flex flex-col gap-2 mb-6 text-sm">
                {Object.entries(product.specs).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-line pb-2">
                    <span className="text-ink-soft">{label}</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(sku)}
              className={`mt-auto w-full rounded-full py-3.5 font-bold text-sm transition-colors ${
                outOfStock
                  ? 'bg-line text-ink-soft cursor-not-allowed'
                  : inCart
                  ? 'bg-dust-deep text-white'
                  : 'bg-ink text-cream hover:bg-[#1c1c1e]'
              }`}
            >
              {outOfStock ? 'Agotado' : inCart ? `En el carrito (${inCart.qty}) — agregar otro` : 'Agregar al carrito'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
