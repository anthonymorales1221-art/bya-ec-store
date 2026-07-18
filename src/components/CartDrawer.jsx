import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../data/format';
import { DELIVERY_METHODS, PICKUP_ADDRESS_PLACEHOLDER } from '../data/deliveryMethods';
import ProductImage from './ProductImage';

const EASE = [0.16, 1, 0.3, 1];

function QtyControl({ sku, qty, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-cream-deep rounded-full px-1">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => onChange(sku, -1)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-ink-soft hover:bg-white hover:text-ink transition-colors"
      >
        −
      </button>
      <span className="text-sm font-bold w-5 text-center">{qty}</span>
      <button
        type="button"
        aria-label="Sumar"
        onClick={() => onChange(sku, 1)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-ink-soft hover:bg-white hover:text-ink transition-colors"
      >
        +
      </button>
    </div>
  );
}

function CartStep() {
  const { cartItems, changeQty, removeFromCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-ink-soft">
        <span className="text-4xl">🛍️</span>
        <p className="text-sm">
          Tu carrito está vacío.
          <br />
          Elige algo del catálogo para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {cartItems.map((item) => (
        <div key={item.product.sku} className="flex gap-3 items-start">
          <ProductImage
            absolute={false}
            src={item.product.img}
            alt={item.product.name}
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-cream-deep"
            fallbackClassName="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center font-display font-semibold text-ink-soft bg-gradient-to-br from-peach to-dust"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-snug truncate">{item.product.name}</div>
            <div className="text-xs text-ink-soft mb-2">SKU {item.product.sku}</div>
            <QtyControl sku={item.product.sku} qty={item.qty} onChange={changeQty} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-bold text-sm">{formatPrice(item.qty * item.product.price)}</span>
            <button
              type="button"
              aria-label="Quitar"
              onClick={() => removeFromCart(item.product.sku)}
              className="text-ink-soft hover:text-peach-deep transition-colors text-base"
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckoutStep() {
  const { selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder } = useCart();
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', direccion: '', ciudad: '' });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = true;
    if (!form.cedula.trim()) next.cedula = true;
    if (!form.telefono.trim()) next.telefono = true;
    if (!selectedDelivery) next.delivery = true;
    if (selectedMethod?.needsAddress) {
      if (!form.direccion.trim()) next.direccion = true;
      if (!form.ciudad.trim()) next.ciudad = true;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    confirmOrder(form);
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white outline-none transition-colors ${
      errors[field] ? 'border-peach-deep' : 'border-line focus:border-dust-deep'
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Nombre completo</label>
        <input className={inputClass('nombre')} value={form.nombre} onChange={update('nombre')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Cédula</label>
          <input className={inputClass('cedula')} value={form.cedula} onChange={update('cedula')} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Teléfono</label>
          <input className={inputClass('telefono')} value={form.telefono} onChange={update('telefono')} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-2">Método de entrega</label>
        <div className="flex flex-col gap-2">
          {DELIVERY_METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                selectedDelivery === m.value ? 'border-dust-deep bg-dust/10' : 'border-line hover:bg-cream-deep'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={m.value}
                  checked={selectedDelivery === m.value}
                  onChange={() => setSelectedDelivery(m.value)}
                  className="accent-[var(--color-dust-deep)]"
                />
                <span className="text-sm font-medium">{m.label}</span>
              </span>
              <span className="text-xs font-bold text-ink-soft">{m.costLabel}</span>
            </label>
          ))}
        </div>
        {errors.delivery && <p className="text-xs text-peach-deep mt-1.5">Elige un método de entrega.</p>}
      </div>

      {selectedMethod?.isPickup && (
        <p className="text-xs text-ink-soft bg-cream-deep rounded-xl p-3">
          Te confirmaremos la dirección de retiro por WhatsApp: <strong>{PICKUP_ADDRESS_PLACEHOLDER}</strong>
        </p>
      )}

      {selectedMethod?.needsAddress && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Dirección</label>
            <input className={inputClass('direccion')} value={form.direccion} onChange={update('direccion')} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Ciudad</label>
            <input className={inputClass('ciudad')} value={form.ciudad} onChange={update('ciudad')} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        className="w-full bg-ink text-cream rounded-full py-3.5 font-bold text-sm hover:bg-[#1c1c1e] transition-colors flex items-center justify-center gap-2 mt-1"
      >
        Confirmar pedido por WhatsApp
      </button>
    </div>
  );
}

function CostBreakdown() {
  const { cartSubtotal, shippingCost, selectedMethod, checkoutStep, cartTotal } = useCart();
  const isVariable = selectedMethod?.costIsVariable;
  const total = isVariable ? cartSubtotal : cartTotal;

  return (
    <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm">
      <div className="flex justify-between text-ink-soft">
        <span>Subtotal productos</span>
        <span>{formatPrice(cartSubtotal)}</span>
      </div>
      {checkoutStep === 'checkout' && (
        <div className="flex justify-between text-ink-soft">
          <span>Envío{selectedMethod ? ` (${selectedMethod.label})` : ''}</span>
          <span>{selectedMethod ? (isVariable ? selectedMethod.costLabel : formatPrice(shippingCost)) : '—'}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-base pt-1">
        <span>Total</span>
        <span>
          {formatPrice(total)}
          {isVariable ? '*' : ''}
        </span>
      </div>
      {isVariable && <p className="text-[0.7rem] text-ink-soft">*Envío a coordinar directamente por WhatsApp</p>}
    </div>
  );
}

export default function CartDrawer() {
  const { isCartOpen, closeCart, checkoutStep, goToCheckoutStep, goToCartStep, cartItems } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink/40 z-[300]"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-cream z-[310] flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Carrito de compras"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <div>
                <h2 className="font-display font-semibold text-xl">
                  {checkoutStep === 'cart' ? 'Tu pedido' : 'Tus datos de entrega'}
                </h2>
                {checkoutStep === 'checkout' && (
                  <p className="text-xs text-ink-soft mt-1">
                    Se abrirá WhatsApp con tu pedido ya escrito.
                    <br />
                    Solo confirmas el envío y coordinamos el pago.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="text-2xl text-ink-soft hover:text-ink leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {checkoutStep === 'cart' ? <CartStep /> : <CheckoutStep />}
            </div>

            <div className="px-6 py-5 border-t border-line bg-cream">
              <CostBreakdown />
              {checkoutStep === 'cart' ? (
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={goToCheckoutStep}
                  className="w-full mt-4 bg-ink text-cream rounded-full py-3.5 font-bold text-sm hover:bg-[#1c1c1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar con mis datos
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToCartStep}
                  className="w-full mt-4 text-sm font-bold text-ink-soft hover:text-ink transition-colors py-2"
                >
                  ← Volver al carrito
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
