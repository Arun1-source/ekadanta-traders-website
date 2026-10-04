// Brand icons drawn here so the project does not depend on a third-party brand-icon pack.

export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <path d="M3 21l1.7-5.1A9 9 0 1 1 8.2 19.4L3 21z" />
      <path d="M9.2 8.6c-.3 2.9 3 6.2 6 6.2l1.3-1.5-2.1-1.1-.9.8c-.9-.4-1.9-1.3-2.4-2.3l.8-.9-1.1-2.1-1.6.9z" fill="currentColor" stroke="none" />
    </svg>
  );
}
