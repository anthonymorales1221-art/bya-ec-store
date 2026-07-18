import { useCart } from '../hooks/useCart';

export default function AfterSales() {
  const { contactWhatsAppForHelp } = useCart();
  return (
    <section id="posventa" className="bg-[var(--ba-ivory)] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[30px] border border-[var(--ba-border)] bg-[var(--ba-warm-white)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-8 sm:p-12 lg:p-16"><p className="ba-kicker">Posventa</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-tight text-[var(--ba-navy-deep)] sm:text-5xl">Estamos contigo después de la compra</h2><p className="mt-6 max-w-2xl text-base leading-8 text-[var(--ba-muted)]">Revisa tu pedido al recibirlo. Si encuentras alguna novedad, comunícate con nosotros dentro de los siguientes 3 días para que podamos revisar tu caso.</p><button type="button" onClick={() => contactWhatsAppForHelp('Hola, necesito reportar una novedad con mi pedido de B&A.EC Store.')} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[var(--ba-navy)] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[var(--ba-navy-deep)]">Reportar una novedad</button></div>
        <div className="relative min-h-[280px] overflow-hidden bg-[var(--ba-navy)]"><img src="/images/hero/ba-ec-hero-premium.png" alt="Detalle visual de B&A.EC Store" width="1672" height="941" loading="lazy" className="h-full w-full object-cover object-right" /><div className="absolute inset-0 bg-[var(--ba-navy-deep)]/16" aria-hidden="true" /></div>
      </div>
    </section>
  );
}
