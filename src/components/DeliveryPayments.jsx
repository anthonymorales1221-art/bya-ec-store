import { DELIVERY_METHODS } from '../data/deliveryMethods';

export default function DeliveryPayments() {
  return (
    <section id="entregas" className="bg-[var(--ba-ivory)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><p className="ba-kicker">Entregas y pagos</p><h2 className="ba-section-title mt-4">Recibe tu pedido como prefieras</h2><p className="ba-section-copy mt-5">Las opciones y costos disponibles se confirman dentro del carrito según el tipo de entrega seleccionado.</p></div><div className="grid gap-3 sm:grid-cols-2">{DELIVERY_METHODS.map((method, index) => <article key={method.value} className="group flex min-h-32 items-start gap-4 rounded-2xl border border-[var(--ba-border)] bg-[var(--ba-warm-white)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ba-copper-soft)]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ba-navy)] text-xs font-bold text-white">0{index + 1}</span><div><h3 className="text-sm font-extrabold text-[var(--ba-navy-deep)]">{method.label}</h3><p className="mt-2 text-xs leading-5 text-[var(--ba-muted)]">Disponible para seleccionar dentro del carrito.</p></div></article>)}</div></div>
        <div className="mt-16 border-t border-[var(--ba-border)] pt-12"><h3 className="font-display text-3xl font-medium text-[var(--ba-navy-deep)]">Pagos claros y sin complicaciones</h3><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[var(--ba-navy)] p-6 text-white"><strong className="block text-base">Transferencia electrónica</strong><span className="mt-2 block text-sm text-white/65">Coordinada durante la confirmación del pedido.</span></div><div className="rounded-2xl border border-[var(--ba-border)] bg-[var(--ba-warm-white)] p-6"><strong className="block text-base text-[var(--ba-navy-deep)]">Efectivo al retirar</strong><span className="mt-2 block text-sm text-[var(--ba-muted)]">Disponible únicamente para retiro personal.</span></div></div></div>
      </div>
    </section>
  );
}
