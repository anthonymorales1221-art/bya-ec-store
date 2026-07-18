import { useCart } from '../hooks/useCart';
import { BRAND } from '../data/config';

export function WhatsAppFloat() {
  const { contactWhatsAppForHelp } = useCart();
  return (
    <div className="fixed bottom-6 right-6 z-[250] group">
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-ink text-cream text-xs font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        ¿No encuentras lo que buscas?
      </span>
      <button
        type="button"
        onClick={contactWhatsAppForHelp}
        aria-label="¿No encuentras lo que buscas? Chatea con nosotros por WhatsApp"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ background: '#25D366' }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L4 20l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink-soft/[0.04] border-t border-line">
      <div className="max-w-[1180px] mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-peach to-dust flex-shrink-0" />
          <div>
            <p className="font-display font-semibold text-base leading-none">{BRAND.name}</p>
            <p className="text-xs text-ink-soft mt-1">{BRAND.city}</p>
          </div>
        </div>
        <p className="text-xs text-ink-soft text-center sm:text-right">
          © {new Date().getFullYear()} {BRAND.name}. Curado con cariño para mujeres que buscan algo diferente.
        </p>
      </div>
    </footer>
  );
}
