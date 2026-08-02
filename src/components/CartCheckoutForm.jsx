import { useEffect, useState } from 'react';
import { DELIVERY_METHODS, PICKUP_ADDRESS_PLACEHOLDER } from '../data/deliveryMethods';
import { CASH_PAYMENT, getBankLabel, getPaymentLabel, PAYMENT_BANKS, PAYMENT_METHODS } from '../data/paymentMethods';
import { useCart } from '../hooks/useCart';

export default function CartCheckoutForm() {
  const { selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder } = useCart();
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', direccion: '', ciudad: '', paymentMethod: '', bank: '' });
  const [errors, setErrors] = useState({});
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    setForm((current) => ({
      ...current,
      direccion: selectedMethod?.needsAddress ? current.direccion : '',
      ciudad: selectedMethod?.needsCity ? current.ciudad : '',
      paymentMethod: selectedMethod?.isPickup ? CASH_PAYMENT.value : '',
      bank: '',
    }));
    setErrors((current) => ({ ...current, direccion: false, ciudad: false, paymentMethod: false, bank: false }));
  }, [selectedMethod]);

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = true;
    if (!form.cedula.trim()) next.cedula = true;
    if (!form.telefono.trim()) next.telefono = true;
    if (!selectedDelivery) next.delivery = true;
    if (selectedMethod?.needsAddress && !form.direccion.trim()) next.direccion = true;
    if (selectedMethod?.needsCity && !form.ciudad.trim()) next.ciudad = true;
    if (selectedMethod && !form.paymentMethod) next.paymentMethod = true;
    if (selectedMethod && !selectedMethod.isPickup && !form.bank) next.bank = true;
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
        <label htmlFor="checkout-name" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Nombre completo</label>
        <input id="checkout-name" name="nombre" autoComplete="name" className={inputClass('nombre')} value={form.nombre} onChange={update('nombre')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="checkout-id" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Cédula</label>
          <input id="checkout-id" name="cedula" inputMode="numeric" className={inputClass('cedula')} value={form.cedula} onChange={update('cedula')} />
        </div>
        <div>
          <label htmlFor="checkout-phone" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Teléfono</label>
          <input id="checkout-phone" name="telefono" type="tel" autoComplete="tel" className={inputClass('telefono')} value={form.telefono} onChange={update('telefono')} />
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

      {(selectedMethod?.needsAddress || selectedMethod?.needsCity) && (
        <div className={`grid gap-3 ${selectedMethod.needsAddress && selectedMethod.needsCity ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {selectedMethod.needsCity && (
            <div>
            <label htmlFor="checkout-city" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Ciudad</label>
            <input id="checkout-city" name="ciudad" autoComplete="address-level2" className={inputClass('ciudad')} value={form.ciudad} onChange={update('ciudad')} />
            </div>
          )}
          {selectedMethod.needsAddress && (
            <div>
              <label htmlFor="checkout-address" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Dirección de referencia</label>
              <input id="checkout-address" name="direccion" autoComplete="street-address" className={inputClass('direccion')} value={form.direccion} onChange={update('direccion')} />
            </div>
          )}
        </div>
      )}

      {selectedMethod && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-soft">Métodos de pago</legend>
          {selectedMethod.isPickup ? (
            <div data-payment-mode="cash" className="flex items-center justify-between rounded-xl border border-dust-deep bg-dust/10 px-4 py-3">
              <span className="text-sm font-semibold">Efectivo</span>
              <span className="text-xs font-bold text-ink-soft">Seleccionado automáticamente</span>
            </div>
          ) : (
            <div data-payment-mode="bank" className="contents">
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors ${form.paymentMethod === method.value ? 'border-dust-deep bg-dust/10' : 'border-line bg-white hover:bg-cream-deep'}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={update('paymentMethod')} className="sr-only" />
                    {method.label}
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-xs text-peach-deep">Elige transferencia o depósito.</p>}

              {form.paymentMethod && <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Banco</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_BANKS.map((bank) => (
                    <label key={bank.value} className={`flex min-h-32 min-w-0 cursor-pointer flex-col items-center justify-between gap-2 rounded-xl border bg-white p-3 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-dust-deep ${form.bank === bank.value ? 'border-dust-deep bg-dust/10 ring-1 ring-dust-deep' : 'border-line hover:bg-cream-deep'}`}>
                      <input type="radio" name="bank" value={bank.value} checked={form.bank === bank.value} onChange={update('bank')} className="sr-only" />
                      <span className="flex h-12 w-full items-center justify-center overflow-hidden">
                        <img src={bank.logo} alt={`Logo de ${bank.label}`} width={bank.logoWidth} height={bank.logoHeight} className={`shrink-0 object-contain ${bank.logoClassName}`} />
                      </span>
                      <span className="text-xs font-semibold">{bank.label}</span>
                    </label>
                  ))}
                </div>
                {errors.bank && <p className="mt-1.5 text-xs text-peach-deep">Elige el banco para continuar.</p>}
              </div>}
              <p className="text-xs leading-5 text-ink-soft">Los datos bancarios se compartirán durante la atención por WhatsApp.</p>
            </div>
          )}
        </fieldset>
      )}

      <button
        type="button"
        onClick={() => validate() && confirmOrder(form, {
          methodLabel: getPaymentLabel(form.paymentMethod),
          bankLabel: getBankLabel(form.bank),
        })}
        className="w-full bg-ink text-cream rounded-full py-3.5 font-bold text-sm hover:bg-[#1c1c1e] transition-colors flex items-center justify-center gap-2 mt-1"
      >
        Confirmar pedido por WhatsApp
      </button>
    </div>
  );
}
