import { Mail, Phone } from 'lucide-react';
import { COMPANY } from '../config/site.js';
import { InstagramIcon } from './Icons.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const iconLink = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 text-gold-300 transition-colors hover:bg-gold-500 hover:text-navy-950';
  return (
    <footer className="border-t border-gold-500/20 bg-navy-950 py-10" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-mist">&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        </div>
        <div className="flex gap-3">
          <a className={iconLink} href={`tel:${COMPANY.phones[0].tel}`} aria-label={`Call ${COMPANY.phones[0].display}`}>
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>
          <a className={iconLink} href={`mailto:${COMPANY.email}`} aria-label="Send an email">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
          <a className={iconLink} href={COMPANY.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram (opens in a new tab)">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
