import { useState } from 'react';
import { DELIVERY_METHODS, PICKUP_ADDRESS_PLACEHOLDER } from '../data/deliveryMethods';
import { useCart } from '../hooks/useCart';

export default function CartCheckoutForm() {
  const { selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder } = useCart();
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', direccion: '', ciudad: '' });
  const [errors, setErrors] = useState({});
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

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
          {DELIVERY_METHODS.map((method) => (
            <label
              key={method.value}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                selectedDelivery === method.value ? 'border-dust-deep bg-dust/10' : 'border-line hover:bg-cream-deep'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.value}
                  checked={selectedDelivery === method.value}
                  onChange={() => setSelectedDelivery(method.value)}
                  className="accent-[var(--color-dust-deep)]"
                />
                <span className="text-sm font-medium">{method.label}</span>
              </span>
              <span className="text-xs font-bold text-ink-soft">{method.costLabel}</span>
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
        onClick={() => validate() && confirmOrder(form)}
        className="w-full bg-ink text-cream rounded-full py-3.5 font-bold text-sm hover:bg-[#1c1c1e] transition-colors flex items-center justify-center gap-2 mt-1"
      >
        Confirmar pedido por WhatsApp
      </button>
    </div>
  );
}
