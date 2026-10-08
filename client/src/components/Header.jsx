import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export default function Header({ onEnquire, onShowHome }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  const handleLogoClick = (event) => {
    close();
    if (window.location.pathname.startsWith('/services/')) {
      event.preventDefault();
      onShowHome('top');
    }
  };
  const handleServicesClick = (event) => {
    close();
    if (window.location.pathname.startsWith('/services/')) {
      event.preventDefault();
      onShowHome('services');
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? 'glass border-x-0 border-t-0 bg-navy-950/85' : 'bg-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo onClick={handleLogoClick} />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={link.href === '#services' ? handleServicesClick : close} className="text-sm font-medium text-mist transition-colors hover:text-gold-300">
              {link.label}
            </a>
          ))}
          <button type="button" className="btn-gold !py-2.5" onClick={() => onEnquire('')}>
            ENQUIRE NOW
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gold-500/40 text-gold-300 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="mx-auto flex max-w-6xl flex-col gap-1 px-5 pb-5 md:hidden" aria-label="Mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={link.href === '#services' ? handleServicesClick : close} className="rounded-lg px-3 py-3 text-base font-medium text-pearl hover:bg-white/5">
              {link.label}
            </a>
          ))}
          <button
            type="button"
            className="btn-gold mt-2"
            onClick={() => {
              close();
              onEnquire('');
            }}
          >
            ENQUIRE NOW
          </button>
        </nav>
      )}
    </header>
  );
}
