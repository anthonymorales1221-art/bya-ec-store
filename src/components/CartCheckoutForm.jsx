import { useEffect, useState } from 'react';
import { DELIVERY_METHODS } from '../data/deliveryMethods';
import { getBankLabel, getPaymentLabel, getPaymentOptions, methodRequiresBank, PAYMENT_BANKS } from '../data/paymentMethods';
import { useCart } from '../hooks/useCart';

export default function CartCheckoutForm() {
  const { selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder } = useCart();
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', direccion: '', referencia: '', ciudad: '', paymentMethod: '', bank: '' });
  const [errors, setErrors] = useState({});
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    setForm((current) => ({
      ...current,
      direccion: selectedMethod?.needsAddress ? current.direccion : '',
      referencia: selectedMethod?.needsReference ? current.referencia : '',
      ciudad: selectedMethod?.needsCity ? current.ciudad : '',
      paymentMethod: '',
      bank: '',
    }));
    setErrors((current) => ({ ...current, direccion: false, referencia: false, ciudad: false, paymentMethod: false, bank: false }));
  }, [selectedMethod]);

  const paymentOptions = getPaymentOptions(selectedMethod);
  const requiresBank = methodRequiresBank(selectedMethod, form.paymentMethod);
  const updatePayment = (event) => {
    const paymentMethod = event.target.value;
    setForm((current) => ({
      ...current,
      paymentMethod,
      bank: methodRequiresBank(selectedMethod, paymentMethod) ? current.bank : '',
    }));
    setErrors((current) => ({ ...current, paymentMethod: false, bank: false }));
  };

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = true;
    if (!form.cedula.trim()) next.cedula = true;
    if (!form.telefono.trim()) next.telefono = true;
    if (!selectedDelivery) next.delivery = true;
    if (selectedMethod?.needsAddress && !form.direccion.trim()) next.direccion = true;
    if (selectedMethod?.needsReference && !form.referencia.trim()) next.referencia = true;
    if (selectedMethod?.needsCity && !form.ciudad.trim()) next.ciudad = true;
    if (paymentOptions.length > 0 && !form.paymentMethod) next.paymentMethod = true;
    if (requiresBank && !form.bank) next.bank = true;
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
              className={`grid min-h-12 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border px-3 py-3 transition-colors sm:gap-3 sm:px-4 ${
                selectedDelivery === method.value ? 'border-dust-deep bg-dust/10' : 'border-line hover:bg-cream-deep'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={method.value}
                checked={selectedDelivery === method.value}
                onChange={() => setSelectedDelivery(method.value)}
                className="shrink-0 accent-[var(--color-dust-deep)]"
              />
              <span className="min-w-0 text-sm font-medium leading-snug">{method.label}</span>
              <span className="whitespace-nowrap text-right text-xs font-bold text-ink-soft">{method.costLabel}</span>
            </label>
          ))}
        </div>
        {errors.delivery && <p className="text-xs text-peach-deep mt-1.5">Elige un método de entrega.</p>}
      </div>

      {selectedMethod?.isPickup && (
        <p className="text-xs text-ink-soft bg-cream-deep rounded-xl p-3">
          {selectedMethod.checkoutNote}
        </p>
      )}

      {selectedMethod?.value === 'delivery_ambato' && (
        <p className="rounded-xl bg-cream-deep p-3 text-xs leading-5 text-ink-soft">{selectedMethod.checkoutNote}</p>
      )}

      {(selectedMethod?.needsAddress || selectedMethod?.needsCity || selectedMethod?.needsReference) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {selectedMethod.needsCity && (
            <div>
            <label htmlFor="checkout-city" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Ciudad</label>
            <input id="checkout-city" name="ciudad" autoComplete="address-level2" className={inputClass('ciudad')} value={form.ciudad} onChange={update('ciudad')} />
            </div>
          )}
          {selectedMethod.needsAddress && (
            <div>
              <label htmlFor="checkout-address" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Dirección</label>
              <input id="checkout-address" name="direccion" autoComplete="street-address" className={inputClass('direccion')} value={form.direccion} onChange={update('direccion')} />
            </div>
          )}
          {selectedMethod.needsReference && (
            <div className={selectedMethod.needsCity && selectedMethod.needsAddress ? 'sm:col-span-2' : ''}>
              <label htmlFor="checkout-reference" className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">Referencia</label>
              <input id="checkout-reference" name="referencia" autoComplete="off" placeholder="Ej. cerca de un lugar conocido" className={inputClass('referencia')} value={form.referencia} onChange={update('referencia')} />
            </div>
          )}
        </div>
      )}

      {selectedMethod && paymentOptions.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-soft">Métodos de pago</legend>
            <div data-payment-mode={requiresBank ? 'bank' : 'direct'} className="contents">
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((method) => (
                  <label key={method.value} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors ${form.paymentMethod === method.value ? 'border-dust-deep bg-dust/10' : 'border-line bg-white hover:bg-cream-deep'}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={updatePayment} className="sr-only" />
                    {method.label}
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-xs text-peach-deep">Elige un método de pago.</p>}

              {requiresBank && <div>
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
        </fieldset>
      )}

      <button
        type="button"
        onClick={() => validate() && confirmOrder(form, {
          value: form.paymentMethod,
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
