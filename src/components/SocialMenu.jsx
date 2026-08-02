import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/share/1968iyEpZv/?mibextid=wwXIfr' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bya.ecstore?igsh=b3Nrczh2eGZuZTAx' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@ba.ecstore?_r=1&_t=ZS-98VM5lRTJEz' },
];

function SocialIcon({ name }) {
  if (name === 'share') {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="m8.3 10.9 7.4-4.7M8.3 13.1l7.4 4.7" stroke="currentColor" strokeWidth="1.8" /></svg>;
  }
  if (name === 'facebook') {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.2H7.8V13h2.7v8h3.2Z" /></svg>;
  }
  if (name === 'instagram') {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M14.4 3h3.1c.3 2 1.5 3.5 3.5 3.8v3.1a8.2 8.2 0 0 1-3.5-1.1v6.3a6.1 6.1 0 1 1-5.3-6v3.2a3 3 0 1 0 2.2 2.8V3Z" /></svg>;
}

export default function SocialMenu({ compact = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button ref={triggerRef} type="button" aria-expanded={open} aria-haspopup="menu" aria-label={compact ? 'Abrir redes sociales' : undefined} onClick={() => setOpen((current) => !current)} className={`flex items-center justify-center gap-1.5 rounded-full border border-line bg-white font-bold text-ink-soft outline-none transition-colors hover:border-dust-deep hover:text-ink focus-visible:ring-2 focus-visible:ring-dust-deep focus-visible:ring-offset-2 ${compact ? 'h-11 w-11' : 'min-h-11 px-4 text-sm'}`}>
        {compact ? <SocialIcon name="share" /> : <span>Redes</span>}
        {!compact && <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>}
      </button>
      {open && (
        <div role="menu" aria-label="Redes sociales" className="absolute right-0 z-[230] mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-[0_18px_45px_rgba(16,36,62,0.16)]">
          {SOCIAL_LINKS.map((social) => (
            <a key={social.id} role="menuitem" href={social.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-ink-soft outline-none transition-colors hover:bg-cream-deep hover:text-ink focus-visible:bg-cream-deep focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dust-deep">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-deep text-ink"><SocialIcon name={social.id} /></span>
              {social.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export { SOCIAL_LINKS };
