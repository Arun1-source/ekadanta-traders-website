export function LogoMark({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="#0b1424" stroke="#c9a24b" strokeWidth="2" />
      <path d="M22 17h22M22 32h18M22 47h22M22 17v30" fill="none" stroke="#e8ce85" strokeWidth="5" strokeLinecap="round" />
      <path d="M46 36c0 8-5 13-12 14" fill="none" stroke="#c9a24b" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ onClick }) {
  return (
    <a href="#top" onClick={onClick} className="flex items-center gap-3" aria-label="EKADANTA TRADERS, back to top">
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-xl tracking-[0.14em] text-pearl sm:text-2xl">EKADANTA</span>
        <span className="mt-1 block text-[0.7rem] font-semibold tracking-[0.42em] text-gold-400">TRADERS</span>
      </span>
    </a>
  );
}
