import { useState } from 'react';

const FAQS = [
  ['¿Realizan envíos a todo Ecuador?', 'Sí. Realizamos envíos nacionales mediante las opciones disponibles en el carrito. También ofrecemos delivery motorizado dentro de Ambato.'],
  ['¿Qué métodos de pago aceptan?', 'Aceptamos transferencia electrónica. El pago en efectivo está disponible únicamente para retiro personal.'],
  ['¿Cómo funciona la compra por WhatsApp?', 'Después de completar el carrito, el botón “Confirmar pedido por WhatsApp” envía el resumen al Asistente virtual B&A para continuar con la confirmación.'],
  ['¿Cómo elijo la transportadora?', 'Durante el carrito puedes seleccionar la opción de entrega disponible que mejor se adapte a tu pedido.'],
  ['¿Qué hago si mi producto presenta una novedad?', 'Comunícate con atención humana dentro de los 3 días posteriores a la entrega para que podamos revisar el caso.'],
];

export default function PremiumFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="ba-faq bg-[var(--ba-warm-white)] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"><div className="ba-faq-heading"><p className="ba-kicker">Resolvemos tus dudas</p><h2 className="ba-section-title mt-4">Preguntas frecuentes</h2></div><div className="ba-faq-list border-t border-[var(--ba-border)]">{FAQS.map(([question, answer], index) => { const expanded = open === index; const id = `faq-answer-${index}`; return <article key={question} className="ba-faq-item border-b border-[var(--ba-border)]"><h3><button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? -1 : index)} className="flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left text-base font-extrabold text-[var(--ba-navy-deep)] sm:text-lg"><span>{question}</span><span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ba-border)] text-xl transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}>+</span></button></h3><div id={id} className={`grid transition-[grid-template-rows,opacity] duration-500 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><p className="max-w-2xl pb-7 text-sm leading-7 text-[var(--ba-muted)] sm:text-base">{answer}</p></div></div></article>; })}</div></div>
    </section>
  );
}
