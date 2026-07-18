const BENEFITS = [
  { title: 'Envíos nacionales', detail: 'Cita Express, Tramaco y Servientrega.', icon: 'package' },
  { title: 'Entrega local', detail: 'Delivery motorizado dentro de Ambato.', icon: 'pin' },
  { title: 'Compra asistida', detail: 'Atención antes y durante tu pedido.', icon: 'chat' },
  { title: 'Pago sencillo', detail: 'Transferencia o efectivo al retirar.', icon: 'card' },
];

function BenefitIcon({ name }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'pin') return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" {...common} /><circle cx="12" cy="10" r="2.5" {...common} /></svg>;
  if (name === 'chat') return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8Z" {...common} /><path d="M8 9h8M8 13h5" {...common} /></svg>;
  if (name === 'card') return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" {...common} /><path d="M3 10h18M7 15h3" {...common} /></svg>;
  return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" {...common} /><path d="m4 7 8 4 8-4M12 11v10" {...common} /></svg>;
}

export default function TrustStrip() {
  return (
    <section aria-label="Beneficios de compra" className="border-y border-[var(--ba-border)] bg-[var(--ba-warm-white)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-10">
        {BENEFITS.map((benefit, index) => (
          <div key={benefit.title} className={`flex gap-3 px-2 py-6 sm:px-5 sm:py-7 lg:px-6 ${index % 2 ? 'border-l border-[var(--ba-border)]' : ''} ${index > 1 ? 'border-t border-[var(--ba-border)] lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}>
            <span className="shrink-0 text-[var(--ba-copper)]"><BenefitIcon name={benefit.icon} /></span>
            <div>
              <h2 className="text-sm font-extrabold text-[var(--ba-navy-deep)]">{benefit.title}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--ba-muted)] sm:text-[0.8rem]">{benefit.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
